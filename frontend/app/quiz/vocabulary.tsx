import { useLocalSearchParams } from "expo-router";

import { QuizSession } from "@/components/QuizSession";
import { questionStatusLabelsJa } from "@/constants/theme";
import type { QuestionStatus } from "@/types";

export default function VocabularyQuizScreen() {
  const { articleId, status } = useLocalSearchParams<{
    articleId: string;
    status?: QuestionStatus;
  }>();
  return (
    <QuizSession
      articleId={articleId}
      type="vocabulary"
      title={status ? `単語クイズ（${questionStatusLabelsJa[status]}）` : "単語クイズ"}
      status={status}
    />
  );
}
