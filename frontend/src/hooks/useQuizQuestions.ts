import { useQuery } from "@tanstack/react-query";

import { fetchArticleQuestions } from "@/api/articles";
import type { QuizQuestionType } from "@/types";

/**
 * Review quiz questions for a given article, optionally filtered by type.
 * Backs `quiz/vocabulary`, `quiz/sentence`, `cards/flash`.
 */
export function useQuizQuestions(articleId: string | undefined, type?: QuizQuestionType) {
  return useQuery({
    queryKey: ["articles", articleId, "questions"],
    queryFn: () => fetchArticleQuestions(articleId as string),
    enabled: Boolean(articleId),
    select: (questions) => (type ? questions.filter((q) => q.type === type) : questions),
  });
}
