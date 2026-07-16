from fastapi import APIRouter

from app.api.v1.endpoints import articles, questions

api_router = APIRouter(prefix="/v1")
api_router.include_router(articles.router)
api_router.include_router(questions.router)
