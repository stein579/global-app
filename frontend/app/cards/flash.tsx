import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GradientHeader } from "@/components/GradientHeader";
import { ProgressBar } from "@/components/ProgressBar";
import type { FlashCardDirection } from "@/components/QuizDirectionButtons";
import { QuizNavButtons } from "@/components/QuizNavButtons";
import { directionLabelsJa } from "@/constants/theme";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import { useReviewStore } from "@/store/useReviewStore";

export default function FlashCardScreen() {
  const { articleId, direction: rawDirection } = useLocalSearchParams<{
    articleId: string;
    direction?: FlashCardDirection;
  }>();
  const direction: FlashCardDirection = rawDirection ?? "en_to_ja";
  const router = useRouter();
  const { data: questions, isLoading } = useQuizQuestions(articleId, "vocabulary");
  const { currentIndex, next, previous, reset } = useReviewStore();
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    reset();
    setFlipped(false);
  }, [articleId, direction, reset]);

  if (isLoading || !questions) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary-50 dark:bg-neutral-900">
        <ActivityIndicator color="#7C3AED" />
      </SafeAreaView>
    );
  }

  const total = questions.length;
  const isFinished = total === 0 || currentIndex >= total;

  if (isFinished) {
    return (
      <SafeAreaView className="flex-1 bg-primary-50 dark:bg-neutral-900" edges={["bottom"]}>
        <GradientHeader title="フラッシュカード" subtitle={`${directionLabelsJa[direction]} ・ 完了`} />
        <View className="flex-1 items-center justify-center px-6" style={{ gap: 16 }}>
          <Card>
            <Text className="text-center text-lg font-semibold text-neutral-900 dark:text-white">
              {total === 0 ? "単語カードがまだありません" : "すべてのカードを確認しました"}
            </Text>
          </Card>
          <View style={{ gap: 12, width: "100%" }}>
            {total > 0 ? (
              <Button
                label="もう一度"
                onPress={() => {
                  reset();
                  setFlipped(false);
                }}
              />
            ) : null}
            <Button label="戻る" variant="secondary" onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const card = questions[currentIndex];
  const frontTerm = direction === "en_to_ja" ? card.answer : card.meaningJa;
  const backTerm = direction === "en_to_ja" ? card.meaningJa : card.answer;

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-neutral-900" edges={["bottom"]}>
      <GradientHeader
        title="フラッシュカード"
        subtitle={`${directionLabelsJa[direction]} ・ ${currentIndex + 1} / ${total} 枚`}
        right={<Button label="中断" variant="secondary" onPress={() => router.back()} />}
      />
      <View className="flex-1 px-5 pt-4" style={{ gap: 20 }}>
        <ProgressBar progress={currentIndex / total} />

        <Pressable onPress={() => setFlipped((prev) => !prev)} className="flex-1">
          <Card className="flex-1 items-center justify-center">
            {flipped ? (
              <View style={{ gap: 8 }}>
                <Text className="text-center text-xl font-bold text-primary-600 dark:text-primary-300">
                  {backTerm}
                </Text>
                {card.partOfSpeechJa ? (
                  <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                    {card.partOfSpeechJa}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text className="text-center text-2xl font-bold text-neutral-900 dark:text-white">
                {frontTerm}
              </Text>
            )}
            <Text className="mt-4 text-xs text-neutral-400">タップで裏返す</Text>
          </Card>
        </Pressable>

        <QuizNavButtons
          onPrevious={() => {
            setFlipped(false);
            previous();
          }}
          onNext={() => {
            setFlipped(false);
            next();
          }}
          isFirst={currentIndex === 0}
        />
      </View>
    </SafeAreaView>
  );
}
