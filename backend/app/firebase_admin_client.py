from dataclasses import dataclass
import json
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import firebase_admin
from firebase_admin import auth as fb_auth, credentials, firestore

if not firebase_admin._apps:
    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if service_account_json:
        cred = credentials.Certificate(json.loads(service_account_json))
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()

db = firestore.client()
bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class AuthenticatedPioneer:
    uid: str
    username: str
    role: str


def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> AuthenticatedPioneer:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Pi/Firebase bearer token.",
        )
    try:
        decoded = fb_auth.verify_id_token(credentials.credentials)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token. Please sign in with Pi again.",
        )

    uid = decoded.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid token payload.")

    return AuthenticatedPioneer(
        uid=uid,
        username=decoded.get("pi_username", "Pioneer"),
        role=decoded.get("role", "pioneer"),
    )


def require_moderator(
    pioneer: AuthenticatedPioneer = Depends(verify_firebase_token),
) -> AuthenticatedPioneer:
    if pioneer.role not in ("moderator", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Moderator privileges required.",
        )
    return pioneer
