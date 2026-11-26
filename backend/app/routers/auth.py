from typing import Literal
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.firebase_admin_client import AuthenticatedPioneer, db, verify_firebase_token
from app.services.pi_auth import upsert_pioneer_and_mint_token, verify_pi_access_token

router = APIRouter(prefix="/api/v1", tags=["auth"])


class PiLoginRequest(BaseModel):
    access_token: str = Field(..., min_length=10, max_length=2048)


class FactionUpdateRequest(BaseModel):
    faction: Literal["astrolabe", "horizon", "nebula"]


@router.post("/auth/pi-login")
async def pi_login(payload: PiLoginRequest):
    pi_user = await verify_pi_access_token(payload.access_token)
    custom_token, profile = upsert_pioneer_and_mint_token(
        pi_uid=pi_user["uid"],
        username=pi_user["username"],
    )
    return {
        "custom_token": custom_token,
        "profile": profile,
    }


@router.patch("/profile/faction")
async def update_faction(
    payload: FactionUpdateRequest,
    pioneer: AuthenticatedPioneer = Depends(verify_firebase_token),
):
    db.collection("users").document(pioneer.uid).update({"faction": payload.faction})
    return {"ok": True, "faction": payload.faction}
