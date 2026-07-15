from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class DifficultyLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


# --- AI analysis result shape (4-tier hierarchy) -----------------------
# Article -> Paragraph -> Sentence -> Vocabulary


class VocabularyItem(BaseModel):
    word: str
    part_of_speech: str
    meaning_ja: str


class SentenceItem(BaseModel):
    order_index: int
    text: str
    translation_ja: str
    vocabulary: list[VocabularyItem] = Field(default_factory=list)


class ParagraphItem(BaseModel):
    order_index: int
    text: str
    translation_ja: str
    sentences: list[SentenceItem] = Field(default_factory=list)


class ArticleAnalysisResult(BaseModel):
    """The full 4-tier structure produced by the AI analysis service."""

    title: str
    summary_ja: str
    difficulty_level: DifficultyLevel
    paragraphs: list[ParagraphItem] = Field(default_factory=list)


# --- API request / response models -------------------------------------


class ArticleAnalyzeRequest(BaseModel):
    raw_text: str = Field(..., min_length=1, description="Raw English article text")
    title: str | None = Field(None, description="Optional override title")
    source_url: str | None = None


class ArticleSummaryResponse(BaseModel):
    id: str
    title: str
    summary_ja: str
    difficulty_level: DifficultyLevel
    source_url: str | None = None
    created_at: datetime


class VocabularyResponse(VocabularyItem):
    id: str
    sentence_id: str


class SentenceResponse(BaseModel):
    id: str
    paragraph_id: str
    order_index: int
    text: str
    translation_ja: str
    vocabulary: list[VocabularyResponse] = Field(default_factory=list)


class ParagraphResponse(BaseModel):
    id: str
    article_id: str
    order_index: int
    text: str
    translation_ja: str
    sentences: list[SentenceResponse] = Field(default_factory=list)


class ArticleDetailResponse(ArticleSummaryResponse):
    raw_text: str
    paragraphs: list[ParagraphResponse] = Field(default_factory=list)


class ArticleAnalyzeResponse(BaseModel):
    article: ArticleDetailResponse
    questions_generated: int
