import httpx
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from app.middleware.auth import get_current_user
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Convert audio to text using Deepgram."""
    if not settings.deepgram_api_key:
        raise HTTPException(status_code=503, detail="Speech-to-text not configured")

    audio_bytes = await audio.read()

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true&punctuate=true",
            headers={
                "Authorization": f"Token {settings.deepgram_api_key}",
                "Content-Type": audio.content_type or "audio/webm",
            },
            content=audio_bytes,
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Transcription failed")

    data = resp.json()
    try:
        transcript = data["results"]["channels"][0]["alternatives"][0]["transcript"]
    except (KeyError, IndexError):
        transcript = ""

    return {"transcript": transcript}


@router.post("/speak")
async def speak(
    body: dict,
    user: dict = Depends(get_current_user),
):
    """Convert text to speech using Deepgram Aura TTS with calm, empathic voice."""
    if not settings.deepgram_api_key:
        raise HTTPException(status_code=503, detail="Text-to-speech not configured")

    text = body.get("text", "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")

    # Truncate very long responses for TTS
    if len(text) > 800:
        text = text[:800] + "…"

    async def generate():
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                logger.info(f"TTS Request: model=aura-luna-en, text_len={len(text)}")
                async with client.stream(
                    "POST",
                    "https://api.deepgram.com/v1/speak?model=aura-asteria-en",
                    headers={
                        "Authorization": f"Token {settings.deepgram_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={"text": text},
                ) as resp:
                    logger.info(f"TTS Response: status={resp.status_code}")
                    if resp.status_code != 200:
                        error_text = await resp.atext()
                        logger.error(f"Deepgram TTS error {resp.status_code}: {error_text}")
                        return
                    async for chunk in resp.aiter_bytes(4096):
                        yield chunk
        except Exception as e:
            logger.error(f"TTS exception: {str(e)}", exc_info=True)

    return StreamingResponse(
        generate(),
        media_type="audio/mpeg",
        headers={"Cache-Control": "no-cache"},
    )
