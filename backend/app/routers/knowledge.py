import io
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.middleware.auth import get_current_user
from app.config import settings
from supabase import create_client
from openai import OpenAI

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/knowledge", tags=["knowledge"])
supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)

ADMIN_EMAILS = {"arinrjain@gmail.com", "rinishjain@yahoo.com"}
CHUNK_SIZE = 800
CHUNK_OVERLAP = 100


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("email") not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def _chunk_text(text: str) -> list[str]:
    words = text.split()
    chunks, i = [], 0
    while i < len(words):
        chunk = " ".join(words[i:i + CHUNK_SIZE]).strip()
        if len(chunk) > 50:
            chunks.append(chunk)
        i += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


def _extract_text(content: bytes, filename: str) -> str:
    ext = filename.lower().rsplit(".", 1)[-1]
    if ext == "pdf":
        import pdfplumber
        text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text += t + "\n\n"
        return text
    elif ext in ("txt", "md"):
        return content.decode("utf-8", errors="ignore")
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}. Use PDF, TXT or MD.")


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    domain: str = Form(default="all"),
    user: dict = Depends(require_admin),
):
    if not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="OpenAI API key not configured")

    content = await file.read()
    filename = file.filename or "document.txt"

    text = _extract_text(content, filename)
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from document")

    chunks = _chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=400, detail="Document too short")

    # Embed all chunks
    oai = OpenAI(api_key=settings.openai_api_key)
    all_embeddings = []
    batch_size = 50
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        resp = oai.embeddings.create(model="text-embedding-3-small", input=batch)
        all_embeddings.extend([r.embedding for r in resp.data])

    # Save to Supabase
    domain_val = None if domain == "all" else domain
    rows = [
        {"document_name": filename, "domain": domain_val, "content": chunk, "embedding": emb}
        for chunk, emb in zip(chunks, all_embeddings)
    ]
    for i in range(0, len(rows), 20):
        supabase.table("knowledge_chunks").insert(rows[i:i + 20]).execute()

    logger.info(f"Ingested {filename}: {len(chunks)} chunks, domain={domain}")
    return {"document": filename, "chunks": len(chunks), "domain": domain}


@router.get("/documents")
def list_documents(user: dict = Depends(require_admin)):
    result = supabase.table("knowledge_chunks").select(
        "document_name, domain, created_at"
    ).execute()

    docs: dict = {}
    for row in (result.data or []):
        name = row["document_name"]
        if name not in docs:
            docs[name] = {"domain": row["domain"] or "all", "chunks": 0, "created_at": row["created_at"]}
        docs[name]["chunks"] += 1

    return [{"name": k, **v} for k, v in docs.items()]


@router.delete("/documents/{document_name}")
def delete_document(document_name: str, user: dict = Depends(require_admin)):
    result = supabase.table("knowledge_chunks").delete().eq("document_name", document_name).execute()
    return {"deleted": document_name, "chunks_removed": len(result.data or [])}
