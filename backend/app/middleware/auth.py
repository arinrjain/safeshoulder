import httpx
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from jose.backends import ECKey
from app.config import settings

bearer = HTTPBearer()

_jwks_cache: dict = {}


def _get_jwks() -> dict:
    if _jwks_cache:
        return _jwks_cache
    url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
    resp = httpx.get(url, timeout=10)
    resp.raise_for_status()
    _jwks_cache.update(resp.json())
    return _jwks_cache


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    token = credentials.credentials

    # Try asymmetric (ES256) via JWKS first
    try:
        jwks = _get_jwks()
        header = jwt.get_unverified_header(token)
        key_id = header.get("kid")
        alg = header.get("alg", "HS256")

        if alg.startswith("ES") or alg.startswith("RS"):
            matching = [k for k in jwks.get("keys", []) if k.get("kid") == key_id]
            if not matching:
                raise HTTPException(status_code=401, detail="No matching JWK found")
            from jose.utils import base64url_decode
            from cryptography.hazmat.primitives.asymmetric.ec import EllipticCurvePublicKey
            payload = jwt.decode(
                token,
                matching[0],
                algorithms=[alg],
                audience="authenticated",
            )
            return {"user_id": payload["sub"], "email": payload.get("email", "")}
    except HTTPException:
        raise
    except Exception:
        pass

    # Fallback: symmetric HS256 with legacy JWT secret
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return {"user_id": payload["sub"], "email": payload.get("email", "")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
