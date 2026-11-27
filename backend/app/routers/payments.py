import os
from fastapi import APIRouter, Depends, HTTPException, status
from firebase_admin import firestore
import httpx
from pydantic import BaseModel, Field

from app.config import settings
from app.firebase_admin_client import AuthenticatedPioneer, db, verify_firebase_token

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])


class PaymentApproveRequest(BaseModel):
    payment_id: str = Field(..., min_length=4, max_length=128)


class PaymentCompleteRequest(BaseModel):
    payment_id: str = Field(..., min_length=4, max_length=128)
    txid: str = Field(..., min_length=4, max_length=256)
    amount: float | None = None


def _get_pi_api_key() -> str:
    key = os.getenv("PI_API_KEY", "").strip()
    if not key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Pi Payments API key is not configured on the server yet.",
        )
    return key


@router.post("/approve")
async def approve_payment(
    payload: PaymentApproveRequest,
    pioneer: AuthenticatedPioneer = Depends(verify_firebase_token),
):
    api_key = _get_pi_api_key()
    url = f"{settings.pi_api_base_url.rstrip('/')}/v2/payments/{payload.payment_id}/approve"

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            url,
            headers={"Authorization": f"Key {api_key}"},
        )

    if resp.status_code not in (200, 201):
        raise HTTPException(
            status_code=502,
            detail=f"Pi payment approval failed ({resp.status_code}).",
        )

    db.collection("tips").document(payload.payment_id).set(
        {
            "payment_id": payload.payment_id,
            "uid": pioneer.uid,
            "username": pioneer.username,
            "status": "approved",
            "created_at": firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )
    return {"ok": True, "payment_id": payload.payment_id, "status": "approved"}


@router.post("/complete")
async def complete_payment(
    payload: PaymentCompleteRequest,
    pioneer: AuthenticatedPioneer = Depends(verify_firebase_token),
):
    api_key = _get_pi_api_key()
    url = f"{settings.pi_api_base_url.rstrip('/')}/v2/payments/{payload.payment_id}/complete"

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            url,
            headers={"Authorization": f"Key {api_key}"},
            json={"txid": payload.txid},
        )

    if resp.status_code not in (200, 201):
        raise HTTPException(
            status_code=502,
            detail=f"Pi payment completion failed ({resp.status_code}).",
        )

    db.collection("tips").document(payload.payment_id).set(
        {
            "payment_id": payload.payment_id,
            "uid": pioneer.uid,
            "username": pioneer.username,
            "txid": payload.txid,
            "amount": payload.amount,
            "status": "completed",
            "completed_at": firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )

    # Award purely cosmetic non-pay-to-win Galactic Supporter badge
    db.collection("users").document(pioneer.uid).update(
        {"badges": firestore.ArrayUnion(["galactic_supporter"])}
    )

    return {"ok": True, "payment_id": payload.payment_id, "badge_awarded": "galactic_supporter"}
