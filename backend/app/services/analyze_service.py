import re

from app.schemas.article import ArticleAnalysisResult
from app.schemas.question import QuizQuestionType
from app.services.gemini_service import analyze_with_gemini

_WORD_BLANK = "＿＿＿＿"
_SENTENCE_BLANK = "＿＿＿＿＿＿＿＿＿＿"


def analyze_article(raw_text: str, title: str | None) -> tuple[ArticleAnalysisResult, list[dict]]:
    """Run AI analysis, then derive review quiz questions from the result.
    Returns the analysis plus a list of quiz-question dicts ready to attach
    an article_id to and insert into Supabase."""

    analysis = analyze_with_gemini(raw_text, title)
    questions = _generate_quiz_questions(analysis)
    return analysis, questions


def _blank_out_word(sentence_text: str, word: str) -> str:
    """Replaces the first verbatim, word-boundary match of `word` in
    `sentence_text` with a full-width blank. Falls back to appending the
    target word in parentheses if it can't be located verbatim, so the quiz
    still renders instead of silently showing an un-blanked sentence."""

    pattern = re.compile(rf"\b{re.escape(word)}\b", re.IGNORECASE)
    blanked, count = pattern.subn(_WORD_BLANK, sentence_text, count=1)
    if count > 0:
        return blanked
    return f"{sentence_text} ( {_WORD_BLANK} = {word} )"


def _generate_quiz_questions(analysis: ArticleAnalysisResult) -> list[dict]:
    """Generates exactly the two review-quiz modes the app supports:

    - vocabulary: fill in the blank with the target word (日→英 記述).
    - sentence: type out the full sentence (日→英 記述).

    Both are always paired with the sentence's full Japanese translation as
    a hint.
    """

    questions: list[dict] = []

    for paragraph in analysis.paragraphs:
        for sentence in paragraph.sentences:
            for vocab in sentence.vocabulary:
                questions.append(
                    {
                        "type": QuizQuestionType.vocabulary.value,
                        "answer": vocab.word,
                        "fill_in_sentence": _blank_out_word(sentence.text, vocab.word),
                        "sentence_translation_ja": sentence.translation_ja,
                        "part_of_speech_ja": vocab.part_of_speech,
                        "meaning_ja": vocab.meaning_ja,
                    }
                )

            questions.append(
                {
                    "type": QuizQuestionType.sentence.value,
                    "answer": sentence.text,
                    "fill_in_sentence": _SENTENCE_BLANK,
                    "sentence_translation_ja": sentence.translation_ja,
                    "part_of_speech_ja": None,
                    "meaning_ja": None,
                }
            )

    return questions
