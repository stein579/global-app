import { useLocalSearchParams } from "expo-router";

import { QuizSession } from "@/components/QuizSession";

export default function VocabularyQuizScreen() {
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  return <QuizSession articleId={articleId} type="vocabulary" title="単語クイズ" />;
}
