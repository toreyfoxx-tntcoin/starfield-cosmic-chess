import random
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Literal

import chess
from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from pydantic import BaseModel, Field

from app.firebase_admin_client import AuthenticatedPioneer, db, verify_firebase_token

router = APIRouter(prefix="/api/v1", tags=["matches"])

SECTORS = [
    "Sector 01 — Orion Observatory",
    "Sector 04 — Cygnus Relay",
    "Sector 07 — Lyra Beacon",
    "Sector 11 — Vela Horizon",
]


class MatchmakingJoinRequest(BaseModel):
    mode: Literal["correspondence_24h", "live_10m"] = "correspondence_24h"


class ChallengeCreateRequest(BaseModel):
    mode: Literal["correspondence_24h", "live_10m"] = "correspondence_24h"
    target_username: str | None = Field(default=None, max_length=64)


class MoveRequest(BaseModel):
    uci: str = Field(..., pattern=r"^[a-h][1-8][a-h][1-8][qrbn]?$")
    client_action_id: str | None = None


class MatchActionRequest(BaseModel):
    action: Literal["resign", "offer_draw", "accept_draw", "decline_draw", "claim_timeout"]


class EndorseRequest(BaseModel):
    tag: Literal["honorable_strategist", "friendly_pioneer", "bold_tactician"]


def _initial_clock_ms(mode: str) -> int:
    return 86_400_000 if mode == "correspondence_24h" else 600_000


def _create_match_doc(white: dict, black: dict, mode: str) -> str:
    match_id = f"m_{secrets.token_hex(6)}"
    clock_ms = _initial_clock_ms(mode)
    deadline = datetime.now(timezone.utc) + timedelta(milliseconds=clock_ms)

    db.collection("matches").document(match_id).set(
        {
            "match_id": match_id,
            "mode": mode,
            "status": "active",
            "result": None,
            "termination": None,
            "players": {"white": white, "black": black},
            "participant_uids": [white["uid"], black["uid"]],
            "turn": "w",
            "fen": chess.STARTING_FEN,
            "move_count": 0,
            "last_move": None,
            "moves_san": [],
            "clock": {
                "white_remaining_ms": clock_ms,
                "black_remaining_ms": clock_ms,
                "turn_deadline_at": deadline,
            },
            "draw_offer_by": None,
            "sector_label": random.choice(SECTORS),
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP,
            "completed_at": None,
        }
    )
    return match_id


def _award_completion_stats(match_data: dict, result: str) -> None:
    white_uid = match_data["players"]["white"]["uid"]
    black_uid = match_data["players"]["black"]["uid"]

    for uid, color in ((white_uid, "white"), (black_uid, "black")):
        uref = db.collection("users").document(uid)
        inc_win = 1 if (result == "white_win" and color == "white") or (result == "black_win" and color == "black") else 0
        inc_loss = 1 if (result == "black_win" and color == "white") or (result == "white_win" and color == "black") else 0
        inc_draw = 1 if result == "draw" else 0
        uref.update(
            {
                "stats.games_completed": firestore.Increment(1),
                "stats.wins": firestore.Increment(inc_win),
                "stats.losses": firestore.Increment(inc_loss),
                "stats.draws": firestore.Increment(inc_draw),
                "badges": firestore.ArrayUnion(["first_contact"]),
            }
        )


@router.post("/matchmaking/join")
async def join_matchmaking(
    payload: MatchmakingJoinRequest,
    pioneer: AuthenticatedPioneer = Depends(verify_firebase_token),
):
    queue_col = db.collection("matchmaking_queue")
    waiting = (
        queue_col.where("mode", "==", payload.mode)
        .order_by("joined_at")
        .limit(5)
        .stream()
    )

    opponent_doc = None
    for doc in waiting:
        if doc.id != pioneer.uid:
            opponent_doc = doc
            break

    me_snap = db.collection("users").document(pioneer.uid).get()
    me_data = me_snap.to_dict() or {}
    me_player = {
        "uid": pioneer.uid,
        "username": pioneer.username,
        "faction": me_data.get("faction"),
    }

    if opponent_doc:
        opp = opponent_doc.to_dict() or {}
        opp_player = {
            "uid": opponent_doc.id,
            "username": opp.get("username", "Pioneer"),
            "faction": opp.get("faction"),
        }
        opponent_doc.reference.delete()
        queue_col.document(pioneer.uid).delete()
        white, black = (me_player, opp_player) if random.random() < 0.5 else (opp_player, me_player)
        match_id = _create_match_doc(white, black, payload.mode)
        return {"matched": True, "match_id": match_id}

    queue_col.document(pioneer.uid).set(
        {
            "uid": pioneer.uid,
            "username": pioneer.username,
            "faction": me_data.get("faction"),
            "mode": payload.mode,
            "joined_at": firestore.SERVER_TIMESTAMP,
        }
    )
    return {"matched": False, "queued": True}


@router.delete("/matchmaking/leave")
async def leave_matchmaking(pioneer: AuthenticatedPioneer = Depends(verify_firebase_token)):
    db.collection("matchmaking_queue").document(pioneer.uid).delete()
    return {"ok": True}


@router.post("/challenges")
async def create_challenge(
    payload: ChallengeCreateRequest,
    pioneer: AuthenticatedPioneer = Depends(verify_firebase_token),
):
    suffix = "".join(random.choices(string.digits, k=4))
    code = f"STAR-{suffix}"
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)

    db.collection("challenges").document(code).set(
        {
            "code": code,
            "creator_uid": pioneer.uid,
            "creator_username": pioneer.username,
            "target_username": payload.target_username,
            "mode": payload.mode,
            "status": "pending",
            "match_id": None,
            "created_at": firestore.SERVER_TIMESTAMP,
            "expires_at": expires_at,
        }
    )
    return {"code": code, "mode": payload.mode}


@router.post("/challenges/{code}/accept")
async def accept_challenge(
    code: str,
    pioneer: AuthenticatedPioneer = Depends(verify_firebase_token),
):
    ref = db.collection("challenges").document(code.upper())
    snap = ref.get()
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Challenge code not found.")
    data = snap.to_dict() or {}
    if data.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Challenge is no longer available.")
    if data.get("creator_uid") == pioneer.uid:
        raise HTTPException(status_code=400, detail="You cannot accept your own challenge.")

    creator = {"uid": data["creator_uid"], "username": data["creator_username"], "faction": None}
    accepter = {"uid": pioneer.uid, "username": pioneer.username, "faction": None}
    match_id = _create_match_doc(creator, accepter, data.get("mode", "correspondence_24h"))

    ref.update({"status": "accepted", "match_id": match_id})
    return {"match_id": match_id}


@router.post("/matches/{match_id}/move")
async def submit_move(
    match_id: str,
    payload: MoveRequest,
    pioneer: AuthenticatedPioneer = Depends(verify_firebase_token),
):
    match_ref = db.collection("matches").document(match_id)
    transaction = db.transaction()

    @firestore.transactional
    def apply_move(txn):
        snap = match_ref.get(transaction=txn)
        if not snap.exists:
            raise HTTPException(status_code=404, detail="Match not found.")
        data = snap.to_dict() or {}
        if data.get("status") != "active":
            raise HTTPException(status_code=400, detail="Match is already completed.")

        turn = data.get("turn", "w")
        expected_uid = data["players"]["white"]["uid"] if turn == "w" else data["players"]["black"]["uid"]
        if pioneer.uid != expected_uid:
            raise HTTPException(status_code=403, detail="It is not your turn.")

        board = chess.Board(data["fen"])
        try:
            move = chess.Move.from_uci(payload.uci)
        except ValueError:
            raise HTTPException(status_code=400, detail="Malformed UCI move.")
        if move not in board.legal_moves:
            raise HTTPException(status_code=400, detail="Illegal chess move.")

        san = board.san(move)
        board.push(move)

        next_turn = "w" if board.turn == chess.WHITE else "b"
        moves_san = list(data.get("moves_san", [])) + [san]

        status_val = "active"
        result_val = None
        termination_val = None
        if board.is_checkmate():
            status_val = "completed"
            result_val = "white_win" if turn == "w" else "black_win"
            termination_val = "checkmate"
        elif board.is_stalemate():
            status_val = "completed"
            result_val = "draw"
            termination_val = "stalemate"
        elif board.is_insufficient_material():
            status_val = "completed"
            result_val = "draw"
            termination_val = "insufficient_material"
        elif board.can_claim_fifty_moves() or board.can_claim_threefold_repetition():
            status_val = "completed"
            result_val = "draw"
            termination_val = "draw_rule"

        deadline = datetime.now(timezone.utc) + timedelta(
            milliseconds=_initial_clock_ms(data.get("mode", "correspondence_24h"))
        )

        update_doc = {
            "fen": board.fen(),
            "turn": next_turn,
            "move_count": len(moves_san),
            "moves_san": moves_san,
            "last_move": {
                "uci": payload.uci,
                "san": san,
                "by_uid": pioneer.uid,
                "played_at": firestore.SERVER_TIMESTAMP,
            },
            "clock.turn_deadline_at": deadline,
            "draw_offer_by": None,
            "status": status_val,
            "result": result_val,
            "termination": termination_val,
            "updated_at": firestore.SERVER_TIMESTAMP,
        }
        if status_val == "completed":
            update_doc["completed_at"] = firestore.SERVER_TIMESTAMP

        txn.update(match_ref, update_doc)
        return data, board.fen(), san, status_val, result_val

    match_data, new_fen, san, status_val, result_val = apply_move(transaction)
    if status_val == "completed" and result_val:
        _award_completion_stats(match_data, result_val)

    return {"ok": True, "fen": new_fen, "san": san, "status": status_val, "result": result_val}


@router.post("/matches/{match_id}/action")
async def match_action(
    match_id: str,
    payload: MatchActionRequest,
    pioneer: AuthenticatedPioneer = Depends(verify_firebase_token),
):
    match_ref = db.collection("matches").document(match_id)
    snap = match_ref.get()
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Match not found.")
    data = snap.to_dict() or {}
    if pioneer.uid not in data.get("participant_uids", []):
        raise HTTPException(status_code=403, detail="Not a participant in this match.")
    if data.get("status") != "active":
        raise HTTPException(status_code=400, detail="Match is not active.")

    is_white = data["players"]["white"]["uid"] == pioneer.uid

    if payload.action == "resign":
        result = "black_win" if is_white else "white_win"
        match_ref.update(
            {
                "status": "completed",
                "result": result,
                "termination": "resignation",
                "completed_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP,
            }
        )
        _award_completion_stats(data, result)
        return {"ok": True, "result": result}

    if payload.action == "offer_draw":
        match_ref.update({"draw_offer_by": pioneer.uid, "updated_at": firestore.SERVER_TIMESTAMP})
        return {"ok": True, "draw_offer_by": pioneer.uid}

    if payload.action == "decline_draw":
        match_ref.update({"draw_offer_by": None, "updated_at": firestore.SERVER_TIMESTAMP})
        return {"ok": True}

    if payload.action == "accept_draw":
        if not data.get("draw_offer_by") or data.get("draw_offer_by") == pioneer.uid:
            raise HTTPException(status_code=400, detail="No pending opponent draw offer.")
        match_ref.update(
            {
                "status": "completed",
                "result": "draw",
                "termination": "draw_agreement",
                "draw_offer_by": None,
                "completed_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP,
            }
        )
        _award_completion_stats(data, "draw")
        return {"ok": True, "result": "draw"}

    if payload.action == "claim_timeout":
        deadline = (data.get("clock") or {}).get("turn_deadline_at")
        if not deadline or datetime.now(timezone.utc) < deadline:
            raise HTTPException(status_code=400, detail="Turn clock has not expired yet.")
        result = "black_win" if data.get("turn") == "w" else "white_win"
        match_ref.update(
            {
                "status": "completed",
                "result": result,
                "termination": "timeout",
                "completed_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP,
            }
        )
        _award_completion_stats(data, result)
        return {"ok": True, "result": result}

    raise HTTPException(status_code=400, detail="Unsupported action.")


@router.post("/matches/{match_id}/endorse")
async def endorse_opponent(
    match_id: str,
    payload: EndorseRequest,
    pioneer: AuthenticatedPioneer = Depends(verify_firebase_token),
):
    match_snap = db.collection("matches").document(match_id).get()
    if not match_snap.exists:
        raise HTTPException(status_code=404, detail="Match not found.")
    data = match_snap.to_dict() or {}
    if pioneer.uid not in data.get("participant_uids", []):
        raise HTTPException(status_code=403, detail="Not a participant in this match.")
    if data.get("status") != "completed" or data.get("move_count", 0) < 8:
        raise HTTPException(
            status_code=400,
            detail="Sportsmanship endorsements unlock after completed matches of at least 8 moves.",
        )

    opponent_uid = [u for u in data["participant_uids"] if u != pioneer.uid][0]
    endorse_id = f"{match_id}_{pioneer.uid}"
    endorse_ref = db.collection("endorsements").document(endorse_id)
    if endorse_ref.get().exists:
        raise HTTPException(status_code=400, detail="You already endorsed this match.")

    endorse_ref.set(
        {
            "match_id": match_id,
            "from_uid": pioneer.uid,
            "to_uid": opponent_uid,
            "tag": payload.tag,
            "created_at": firestore.SERVER_TIMESTAMP,
        }
    )
    db.collection("users").document(opponent_uid).update(
        {
            "stats.sportsmanship_points": firestore.Increment(1),
            "badges": firestore.ArrayUnion([payload.tag]),
        }
    )
    return {"ok": True, "endorsed_uid": opponent_uid, "tag": payload.tag}
