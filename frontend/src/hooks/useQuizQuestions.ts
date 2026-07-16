import { useQuery } from "@tanstack/react-query";

import { fetchArticleQuestions } from "@/api/articles";
import type { QuestionStatus, QuizQuestionType } from "@/types";

/**
 * Review quiz questions for a given article, optionally filtered by type
 * and/or status. Backs `quiz/vocabulary`, `quiz/sentence`, `cards/flash`,
 * and the article detail screen's status/test shortcuts and vocabulary list.
 */
export function useQuizQuestions(
  articleId: string | undefined,
  type?: QuizQuestionType,
  status?: QuestionStatus
) {
  return useQuery({
    queryKey: ["articles", articleId, "questions"],
    queryFn: () => fetchArticleQuestions(articleId as string),
    enabled: Boolean(articleId),
    select: (questions) =>
      questions.filter((q) => (!type || q.type === type) && (!status || q.status === status)),
  });
}
