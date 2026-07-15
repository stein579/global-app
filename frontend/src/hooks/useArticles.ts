import { useQuery } from "@tanstack/react-query";

import { fetchArticles } from "@/api/articles";

/** List of generated articles, backing `articles/index`. */
export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: fetchArticles,
  });
}
