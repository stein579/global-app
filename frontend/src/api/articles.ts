import type {
  AnalyzeArticleRequest,
  AnalyzeArticleResponse,
  ArticleDetail,
  ArticleSummary,
  DifficultyLevel,
  ParagraphItem,
  QuizQuestion,
  SentenceItem,
  VocabularyItem,
} from "@/types";

import { apiClient } from "./client";

// =========================================================================
// snake_case DTOs as returned by the FastAPI backend
// =========================================================================

interface ArticleSummaryDto {
  id: string;
  title: string;
  summary_ja: string;
  difficulty_level: DifficultyLevel;
  source_url: string | null;
  created_at: string;
}

interface VocabularyDto {
  id: string;
  sentence_id: string;
  word: string;
  part_of_speech: string;
  meaning_ja: string;
}

interface SentenceDto {
  id: string;
  paragraph_id: string;
  order_index: number;
  text: string;
  translation_ja: string;
  vocabulary: VocabularyDto[];
}

interface ParagraphDto {
  id: string;
  article_id: string;
  order_index: number;
  text: string;
  translation_ja: string;
  sentences: SentenceDto[];
}

interface ArticleDetailDto extends ArticleSummaryDto {
  raw_text: string;
  paragraphs: ParagraphDto[];
}

interface QuizQuestionDto {
  id: string;
  article_id: string;
  type: QuizQuestion["type"];
  answer: string;
  fill_in_sentence: string;
  sentence_translation_ja: string;
  part_of_speech_ja: string | null;
  meaning_ja: string | null;
}

interface AnalyzeArticleResponseDto {
  article: ArticleDetailDto;
  questions_generated: number;
}

// =========================================================================
// DTO -> domain model mappers (keeps the rest of the app in camelCase)
// =========================================================================

const mapArticleSummary = (dto: ArticleSummaryDto): ArticleSummary => ({
  id: dto.id,
  title: dto.title,
  summaryJa: dto.summary_ja,
  difficultyLevel: dto.difficulty_level,
  sourceUrl: dto.source_url,
  createdAt: dto.created_at,
});

const mapVocabulary = (dto: VocabularyDto): VocabularyItem => ({
  id: dto.id,
  sentenceId: dto.sentence_id,
  word: dto.word,
  partOfSpeech: dto.part_of_speech,
  meaningJa: dto.meaning_ja,
});

const mapSentence = (dto: SentenceDto): SentenceItem => ({
  id: dto.id,
  paragraphId: dto.paragraph_id,
  orderIndex: dto.order_index,
  text: dto.text,
  translationJa: dto.translation_ja,
  vocabulary: dto.vocabulary.map(mapVocabulary),
});

const mapParagraph = (dto: ParagraphDto): ParagraphItem => ({
  id: dto.id,
  articleId: dto.article_id,
  orderIndex: dto.order_index,
  text: dto.text,
  translationJa: dto.translation_ja,
  sentences: dto.sentences.map(mapSentence),
});

const mapArticleDetail = (dto: ArticleDetailDto): ArticleDetail => ({
  ...mapArticleSummary(dto),
  rawText: dto.raw_text,
  paragraphs: dto.paragraphs.map(mapParagraph),
});

const mapQuizQuestion = (dto: QuizQuestionDto): QuizQuestion => ({
  id: dto.id,
  articleId: dto.article_id,
  type: dto.type,
  answer: dto.answer,
  fillInSentence: dto.fill_in_sentence,
  sentenceTranslationJa: dto.sentence_translation_ja,
  partOfSpeechJa: dto.part_of_speech_ja,
  meaningJa: dto.meaning_ja,
});

// =========================================================================
// API calls
// =========================================================================

export async function fetchArticles(): Promise<ArticleSummary[]> {
  const { data } = await apiClient.get<ArticleSummaryDto[]>("/v1/articles");
  return data.map(mapArticleSummary);
}

export async function fetchArticle(articleId: string): Promise<ArticleDetail> {
  const { data } = await apiClient.get<ArticleDetailDto>(`/v1/articles/${articleId}`);
  return mapArticleDetail(data);
}

export async function deleteArticle(articleId: string): Promise<void> {
  await apiClient.delete(`/v1/articles/${articleId}`);
}

export async function fetchArticleQuestions(articleId: string): Promise<QuizQuestion[]> {
  const { data } = await apiClient.get<QuizQuestionDto[]>(
    `/v1/articles/${articleId}/questions`
  );
  return data.map(mapQuizQuestion);
}

export async function analyzeArticle(
  payload: AnalyzeArticleRequest
): Promise<AnalyzeArticleResponse> {
  const { data } = await apiClient.post<AnalyzeArticleResponseDto>("/v1/articles/analyze", {
    raw_text: payload.rawText,
    title: payload.title,
    source_url: payload.sourceUrl,
  });
  return {
    article: mapArticleDetail(data.article),
    questionsGenerated: data.questions_generated,
  };
}
