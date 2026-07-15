import { useMutation, useQueryClient } from "@tanstack/react-query";

import { analyzeArticle } from "@/api/articles";

/**
 * Submits raw English text for AI analysis + Supabase persistence, then
 * invalidates the article list so `articles/index` reflects the new entry.
 */
export function useAnalyzeArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analyzeArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
