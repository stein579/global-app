from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="English Learning Material Generator API",
    description="AI(Gemini)を用いて英文を4階層(英文/段落/文/単語)に解析し、復習クイズを自動生成するバックエンド",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
def health_check() -> dict:
    return {
        "status": "ok",
        "env": settings.app_env,
        "supabase_configured": settings.has_supabase,
        "gemini_configured": settings.has_gemini,
    }
