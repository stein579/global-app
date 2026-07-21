import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateQuestionStatus } from "@/api/questions";

/**
 * Resets a batch of questions back to 未着手 - powers the 単語帳 header's
 * 単語の初期化 / 英文の初期化 buttons. Takes the owning article id purely to
 * invalidate its question list once all resets have landed.
 */
export function useResetQuestionStatuses(articleId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionIds: string[]) =>
      Promise.all(questionIds.map((questionId) => updateQuestionStatus(questionId, "unanswered"))),
    onSuccess: () => {
      if (!articleId) return;
      queryClient.invalidateQueries({ queryKey: ["articles", articleId, "questions"] });
    },
  });
}
