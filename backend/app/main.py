from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, chat, matches, moderation, payments

app = FastAPI(
    title="Starfield Cosmic Chess API",
    version="1.1.0",
    description="Pi-native social strategy backend (FastAPI + Firestore).",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(matches.router)
app.include_router(chat.router)
app.include_router(moderation.router)
app.include_router(payments.router)


@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "service": "starfield-cosmic-chess-api"}
