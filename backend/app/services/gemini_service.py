import logging
import re

from google import genai
from google.genai import types

from app.core.config import get_settings
from app.schemas.article import (
    ArticleAnalysisResult,
    DifficultyLevel,
    ParagraphItem,
    SentenceItem,
    VocabularyItem,
)

logger = logging.getLogger(__name__)

# Deliberately minimal: the model output is constrained by `response_schema`
# below (every field's type/required-ness is enforced by the SDK), so this
# prompt only needs to state the content rules, not the JSON shape.
_ANALYSIS_PROMPT = """あなたは日本人の英語学習者向けに教材を作る専門家です。
次の英文記事を、必ず以下の手順どおりに処理してください。

1. 英文の分割
   記事を段落ごとに分け、各段落をピリオドなどの文末記号で1文ずつ（sentences）に分割する。

2. 一語一句丁寧な日本語訳
   分割した1つ1つの英文について、一語一句丁寧な、完全な日本語訳を作る。
   英単語(前置詞や冠詞など特に注意)やダミーテキストは一切混ぜず、完全な日本語のみで書く。

3. 品詞の確認と単語の抽出
   その文の中から学習すべき重要な英単語を1〜3語選ぶ。
   それぞれの単語について、辞書通りの正しい品詞（名詞・動詞・形容詞・副詞など、日本語表記）と、
   その文脈における日本語の意味を1つだけ確定させる。
   単語はその文中に実際に現れる形（活用形・原形など、そのままのスペル）で記載する。

厳守事項:
- summary_ja、各段落・各文の翻訳、単語の意味は、すべて完全な自然な日本語で書く。
  英単語やアルファベット、"mock"や"TBD"のようなダミー・プレースホルダーは一切含めない。
- 品詞は必ず日本語表記にする（例: 名詞 / 動詞 / 形容詞 / 副詞 / 前置詞 / 接続詞 / 代名詞 / 熟語 / 句動詞）。
- 記事全体の難易度を "beginner" / "intermediate" / "advanced" のいずれかで判定する。

記事タイトルのヒント: {title}

記事:
\"\"\"
{raw_text}
\"\"\"
"""


def analyze_with_gemini(raw_text: str, title: str | None) -> ArticleAnalysisResult:
    """Calls Gemini with structured output (`response_schema` enforces the
    exact shape of `ArticleAnalysisResult`), so the model can only return a
    well-formed result. Falls back to a clearly-labeled offline mock only
    when no GEMINI_API_KEY is configured, so local development works
    without one."""

    settings = get_settings()
    if not settings.has_gemini:
        logger.info("GEMINI_API_KEY not set - using offline mock analysis")
        return _mock_analyze(raw_text, title)

    client = genai.Client(api_key=settings.gemini_api_key)
    prompt = _ANALYSIS_PROMPT.format(title=title or "(untitled)", raw_text=raw_text)

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ArticleAnalysisResult,
        ),
    )
    return ArticleAnalysisResult.model_validate(response.parsed)


def _split_sentences(text: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    return [s for s in sentences if s]


def _mock_analyze(raw_text: str, title: str | None) -> ArticleAnalysisResult:
    """Deterministic offline stand-in for the Gemini call, used only when no
    GEMINI_API_KEY is configured. Output is clearly labeled as a mock rather
    than pretending to be a real translation."""

    paragraph_texts = [p.strip() for p in raw_text.split("\n\n") if p.strip()] or [raw_text.strip()]

    paragraphs: list[ParagraphItem] = []
    for p_index, paragraph_text in enumerate(paragraph_texts):
        sentence_texts = _split_sentences(paragraph_text)
        sentences: list[SentenceItem] = []
        for s_index, sentence_text in enumerate(sentence_texts):
            words = sentence_text.split()
            target = next(
                (w.strip(".,!?\"'") for w in sorted(words, key=len, reverse=True) if len(w.strip(".,!?\"'")) > 2),
                words[0] if words else sentence_text,
            )
            sentences.append(
                SentenceItem(
                    order_index=s_index,
                    text=sentence_text,
                    translation_ja="（日本語訳: GEMINI_API_KEY未設定のためモック表示です）",
                    vocabulary=[
                        VocabularyItem(
                            word=target,
                            part_of_speech="不明",
                            meaning_ja=f"（{target} の意味: モック表示です）",
                        )
                    ],
                )
            )
        paragraphs.append(
            ParagraphItem(
                order_index=p_index,
                text=paragraph_text,
                translation_ja="（日本語訳: GEMINI_API_KEY未設定のためモック表示です）",
                sentences=sentences,
            )
        )

    return ArticleAnalysisResult(
        title=title or (paragraph_texts[0][:40] if paragraph_texts else "Untitled Article"),
        summary_ja="（要約: GEMINI_API_KEY未設定のためモック表示です）",
        difficulty_level=DifficultyLevel.intermediate,
        paragraphs=paragraphs,
    )
