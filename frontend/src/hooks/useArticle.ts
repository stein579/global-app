import { useQuery } from "@tanstack/react-query";

import { fetchArticle } from "@/api/articles";

/** Single article with its full paragraph/sentence/vocabulary tree, backing `articles/[id]`. */
export function useArticle(articleId: string | undefined) {
  return useQuery({
    queryKey: ["articles", articleId],
    queryFn: () => fetchArticle(articleId as string),
    enabled: Boolean(articleId),
  });
}
