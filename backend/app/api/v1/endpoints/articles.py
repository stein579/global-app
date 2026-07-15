from fastapi import APIRouter, HTTPException

from app.schemas.article import (
    ArticleAnalyzeRequest,
    ArticleAnalyzeResponse,
    ArticleDetailResponse,
    ArticleSummaryResponse,
)
from app.schemas.question import QuizQuestionResponse
from app.services.analyze_service import analyze_article
from app.services.article_service import (
    delete_article,
    get_article,
    get_quiz_questions,
    list_articles,
    persist_article,
)

router = APIRouter(prefix="/articles", tags=["articles"])


@router.post("/analyze", response_model=ArticleAnalyzeResponse)
def analyze(payload: ArticleAnalyzeRequest) -> ArticleAnalyzeResponse:
    """Analyze raw English text into the 4-tier structure (article > paragraph
    > sentence > vocabulary) via Gemini (or a mock fallback), generate review
    quiz questions, then bulk-persist everything to Supabase."""

    analysis, questions = analyze_article(payload.raw_text, payload.title)
    article = persist_article(
        analysis=analysis,
        raw_text=payload.raw_text,
        source_url=payload.source_url,
        questions=questions,
    )
    return ArticleAnalyzeResponse(article=article, questions_generated=len(questions))


@router.get("", response_model=list[ArticleSummaryResponse])
def get_articles() -> list[ArticleSummaryResponse]:
    return list_articles()


@router.get("/{article_id}", response_model=ArticleDetailResponse)
def get_article_detail(article_id: str) -> ArticleDetailResponse:
    article = get_article(article_id)
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.get("/{article_id}/questions", response_model=list[QuizQuestionResponse])
def get_article_questions(article_id: str) -> list[QuizQuestionResponse]:
    questions = get_quiz_questions(article_id)
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this article")
    return questions


@router.delete("/{article_id}", status_code=204)
def delete_article_endpoint(article_id: str) -> None:
    """Delete an article and everything derived from it (paragraphs,
    sentences, vocabulary, quiz_questions, review_cards) via cascading
    foreign keys."""

    deleted = delete_article(article_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Article not found")
