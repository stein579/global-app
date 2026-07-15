import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteArticle } from "@/api/articles";

/**
 * Deletes an article (and, via DB cascade, its paragraphs/sentences/
 * vocabulary/quiz_questions/review_cards), then invalidates the article
 * list so `articles/index` drops it immediately.
 */
export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
