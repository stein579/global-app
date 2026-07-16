import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GradientHeader } from "@/components/GradientHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import { useUpdateQuestionStatus } from "@/hooks/useUpdateQuestionStatus";
import { useReviewStore } from "@/store/useReviewStore";
import type { QuestionStatus, QuizQuestionType } from "@/types";

interface QuizSessionProps {
  articleId: string | undefined;
  type: QuizQuestionType;
  title: string;
  /** Restricts the session to questions currently in this status - powers
   * the article detail screen's "テストへ直行" shortcuts. */
  status?: QuestionStatus;
}

/**
 * Shared quiz runner behind `quiz/vocabulary` and `quiz/sentence` - both are
 * 日→英 記述 (spelling) only, differing solely in question `type` and header
 * copy, so the session UI/logic lives here once. `isCorrect` (rather than
 * the raw input value, which can legitimately be an empty-feeling string)
 * is the single source of truth for whether the current question has been
 * answered yet.
 */
export function QuizSession({ articleId, type, title, status }: QuizSessionProps) {
  const router = useRouter();
  const { data: questions, isLoading } = useQuizQuestions(articleId, type, status);
  const { currentIndex, score, submitAnswer, next, reset } = useReviewStore();
  const updateQuestionStatus = useUpdateQuestionStatus();
  const [inputValue, setInputValue] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const resetQuestionState = () => {
    setInputValue("");
    setIsCorrect(null);
  };

  useEffect(() => {
    reset();
    resetQuestionState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId, type, status, reset]);

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
        <GradientHeader title={title} subtitle="結果" />
        <View className="flex-1 items-center justify-center px-6" style={{ gap: 16 }}>
          <Card>
            <Text className="text-center text-lg font-semibold text-neutral-900 dark:text-white">
              {total === 0 ? "クイズがまだありません" : `スコア: ${score} / ${total}`}
            </Text>
          </Card>
          <View style={{ gap: 12, width: "100%" }}>
            {total > 0 ? (
              <Button
                label="もう一度挑戦"
                onPress={() => {
                  reset();
                  resetQuestionState();
                }}
              />
            ) : null}
            <Button label="戻る" variant="secondary" onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const question = questions[currentIndex];
  const answered = isCorrect !== null;

  const handleSubmit = () => {
    if (answered) return;
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) return;
    const correct = trimmed.toLowerCase() === question.answer.trim().toLowerCase();
    setIsCorrect(correct);
    submitAnswer(question.id, trimmed, correct);
    updateQuestionStatus.mutate({
      questionId: question.id,
      status: correct ? "correct" : "incorrect",
    });
  };

  const handleNext = () => {
    resetQuestionState();
    next();
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-neutral-900" edges={["bottom"]}>
      <GradientHeader
        title={title}
        subtitle={`${currentIndex + 1} / ${total} 問`}
        right={<Button label="中断" variant="secondary" onPress={() => router.back()} />}
      />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingVertical: 20, gap: 16 }}>
        <ProgressBar progress={currentIndex / total} />

        <Card>
          {question.partOfSpeechJa || question.meaningJa ? (
            <View className="flex-row flex-wrap items-center" style={{ gap: 8 }}>
              {question.partOfSpeechJa ? (
                <Text className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-200">
                  品詞: {question.partOfSpeechJa}
                </Text>
              ) : null}
              {question.meaningJa ? (
                <Text className="text-sm text-neutral-600 dark:text-neutral-300">
                  意味: {question.meaningJa}
                </Text>
              ) : null}
            </View>
          ) : null}

          <Text className="mt-3 text-base leading-6 text-neutral-900 dark:text-white">
            {question.fillInSentence}
          </Text>

          <View className="mt-3 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-700/40">
            <Text className="text-xs font-medium text-neutral-400">日本語訳ヒント</Text>
            <Text className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              {question.sentenceTranslationJa}
            </Text>
          </View>
        </Card>

        <View style={{ gap: 10 }}>
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={type === "vocabulary" ? handleSubmit : undefined}
            editable={!answered}
            multiline={type === "sentence"}
            numberOfLines={type === "sentence" ? 3 : 1}
            placeholder={
              type === "sentence" ? "英文を入力してください" : "解答を入力 (正しい活用・スペル)"
            }
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            textAlignVertical={type === "sentence" ? "top" : "center"}
            className={`rounded-lg border px-3 py-3 text-base text-neutral-900 dark:text-white ${
              type === "sentence" ? "min-h-20" : ""
            } ${
              !answered
                ? "border-neutral-200 dark:border-neutral-700"
                : isCorrect
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                  : "border-rose-400 bg-rose-50 dark:bg-rose-900/30"
            }`}
          />

          {!answered ? (
            <Button
              label="回答する"
              onPress={handleSubmit}
              disabled={inputValue.trim().length === 0}
            />
          ) : (
            <Card>
              <Text
                className={`text-base font-semibold ${
                  isCorrect
                    ? "text-emerald-600 dark:text-emerald-300"
                    : "text-rose-600 dark:text-rose-300"
                }`}
              >
                {isCorrect ? "正解！素晴らしい！完璧です！ 🎉" : `惜しい！この間違いが成長のチャンス！ ・ 正解: ${question.answer}`}
              </Text>
            </Card>
          )}
        </View>

        {answered ? <Button label="次へ" onPress={handleNext} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
