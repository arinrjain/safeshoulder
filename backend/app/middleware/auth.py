import httpx
import logging
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config import settings
from app.utils.blocked import is_email_blocked

logger = logging.getLogger(__name__)
bearer = HTTPBearer()

_jwks_cache: dict = {}


def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache.get("keys"):
        return _jwks_cache
    url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
    try:
        resp = httpx.get(url, timeout=10)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        logger.info(f"JWKS loaded: {len(_jwks_cache.get('keys', []))} keys")
    except Exception as e:
        logger.error(f"Failed to fetch JWKS: {e}")
    return _jwks_cache


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    token = credentials.credentials

    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "HS256")
        key_id = header.get("kid")
        logger.debug(f"Token alg={alg} kid={key_id}")

        if alg.startswith("ES") or alg.startswith("RS"):
            # Asymmetric — verify via JWKS
            jwks = _get_jwks()
            matching = [k for k in jwks.get("keys", []) if k.get("kid") == key_id]

            if not matching:
                # Refresh JWKS cache and retry once
                _jwks_cache.clear()
                jwks = _get_jwks()
                matching = [k for k in jwks.get("keys", []) if k.get("kid") == key_id]

            if not matching:
                logger.error(f"No JWK found for kid={key_id}")
                raise HTTPException(status_code=401, detail="No matching JWK found")

            payload = jwt.decode(
                token,
                matching[0],
                algorithms=[alg],
                audience="authenticated",
            )
            email = payload.get("email", "")
            user_id = payload["sub"]
            user_metadata = payload.get("user_metadata", {})

        else:
            # Symmetric HS256 — legacy JWT secret
            payload = jwt.decode(
                token,
                settings.jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
            )
            email = payload.get("email", "")
            user_id = payload["sub"]
            user_metadata = payload.get("user_metadata", {})

        # Check if user's email is blocked
        if email and is_email_blocked(email):
            logger.warning(f"Blocked user attempted access: {email}")
            raise HTTPException(status_code=403, detail="Your account has been blocked. Contact support.")

        return {"user_id": user_id, "email": email, "user_metadata": user_metadata}

    except HTTPException:
        raise
    except JWTError as e:
        logger.error(f"JWT error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")
