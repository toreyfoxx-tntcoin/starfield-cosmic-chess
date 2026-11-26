from fastapi import HTTPException, status
from firebase_admin import auth as fb_auth, firestore
import httpx

from app.config import settings
from app.firebase_admin_client import db


async def verify_pi_access_token(access_token: str) -> dict:
    """
    Verifies a Pi Browser access token server-to-server against Pi Platform API /v2/me.
    Never trusts client-reported UIDs or usernames.
    """
    if not access_token or len(access_token) < 10:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Pi access token.",
        )

    # Strictly disabled in staging/production; convenience only for local pytest/dev
    if settings.env == "local" and access_token.startswith("LOCAL_DEV_"):
        handle = access_token.replace("LOCAL_DEV_", "") or "LocalPioneer"
        return {"uid": f"local_{handle.lower()}", "username": handle}

    url = f"{settings.pi_api_base_url.rstrip('/')}/v2/me"
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(
                url,
                headers={"Authorization": f"Bearer {access_token}"},
            )
    except httpx.HTTPError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to reach Pi Platform API for verification.",
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Pi Authentication token verification failed.",
        )

    data = resp.json()
    uid = data.get("uid")
    username = data.get("username")
    if not uid or not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incomplete Pi user profile returned.",
        )
    return {"uid": uid, "username": username}


def upsert_pioneer_and_mint_token(pi_uid: str, username: str) -> tuple[str, dict]:
    user_ref = db.collection("users").document(pi_uid)
    snap = user_ref.get()

    if snap.exists:
        profile = snap.to_dict() or {}
        mod_status = (profile.get("moderation") or {}).get("status", "active")
        if mod_status == "suspended":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This Commander account is currently suspended under Community Rules.",
            )
        user_ref.update(
            {
                "username": username,
                "last_login_at": firestore.SERVER_TIMESTAMP,
            }
        )
        profile["username"] = username
    else:
        profile = {
            "pi_uid": pi_uid,
            "username": username,
            "faction": None,
            "commander_rank": "Cadet",
            "role": "pioneer",
            "stats": {
                "games_completed": 0,
                "wins": 0,
                "losses": 0,
                "draws": 0,
                "completion_rate": 1.0,
                "sportsmanship_points": 0,
                "daily_signal_streak": 0,
            },
            "badges": ["verified_pioneer"],
            "muted_users": [],
            "moderation": {
                "status": "active",
                "muted_until": None,
                "warning_count": 0,
            },
            "created_at": firestore.SERVER_TIMESTAMP,
            "last_login_at": firestore.SERVER_TIMESTAMP,
        }
        user_ref.set(profile)

    custom_token_bytes = fb_auth.create_custom_token(
        uid=pi_uid,
        developer_claims={
            "pi_username": username,
            "role": profile.get("role", "pioneer"),
            "verified_pioneer": True,
        },
    )
    custom_token = (
        custom_token_bytes.decode("utf-8")
        if isinstance(custom_token_bytes, bytes)
        else str(custom_token_bytes)
    )

    # Strip non-JSON-serializable Firestore sentinels for HTTP response
    safe_profile = {
        k: v
        for k, v in profile.items()
        if k not in ("created_at", "last_login_at")
    }
    return custom_token, safe_profile
