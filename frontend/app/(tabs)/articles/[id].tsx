import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GradientHeader } from "@/components/GradientHeader";
import { FLASH_CARD_OPTIONS, QuizDirectionButtons } from "@/components/QuizDirectionButtons";
import {
  difficultyColors,
  difficultyLabelsJa,
  questionStatusColors,
  questionStatusLabelsJa,
} from "@/constants/theme";
import { useArticle } from "@/hooks/useArticle";
import { useDeleteArticle } from "@/hooks/useDeleteArticle";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import { useUpdateQuestionStatus } from "@/hooks/useUpdateQuestionStatus";
import type { ParagraphItem, QuestionStatus, QuizQuestion, QuizQuestionType } from "@/types";
import { confirmDestructiveAction } from "@/utils/confirm";

// The backend blanks the target word out with this full-width placeholder
// (see gemini_service.py / analyze_service.py); un-blanking it here rebuilds
// the model example sentence for the vocabulary list.
const WORD_BLANK = "＿＿＿＿";

const STATUS_ROWS: { status: QuestionStatus; label: string }[] = [
  { status: "correct", label: "覚えた" },
  { status: "incorrect", label: "復習" },
  { status: "unanswered", label: "未着手" },
];

// Tapping the status badge in the vocabulary list steps through all three
// states in this order, so every state is reachable in at most two taps.
const NEXT_STATUS: Record<QuestionStatus, QuestionStatus> = {
  correct: "incorrect",
  incorrect: "unanswered",
  unanswered: "correct",
};

function CountBadge({ status, label, count }: { status: QuestionStatus; label: string; count: number }) {
  return (
    <View
      className={`flex-1 items-center justify-center rounded-xl py-3 ${questionStatusColors[status]}`}
    >
      <Text className={`text-lg font-bold ${questionStatusColors[status]}`}>{count}</Text>
      <Text className={`text-xs font-medium ${questionStatusColors[status]}`}>{label}</Text>
    </View>
  );
}

function StatusTestRow({
  articleId,
  status,
  label,
  vocabularyCount,
  sentenceCount,
}: {
  articleId: string;
  status: QuestionStatus;
  label: string;
  vocabularyCount: number;
  sentenceCount: number;
}) {
  const router = useRouter();

  return (
    <View className="flex-row" style={{ gap: 8 }}>
      {/* 単語の状態: vocabulary-only count for this status. */}
      <CountBadge status={status} label={label} count={vocabularyCount} />
      <View className="flex-1">
        <Button
          label="単語"
          variant="secondary"
          disabled={vocabularyCount === 0}
          onPress={() => router.push(`/quiz/vocabulary?articleId=${articleId}&status=${status}`)}
        />
      </View>
      {/* 文章の状態: sentence-only count for this status, reflecting the
       * same per-sentence status shown in the vocabulary list below. Kept
       * separate from the vocabulary count above so toggling one type's
       * status never moves the other type's number. */}
      <CountBadge status={status} label={label} count={sentenceCount} />
      <View className="flex-1">
        <Button
          label="文章"
          variant="secondary"
          disabled={sentenceCount === 0}
          onPress={() => router.push(`/quiz/sentence?articleId=${articleId}&status=${status}`)}
        />
      </View>
    </View>
  );
}

function StatusPill({
  status,
  disabled,
  onPress,
}: {
  status: QuestionStatus;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      className={`items-center justify-center rounded-full px-2 py-1 ${questionStatusColors[status]} ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <Text className={`text-[10px] font-medium ${questionStatusColors[status]}`}>
        {questionStatusLabelsJa[status]}
      </Text>
    </Pressable>
  );
}

function VocabularyRow({
  question,
  sentenceQuestion,
}: {
  question: QuizQuestion;
  sentenceQuestion: QuizQuestion | undefined;
}) {
  const updateWordStatus = useUpdateQuestionStatus();
  const updateSentenceStatus = useUpdateQuestionStatus();

  const exampleSentence = question.fillInSentence.includes(WORD_BLANK)
    ? question.fillInSentence.replace(WORD_BLANK, question.answer)
    : question.fillInSentence;

  const handleSpeakWord = () => {
    Speech.stop();
    Speech.speak(question.answer, { language: "en-US" });
  };

  const handleSpeakSentence = () => {
    Speech.stop();
    Speech.speak(exampleSentence, { language: "en-US" });
  };

  // Cycles 覚えた → 復習 → 未着手 → 覚えた ... A quick manual override,
  // independent of the auto-grading sync in QuizSession.
  const handleToggleWordStatus = () => {
    updateWordStatus.mutate({
      questionId: question.id,
      status: NEXT_STATUS[question.status],
    });
  };

  const handleToggleSentenceStatus = () => {
    if (!sentenceQuestion) return;
    updateSentenceStatus.mutate({
      questionId: sentenceQuestion.id,
      status: NEXT_STATUS[sentenceQuestion.status],
    });
  };

  return (
    <View
      className="flex-row items-start border-b border-neutral-100 py-3 dark:border-neutral-700/60"
      style={{ gap: 8 }}
    >
      <View style={{ width: 132 }}>
        <Text className="text-sm font-semibold text-neutral-900 dark:text-white">
          {question.answer}
        </Text>
        {/* Word audio + 単語の状態 live in their own fixed slot at the end of
         * the row, same layout as the sentence column, so both line up in a
         * straight column regardless of how long the meaning text is. */}
        <View className="mt-0.5 flex-row items-start" style={{ gap: 4 }}>
          <Text className="flex-1 text-xs text-neutral-400">
            {question.partOfSpeechJa ? `${question.partOfSpeechJa}: ` : ""}
            {question.meaningJa}
          </Text>
          <View style={{ alignItems: "flex-end" }}>
            <Pressable
              onPress={handleSpeakWord}
              hitSlop={8}
              className="items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/40"
              style={{ width: 22, height: 22 }}
            >
              <Ionicons name="volume-medium-outline" size={12} color="#7C3AED" />
            </Pressable>
            <View className="mt-1">
              <StatusPill
                status={question.status}
                disabled={updateWordStatus.isPending}
                onPress={handleToggleWordStatus}
              />
            </View>
          </View>
        </View>
      </View>
      <View className="flex-1 flex-row items-start" style={{ gap: 6 }}>
        <View className="flex-1">
          <Text className="text-xs leading-5 text-neutral-700 dark:text-neutral-200">
            {exampleSentence}
          </Text>
          <Text className="mt-1 text-xs leading-5 text-neutral-400">
            {question.sentenceTranslationJa}
          </Text>
        </View>
        {/* Sentence audio + 文章の状態 live in their own fixed slot at the
         * end of the row, same as the word column, so both line up in a
         * straight column regardless of how long the sentence text is. */}
        <View style={{ alignItems: "flex-end" }}>
          <Pressable
            onPress={handleSpeakSentence}
            hitSlop={8}
            className="items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/40"
            style={{ width: 22, height: 22 }}
          >
            <Ionicons name="volume-medium-outline" size={12} color="#7C3AED" />
          </Pressable>
          {sentenceQuestion ? (
            <View className="mt-1">
              <StatusPill
                status={sentenceQuestion.status}
                disabled={updateSentenceStatus.isPending}
                onPress={handleToggleSentenceStatus}
              />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: article, isLoading } = useArticle(id);
  const deleteArticle = useDeleteArticle();
  const { data: questions } = useQuizQuestions(article?.id);

  const countsByType = useMemo(() => {
    const emptyCounts = (): Record<QuestionStatus, number> => ({
      unanswered: 0,
      correct: 0,
      incorrect: 0,
    });
    const counts: Record<QuizQuestionType, Record<QuestionStatus, number>> = {
      vocabulary: emptyCounts(),
      sentence: emptyCounts(),
    };
    for (const question of questions ?? []) counts[question.type][question.status] += 1;
    return counts;
  }, [questions]);

  const vocabularyQuestions = (questions ?? []).filter(
    (question) => question.type === "vocabulary"
  );

  if (isLoading || !article) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary-50 dark:bg-neutral-900">
        <ActivityIndicator color="#7C3AED" />
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    confirmDestructiveAction(
      "この記事を削除しますか？",
      "紐づくクイズや学習データもすべて消去されます。この操作は取り消せません。",
      "削除する",
      () => {
        deleteArticle.mutate(article.id, {
          onSuccess: () => router.replace("/(tabs)/articles"),
        });
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-neutral-900" edges={["bottom"]}>
      <GradientHeader
        title={article.title}
        subtitle={difficultyLabelsJa[article.difficultyLevel]}
        right={
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={handleDelete}
              hitSlop={8}
              className="rounded-full bg-white/20 p-2 active:bg-white/30"
            >
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            </Pressable>
            <Button label="戻る" variant="secondary" onPress={() => router.back()} />
          </View>
        }
      />

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingVertical: 20, gap: 16 }}>
        <Card>
          <Text
            className={`self-start rounded-full px-2 py-1 text-xs font-medium ${difficultyColors[article.difficultyLevel]}`}
          >
            {difficultyLabelsJa[article.difficultyLevel]}
          </Text>
          <Text className="mt-2 text-base text-neutral-700 dark:text-neutral-200">
            {article.summaryJa}
          </Text>
        </Card>

        {article.paragraphs.map((paragraph: ParagraphItem) => (
          <Card key={paragraph.id}>
            <Text className="text-base leading-6 text-neutral-900 dark:text-white">
              {paragraph.text}
            </Text>
            <Text className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              {paragraph.translationJa}
            </Text>
          </Card>
        ))}

        <View style={{ gap: 16 }}>
          <Button
            label="単語クイズを始める"
            onPress={() => router.push(`/quiz/vocabulary?articleId=${article.id}`)}
          />
          <Button
            label="文章クイズを始める"
            onPress={() => router.push(`/quiz/sentence?articleId=${article.id}`)}
          />
          <QuizDirectionButtons
            label="フラッシュカード"
            articleId={article.id}
            options={FLASH_CARD_OPTIONS}
          />
        </View>

        <View>
          <Text className="mb-3 text-base font-semibold text-neutral-900 dark:text-white">
            ステータス確認＆テストへ直行
          </Text>
          <View style={{ gap: 10 }}>
            {STATUS_ROWS.map(({ status, label }) => (
              <StatusTestRow
                key={status}
                articleId={article.id}
                status={status}
                label={label}
                vocabularyCount={countsByType.vocabulary[status]}
                sentenceCount={countsByType.sentence[status]}
              />
            ))}
          </View>
        </View>

        <View>
          <Text className="mb-3 text-base font-semibold text-neutral-900 dark:text-white">
            全単語一覧
          </Text>
          <Card>
            <View className="flex-row pb-2" style={{ gap: 8 }}>
              <Text className="text-xs font-medium text-neutral-400" style={{ width: 132 }}>
                単語 / 品詞: 意味
              </Text>
              <Text className="flex-1 text-xs font-medium text-neutral-400">
                例文 / 日本語ヒント
              </Text>
            </View>
            {vocabularyQuestions.length > 0 ? (
              vocabularyQuestions.map((question) => (
                <VocabularyRow
                  key={question.id}
                  question={question}
                  sentenceQuestion={(questions ?? []).find(
                    (candidate) =>
                      candidate.type === "sentence" &&
                      candidate.sentenceTranslationJa === question.sentenceTranslationJa
                  )}
                />
              ))
            ) : (
              <Text className="py-4 text-center text-sm text-neutral-400">
                単語問題がありません
              </Text>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
