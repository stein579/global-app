import { useLocalSearchParams } from "expo-router";

import { QuizSession } from "@/components/QuizSession";

export default function SentenceQuizScreen() {
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  return <QuizSession articleId={articleId} type="sentence" title="文章クイズ" />;
}
