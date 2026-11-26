from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from pydantic import BaseModel, Field

from app.firebase_admin_client import (
    AuthenticatedPioneer,
    db,
    require_moderator,
    verify_firebase_token,
)

router = APIRouter(prefix="/api/v1", tags=["moderation"])


class ReportCreateRequest(BaseModel):
    match_id: str = Field(..., min_length=3, max_length=64)
    reported_uid: str = Field(..., min_length=3, max_length=128)
    category: Literal["harassment", "spam_external_link", "intentional_stall", "other"]
    note: str = Field(default="", max_length=200)


class ModerateActionRequest(BaseModel):
    report_id: str
    target_uid: str
    action: Literal["no_action", "warn", "chat_mute", "suspend"]
    resolution_note: str = Field(..., min_length=3, max_length=300)


@router.post("/moderation/report")
async def create_report(
    payload: ReportCreateRequest,
    pioneer: AuthenticatedPioneer = Depends(verify_firebase_token),
):
    if payload.reported_uid == pioneer.uid:
        raise HTTPException(status_code=400, detail="You cannot report yourself.")

    # Capture last 10 match chat messages for human moderator context
    chat_docs = (
        db.collection("matches")
        .document(payload.match_id)
        .collection("chat")
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(10)
        .stream()
    )
    snapshot = [
        f"{(d.to_dict() or {}).get('sender_username', '?')}: {(d.to_dict() or {}).get('text', '')}"
        for d in chat_docs
    ]
    snapshot.reverse()

    report_ref = db.collection("reports").document()
    report_ref.set(
        {
            "report_id": report_ref.id,
            "reporter_uid": pioneer.uid,
            "reported_uid": payload.reported_uid,
            "match_id": payload.match_id,
            "category": payload.category,
            "note": payload.note.strip(),
            "chat_snapshot": snapshot,
            "status": "open",
            "reviewed_by": None,
            "resolution_note": None,
            "created_at": firestore.SERVER_TIMESTAMP,
        }
    )

    # Auto-mute reported user for reporter immediately
    db.collection("users").document(pioneer.uid).update(
        {"muted_users": firestore.ArrayUnion([payload.reported_uid])}
    )
    return {"ok": True, "report_id": report_ref.id}


@router.post("/admin/moderate")
async def moderate_user(
    payload: ModerateActionRequest,
    moderator: AuthenticatedPioneer = Depends(require_moderator),
):
    target_ref = db.collection("users").document(payload.target_uid)
    if payload.action == "warn":
        target_ref.update({"moderation.warning_count": firestore.Increment(1)})
    elif payload.action == "chat_mute":
        target_ref.update({"moderation.status": "chat_muted"})
    elif payload.action == "suspend":
        target_ref.update({"moderation.status": "suspended"})

    db.collection("reports").document(payload.report_id).update(
        {
            "status": "reviewed_no_action" if payload.action == "no_action" else "reviewed_actioned",
            "reviewed_by": moderator.uid,
            "resolution_note": payload.resolution_note,
            "reviewed_at": firestore.SERVER_TIMESTAMP,
        }
    )
    return {"ok": True, "action": payload.action}
