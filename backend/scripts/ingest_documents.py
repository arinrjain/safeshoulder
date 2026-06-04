#!/usr/bin/env python3
"""
SafeShoulder Knowledge Base Ingestion Script

Usage:
  python scripts/ingest_documents.py --file path/to/doc.pdf --domain workplace
  python scripts/ingest_documents.py --file path/to/doc.txt --domain all
  python scripts/ingest_documents.py --list   # show all ingested documents
  python scripts/ingest_documents.py --delete "document_name.pdf"

Domains: school_bullying | heartbreak | domestic | financial | workplace | all (applies to all)
"""

import sys
import os
import argparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
from supabase import create_client
from openai import OpenAI

sb = create_client(settings.supabase_url, settings.supabase_service_role_key)
oai = OpenAI(api_key=settings.openai_api_key)

CHUNK_SIZE = 800
CHUNK_OVERLAP = 100
EMBED_MODEL = "text-embedding-3-small"


def extract_text(file_path: str) -> str:
    ext = file_path.lower().split(".")[-1]

    if ext == "pdf":
        import pdfplumber
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
        return text

    elif ext in ("txt", "md"):
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()

    elif ext == "docx":
        try:
            import docx
            doc = docx.Document(file_path)
            return "\n\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        except ImportError:
            print("Install python-docx: pip install python-docx")
            sys.exit(1)

    else:
        print(f"Unsupported file type: {ext}")
        sys.exit(1)


def chunk_text(text: str) -> list[str]:
    """Split text into overlapping chunks."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i:i + CHUNK_SIZE]
        chunk = " ".join(chunk_words)
        if len(chunk.strip()) > 50:  # skip tiny chunks
            chunks.append(chunk.strip())
        i += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


def embed(texts: list[str]) -> list[list[float]]:
    """Embed a batch of texts using OpenAI."""
    response = oai.embeddings.create(model=EMBED_MODEL, input=texts)
    return [r.embedding for r in response.data]


def ingest(file_path: str, domain: str | None):
    doc_name = os.path.basename(file_path)
    domain_val = None if domain == "all" else domain

    print(f"📄 Reading {doc_name}...")
    text = extract_text(file_path)
    print(f"   Extracted {len(text):,} characters")

    print(f"✂️  Chunking...")
    chunks = chunk_text(text)
    print(f"   Created {len(chunks)} chunks")

    print(f"🔢 Embedding (batches of 50)...")
    all_embeddings = []
    batch_size = 50
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        embeddings = embed(batch)
        all_embeddings.extend(embeddings)
        print(f"   Embedded {min(i + batch_size, len(chunks))}/{len(chunks)}")

    print(f"💾 Saving to Supabase...")
    rows = []
    for chunk, embedding in zip(chunks, all_embeddings):
        rows.append({
            "document_name": doc_name,
            "domain": domain_val,
            "content": chunk,
            "embedding": embedding,
        })

    # Insert in batches of 20
    for i in range(0, len(rows), 20):
        sb.table("knowledge_chunks").insert(rows[i:i + 20]).execute()

    print(f"✅ Done! Ingested '{doc_name}' → {len(chunks)} chunks (domain: {domain or 'all'})")


def list_documents():
    result = sb.table("knowledge_chunks").select("document_name, domain, created_at").execute()
    if not result.data:
        print("No documents ingested yet.")
        return

    # Group by document
    docs: dict = {}
    for row in result.data:
        name = row["document_name"]
        if name not in docs:
            docs[name] = {"domain": row["domain"] or "all", "chunks": 0, "created_at": row["created_at"]}
        docs[name]["chunks"] += 1

    print(f"\n{'Document':<40} {'Domain':<20} {'Chunks':<8} {'Ingested'}")
    print("-" * 85)
    for name, info in docs.items():
        print(f"{name:<40} {info['domain']:<20} {info['chunks']:<8} {info['created_at'][:10]}")
    print(f"\nTotal: {len(docs)} documents, {len(result.data)} chunks")


def delete_document(doc_name: str):
    result = sb.table("knowledge_chunks").delete().eq("document_name", doc_name).execute()
    print(f"✅ Deleted '{doc_name}' ({len(result.data)} chunks removed)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SafeShoulder Knowledge Base Ingestion")
    parser.add_argument("--file", help="Path to document (PDF, TXT, MD, DOCX)")
    parser.add_argument("--domain", default="all",
                        choices=["school_bullying", "heartbreak", "domestic", "financial", "workplace", "all"],
                        help="Domain this document applies to (default: all)")
    parser.add_argument("--list", action="store_true", help="List all ingested documents")
    parser.add_argument("--delete", help="Delete a document by name")

    args = parser.parse_args()

    if args.list:
        list_documents()
    elif args.delete:
        delete_document(args.delete)
    elif args.file:
        if not os.path.exists(args.file):
            print(f"File not found: {args.file}")
            sys.exit(1)
        ingest(args.file, args.domain)
    else:
        parser.print_help()
