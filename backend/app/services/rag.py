import logging
from openai import OpenAI
from app.config import settings
from supabase import create_client

logger = logging.getLogger(__name__)

_oai_client: OpenAI | None = None
_sb_client = None
EMBED_MODEL = "text-embedding-3-small"


def _get_oai():
    global _oai_client
    if _oai_client is None and settings.openai_api_key:
        _oai_client = OpenAI(api_key=settings.openai_api_key)
    return _oai_client


def _get_sb():
    global _sb_client
    if _sb_client is None:
        _sb_client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _sb_client


def retrieve(user_message: str, domain: str, top_k: int = 3) -> str:
    """
    Embed user message, find top_k relevant knowledge chunks, return as formatted string.
    Returns empty string if RAG is unavailable or no results found.
    """
    oai = _get_oai()
    if not oai:
        return ""

    try:
        # Embed the user message
        resp = oai.embeddings.create(model=EMBED_MODEL, input=user_message)
        query_vector = resp.data[0].embedding

        # Query Supabase for similar chunks
        sb = _get_sb()
        results = sb.rpc("match_chunks", {
            "query_embedding": query_vector,
            "match_domain": domain,
            "match_count": top_k,
        }).execute()

        if not results.data:
            return ""

        # Filter by minimum similarity threshold
        relevant = [r for r in results.data if r.get("similarity", 0) > 0.35]
        if not relevant:
            return ""

        chunks = [r["content"] for r in relevant]
        context = "\n\n---\n\n".join(chunks)

        logger.info(f"RAG: found {len(relevant)} relevant chunks for domain={domain}")
        return context

    except Exception as e:
        logger.warning(f"RAG retrieval failed: {e}")
        return ""
