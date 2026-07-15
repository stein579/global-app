from enum import Enum

from pydantic import BaseModel


class QuizQuestionType(str, Enum):
    vocabulary = "vocabulary"
    sentence = "sentence"


class QuizQuestionResponse(BaseModel):
    id: str
    article_id: str
    type: QuizQuestionType
    # The full correct answer to type: the target word (vocabulary) or the
    # full sentence (sentence).
    answer: str
    # The English text to show, with the target word/sentence replaced by a
    # blank ("＿＿＿＿" / "＿＿＿＿＿＿＿＿＿＿").
    fill_in_sentence: str
    # Japanese translation of the full sentence, always shown as the hint.
    sentence_translation_ja: str
    # Populated only for type="vocabulary".
    part_of_speech_ja: str | None = None
    meaning_ja: str | None = None
