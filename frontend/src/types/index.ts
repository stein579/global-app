// =============================================================
// Domain types mirroring the backend's 4-tier data model:
// Article -> Paragraph -> Sentence -> Vocabulary
// =============================================================

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface VocabularyItem {
  id: string;
  sentenceId: string;
  word: string;
  partOfSpeech: string;
  meaningJa: string;
}

export interface SentenceItem {
  id: string;
  paragraphId: string;
  orderIndex: number;
  text: string;
  translationJa: string;
  vocabulary: VocabularyItem[];
}

export interface ParagraphItem {
  id: string;
  articleId: string;
  orderIndex: number;
  text: string;
  translationJa: string;
  sentences: SentenceItem[];
}

export interface ArticleSummary {
  id: string;
  title: string;
  summaryJa: string;
  difficultyLevel: DifficultyLevel;
  sourceUrl: string | null;
  createdAt: string;
}

export interface ArticleDetail extends ArticleSummary {
  rawText: string;
  paragraphs: ParagraphItem[];
}

// The app supports exactly two review-quiz modes, both 日→英 記述
// (spelling): fill in the target word ("vocabulary") or type out the
// whole sentence ("sentence").
export type QuizQuestionType = "vocabulary" | "sentence";

export interface QuizQuestion {
  id: string;
  articleId: string;
  type: QuizQuestionType;
  /** The full correct answer: the target word or the full sentence. */
  answer: string;
  /** The English text to show, with the target word/sentence blanked out. */
  fillInSentence: string;
  /** Japanese translation of the full sentence, always shown as a hint. */
  sentenceTranslationJa: string;
  /** Populated only for type "vocabulary". */
  partOfSpeechJa: string | null;
  meaningJa: string | null;
}

export interface FlashCard {
  id: string;
  vocabularyId: string;
  word: string;
  meaningJa: string;
  nextReviewAt: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

// --- API request payloads ---------------------------------------------

export interface AnalyzeArticleRequest {
  rawText: string;
  title?: string;
  sourceUrl?: string;
}

export interface AnalyzeArticleResponse {
  article: ArticleDetail;
  questionsGenerated: number;
}
