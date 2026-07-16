import { useLocalSearchParams } from "expo-router";

import { QuizSession } from "@/components/QuizSession";
import { questionStatusLabelsJa } from "@/constants/theme";
import type { QuestionStatus } from "@/types";

export default function SentenceQuizScreen() {
  const { articleId, status } = useLocalSearchParams<{
    articleId: string;
    status?: QuestionStatus;
  }>();
  return (
    <QuizSession
      articleId={articleId}
      type="sentence"
      title={status ? `文章クイズ（${questionStatusLabelsJa[status]}）` : "文章クイズ"}
      status={status}
    />
  );
}
