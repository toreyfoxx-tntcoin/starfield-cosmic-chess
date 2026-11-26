from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from pydantic import BaseModel, Field

from app.firebase_admin_client import AuthenticatedPioneer, db, verify_firebase_token
from app.services.moderation import QUICK_CHAT_PRESETS, validate_chat_message

router = APIRouter(prefix="/api/v1", tags=["chat"])


class ChatSendRequest(BaseModel):
    type: Literal["quick_chat", "text"]
    preset_key: str | None = None
    text: str | None = Field(default=None, max_length=200)


@router.post("/matches/{match_id}/chat")
async def send_match_chat(
    match_id: str,
    payload: ChatSendRequest,
    pioneer: AuthenticatedPioneer = Depends(verify_firebase_token),
):
    match_snap = db.collection("matches").document(match_id).get()
    if not match_snap.exists:
        raise HTTPException(status_code=404, detail="Match not found.")
    match_data = match_snap.to_dict() or {}
    if pioneer.uid not in match_data.get("participant_uids", []):
        raise HTTPException(status_code=403, detail="Not a participant in this match.")

    if payload.type == "quick_chat":
        if not payload.preset_key or payload.preset_key not in QUICK_CHAT_PRESETS:
            raise HTTPException(status_code=400, detail="Invalid Quick Chat preset.")
        final_text = QUICK_CHAT_PRESETS[payload.preset_key]
    else:
        user_snap = db.collection("users").document(pioneer.uid).get()
        mod_status = ((user_snap.to_dict() or {}).get("moderation") or {}).get("status", "active")
        if mod_status == "chat_muted":
            raise HTTPException(
                status_code=403,
                detail="Free-text chat is temporarily muted on your account. Quick Chat remains available.",
            )
        final_text = validate_chat_message(pioneer.uid, payload.text or "")

    msg_ref = db.collection("matches").document(match_id).collection("chat").document()
    msg_ref.set(
        {
            "message_id": msg_ref.id,
            "sender_uid": pioneer.uid,
            "sender_username": pioneer.username,
            "type": payload.type,
            "preset_key": payload.preset_key if payload.type == "quick_chat" else None,
            "text": final_text,
            "created_at": firestore.SERVER_TIMESTAMP,
        }
    )
    return {"ok": True, "message_id": msg_ref.id}
