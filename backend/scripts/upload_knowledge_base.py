#!/usr/bin/env python3
"""
Upload knowledge base documents to Supabase with embeddings.
Run after creating the knowledge_base migration.
"""

import os
import sys
import glob
from pathlib import Path
from openai import OpenAI
from supabase import create_client
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY]):
    print("❌ Missing environment variables: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

oai = OpenAI(api_key=OPENAI_API_KEY)
sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

EMBED_MODEL = "text-embedding-3-small"
KB_DIR = Path(__file__).parent.parent.parent / "knowledge-base"

# Domain mapping
DOMAIN_MAP = {
    "crisis": "school_bullying",  # Crisis guides apply to all domains
    "school": "school_bullying",
    "heartbreak": "heartbreak",
    "family": "domestic",
    "financial": "financial",
    "workplace": "workplace",
}


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> list[str]:
    """Split text into overlapping chunks."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i : i + chunk_size]
        chunks.append(" ".join(chunk_words))
        i += chunk_size - overlap
    return chunks


def get_embedding(text: str) -> list[float]:
    """Get embedding from OpenAI."""
    try:
        response = oai.embeddings.create(model=EMBED_MODEL, input=text)
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Embedding failed: {e}")
        return None


def process_file(filepath: Path) -> list[dict]:
    """Read markdown file and return chunks with metadata."""
    try:
        with open(filepath, "r") as f:
            content = f.read()

        # Extract title from first heading
        lines = content.split("\n")
        title = "Untitled"
        for line in lines:
            if line.startswith("# "):
                title = line.replace("# ", "").strip()
                break

        # Get domain from folder
        domain_folder = filepath.parent.name
        domain = DOMAIN_MAP.get(domain_folder, "school_bullying")

        # Split into chunks
        chunks = chunk_text(content)

        records = []
        for i, chunk_text_content in enumerate(chunks):
            # Skip very small chunks
            if len(chunk_text_content.split()) < 20:
                continue

            embedding = get_embedding(chunk_text_content)
            if not embedding:
                continue

            records.append({
                "document_name": str(filepath.relative_to(KB_DIR)),
                "domain": domain,
                "content": chunk_text_content,
                "embedding": embedding,
            })

        return records

    except Exception as e:
        logger.error(f"Error processing {filepath}: {e}")
        return []


def main():
    if not KB_DIR.exists():
        print(f"❌ Knowledge base directory not found: {KB_DIR}")
        sys.exit(1)

    # Find all markdown files
    md_files = list(KB_DIR.glob("**/*.md"))
    md_files = [f for f in md_files if f.name != "README.md"]

    if not md_files:
        print(f"❌ No markdown files found in {KB_DIR}")
        sys.exit(1)

    print(f"📚 Found {len(md_files)} documents")

    # Process files and collect records
    all_records = []
    for filepath in md_files:
        print(f"📖 Processing {filepath.relative_to(KB_DIR)}...")
        records = process_file(filepath)
        all_records.extend(records)
        print(f"   ✓ {len(records)} chunks")

    if not all_records:
        print("❌ No chunks to upload")
        sys.exit(1)

    print(f"\n📤 Uploading {len(all_records)} chunks to Supabase...")

    # Delete existing chunks
    try:
        sb.table("knowledge_chunks").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        logger.info("Deleted existing chunks")
    except Exception as e:
        logger.warning(f"Could not delete existing chunks: {e}")

    # Upload in batches
    batch_size = 10
    for i in range(0, len(all_records), batch_size):
        batch = all_records[i : i + batch_size]
        try:
            sb.table("knowledge_chunks").insert(batch).execute()
            print(f"   ✓ Uploaded {min(batch_size, len(all_records) - i)} chunks")
        except Exception as e:
            logger.error(f"Batch upload failed: {e}")
            return 1

    print(f"\n✅ Successfully uploaded {len(all_records)} chunks!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
