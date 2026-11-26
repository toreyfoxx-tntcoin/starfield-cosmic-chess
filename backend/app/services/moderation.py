import re
import time
from fastapi import HTTPException, status

QUICK_CHAT_PRESETS: dict[str, str] = {
    "greetings_pioneer": "Greetings, Pioneer!",
    "well_played": "Well played.",
    "interesting_move": "Interesting move!",
    "good_game": "Good game, Commander.",
    "thinking": "Taking a moment to think.",
    "rematch": "Rematch?",
}

URL_PATTERN = re.compile(
    r"(https?://|www\.|t\.me/|wa\.me/|\b[a-z0-9-]+\.(com|net|org|io|xyz|app|gg|co|me|ly)\b)",
    re.IGNORECASE,
)

SCAM_PATTERN = re.compile(
    r"\b(passphrase|seed\s*phrase|private\s*key|24\s*words|send\s*pi\s*to|free\s*pi)\b",
    re.IGNORECASE,
)

# Baseline profanity/slur blocklist (expandable via Firestore config in Phase 2)
BLOCKED_TERMS = {
    "fuck",
    "shit",
    "bitch",
    "asshole",
    "cunt",
    "nigger",
    "faggot",
    "retard",
    "kill yourself",
    "kys",
}

_last_message_ts: dict[str, float] = {}


def validate_chat_message(uid: str, text: str) -> str:
    now = time.time()
    prev = _last_message_ts.get(uid, 0.0)
    if now - prev < 3.0:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Please wait a moment before sending another message.",
        )

    cleaned = " ".join(text.strip().split())
    if not cleaned:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    if len(cleaned) > 200:
        raise HTTPException(status_code=400, detail="Message must be 200 characters or fewer.")

    if URL_PATTERN.search(cleaned):
        raise HTTPException(
            status_code=400,
            detail="External links are blocked in Match Chat for Pioneer safety.",
        )

    if SCAM_PATTERN.search(cleaned):
        raise HTTPException(
            status_code=400,
            detail="Messages referencing wallet passphrases or transfers are prohibited.",
        )

    lowered = cleaned.lower()
    for term in BLOCKED_TERMS:
        if term in lowered:
            raise HTTPException(
                status_code=400,
                detail="Message blocked by community safety filter. Keep chat respectful.",
            )

    _last_message_ts[uid] = now
    return cleaned
