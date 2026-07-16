import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateQuestionStatus } from "@/api/questions";
import type { QuestionStatus } from "@/types";

/**
 * Sets a question's status - called from the auto-grading sync in
 * QuizSession. Invalidates the owning article's question list so the
 * status/test shortcuts and vocabulary list on the article detail screen
 * stay in sync.
 */
export function useUpdateQuestionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, status }: { questionId: string; status: QuestionStatus }) =>
      updateQuestionStatus(questionId, status),
    onSuccess: (question) => {
      queryClient.invalidateQueries({
        queryKey: ["articles", question.articleId, "questions"],
      });
    },
  });
}
