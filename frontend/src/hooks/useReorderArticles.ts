import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reorderArticles } from "@/api/articles";
import type { ArticleSummary } from "@/types";

/**
 * Persists a drag-and-drop reorder of the article list (shared by 英文一覧
 * and 単語帳一覧, both backed by the same `["articles"]` query). Applies the
 * new order to the cache immediately so the drag doesn't snap back while the
 * request is in flight, and rolls back on failure.
 */
export function useReorderArticles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articles: ArticleSummary[]) => reorderArticles(articles.map((a) => a.id)),
    onMutate: async (articles: ArticleSummary[]) => {
      await queryClient.cancelQueries({ queryKey: ["articles"] });
      const previous = queryClient.getQueryData<ArticleSummary[]>(["articles"]);
      queryClient.setQueryData(["articles"], articles);
      return { previous };
    },
    onError: (_error, _articles, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["articles"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
