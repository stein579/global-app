from app.core.supabase_client import get_supabase
from app.schemas.article import (
    ArticleAnalysisResult,
    ArticleDetailResponse,
    ArticleSummaryResponse,
    ParagraphResponse,
    SentenceResponse,
    VocabularyResponse,
)
from app.schemas.question import QuizQuestionResponse


def persist_article(
    analysis: ArticleAnalysisResult,
    raw_text: str,
    source_url: str | None,
    questions: list[dict],
) -> ArticleDetailResponse:
    """Bulk-write the 4-tier analysis (article > paragraph > sentence >
    vocabulary), the generated quiz questions, and seed a review_card for
    every new vocabulary entry - all in Supabase."""

    supabase = get_supabase()

    article_row = (
        supabase.table("articles")
        .insert(
            {
                "title": analysis.title,
                "summary_ja": analysis.summary_ja,
                "difficulty_level": analysis.difficulty_level.value,
                "raw_text": raw_text,
                "source_url": source_url,
            }
        )
        .execute()
        .data[0]
    )
    article_id = article_row["id"]

    paragraph_responses: list[ParagraphResponse] = []

    for paragraph in analysis.paragraphs:
        paragraph_row = (
            supabase.table("paragraphs")
            .insert(
                {
                    "article_id": article_id,
                    "order_index": paragraph.order_index,
                    "text": paragraph.text,
                    "translation_ja": paragraph.translation_ja,
                }
            )
            .execute()
            .data[0]
        )
        paragraph_id = paragraph_row["id"]

        sentence_responses: list[SentenceResponse] = []
        for sentence in paragraph.sentences:
            sentence_row = (
                supabase.table("sentences")
                .insert(
                    {
                        "paragraph_id": paragraph_id,
                        "order_index": sentence.order_index,
                        "text": sentence.text,
                        "translation_ja": sentence.translation_ja,
                    }
                )
                .execute()
                .data[0]
            )
            sentence_id = sentence_row["id"]

            vocabulary_responses: list[VocabularyResponse] = []
            if sentence.vocabulary:
                vocab_rows = (
                    supabase.table("vocabulary")
                    .insert(
                        [
                            {
                                "sentence_id": sentence_id,
                                "word": vocab.word,
                                "part_of_speech": vocab.part_of_speech,
                                "meaning_ja": vocab.meaning_ja,
                            }
                            for vocab in sentence.vocabulary
                        ]
                    )
                    .execute()
                    .data
                )

                # Seed a spaced-repetition flash card for every new vocab item.
                supabase.table("review_cards").insert(
                    [{"vocabulary_id": row["id"]} for row in vocab_rows]
                ).execute()

                vocabulary_responses = [VocabularyResponse(**row) for row in vocab_rows]

            sentence_responses.append(
                SentenceResponse(
                    id=sentence_id,
                    paragraph_id=paragraph_id,
                    order_index=sentence.order_index,
                    text=sentence.text,
                    translation_ja=sentence.translation_ja,
                    vocabulary=vocabulary_responses,
                )
            )

        paragraph_responses.append(
            ParagraphResponse(
                id=paragraph_id,
                article_id=article_id,
                order_index=paragraph.order_index,
                text=paragraph.text,
                translation_ja=paragraph.translation_ja,
                sentences=sentence_responses,
            )
        )

    if questions:
        supabase.table("quiz_questions").insert(
            [{**question, "article_id": article_id} for question in questions]
        ).execute()

    return ArticleDetailResponse(
        id=article_id,
        title=article_row["title"],
        summary_ja=article_row["summary_ja"],
        difficulty_level=article_row["difficulty_level"],
        source_url=article_row.get("source_url"),
        created_at=article_row["created_at"],
        raw_text=raw_text,
        paragraphs=paragraph_responses,
    )


def get_article(article_id: str) -> ArticleDetailResponse | None:
    """Fetch a single article with its full paragraph/sentence/vocabulary
    tree, used by the `articles/[id]` detail screen."""

    supabase = get_supabase()
    row = (
        supabase.table("articles")
        .select(
            "id, title, summary_ja, difficulty_level, raw_text, source_url, created_at,"
            "paragraphs(id, article_id, order_index, text, translation_ja,"
            "sentences(id, paragraph_id, order_index, text, translation_ja,"
            "vocabulary(id, sentence_id, word, part_of_speech, meaning_ja)))"
        )
        .eq("id", article_id)
        .maybe_single()
        .execute()
        .data
    )
    if row is None:
        return None

    paragraphs = [
        ParagraphResponse(
            id=paragraph["id"],
            article_id=paragraph["article_id"],
            order_index=paragraph["order_index"],
            text=paragraph["text"],
            translation_ja=paragraph["translation_ja"],
            sentences=[
                SentenceResponse(
                    id=sentence["id"],
                    paragraph_id=sentence["paragraph_id"],
                    order_index=sentence["order_index"],
                    text=sentence["text"],
                    translation_ja=sentence["translation_ja"],
                    vocabulary=[
                        VocabularyResponse(**vocab) for vocab in sentence["vocabulary"]
                    ],
                )
                for sentence in sorted(paragraph["sentences"], key=lambda s: s["order_index"])
            ],
        )
        for paragraph in sorted(row["paragraphs"], key=lambda p: p["order_index"])
    ]

    return ArticleDetailResponse(
        id=row["id"],
        title=row["title"],
        summary_ja=row["summary_ja"],
        difficulty_level=row["difficulty_level"],
        source_url=row.get("source_url"),
        created_at=row["created_at"],
        raw_text=row["raw_text"],
        paragraphs=paragraphs,
    )


def list_articles() -> list[ArticleSummaryResponse]:
    supabase = get_supabase()
    rows = (
        supabase.table("articles")
        .select("id, title, summary_ja, difficulty_level, source_url, created_at")
        .order("created_at", desc=True)
        .execute()
        .data
    )
    return [ArticleSummaryResponse(**row) for row in rows]


def delete_article(article_id: str) -> bool:
    """Delete an article. `paragraphs`, `sentences`, `vocabulary`,
    `quiz_questions`, and `review_cards` all cascade-delete via the
    `on delete cascade` foreign keys defined in schema.sql, so a single
    delete on `articles` is enough to clean up the entire tree.

    Returns True if a row was deleted, False if no article existed with
    this id (so the endpoint can 404 instead of reporting a false success).
    """

    supabase = get_supabase()
    deleted_rows = (
        supabase.table("articles").delete().eq("id", article_id).execute().data
    )
    return bool(deleted_rows)


def get_quiz_questions(article_id: str) -> list[QuizQuestionResponse]:
    supabase = get_supabase()
    rows = (
        supabase.table("quiz_questions")
        .select(
            "id, article_id, type, answer, fill_in_sentence, sentence_translation_ja, "
            "part_of_speech_ja, meaning_ja"
        )
        .eq("article_id", article_id)
        .execute()
        .data
    )
    return [QuizQuestionResponse(**row) for row in rows]
