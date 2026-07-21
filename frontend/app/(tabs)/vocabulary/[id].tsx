import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GradientHeader } from "@/components/GradientHeader";
import { difficultyLabelsJa, questionStatusColors, questionStatusLabelsJa } from "@/constants/theme";
import { useArticle } from "@/hooks/useArticle";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import { useResetQuestionStatuses } from "@/hooks/useResetQuestionStatuses";
import { useUpdateQuestionStatus } from "@/hooks/useUpdateQuestionStatus";
import type { QuestionStatus, QuizQuestion } from "@/types";
import { speakEnglish } from "@/utils/speech";

// The backend blanks the target word out with this full-width placeholder
// (see gemini_service.py / analyze_service.py); un-blanking it here rebuilds
// the model example sentence for the vocabulary list.
const WORD_BLANK = "＿＿＿＿";

// Tapping the status badge in the vocabulary list steps through all three
// states in this order, so every state is reachable in at most two taps.
const NEXT_STATUS: Record<QuestionStatus, QuestionStatus> = {
  correct: "incorrect",
  incorrect: "unanswered",
  unanswered: "correct",
};

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
      <Text className={`text-xs font-medium ${questionStatusColors[status]}`}>
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
    speakEnglish(question.answer);
  };

  const handleSpeakSentence = () => {
    Speech.stop();
    speakEnglish(exampleSentence);
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
      <View style={{ width: 160 }}>
        <Text className="text-base font-semibold text-neutral-900 dark:text-white">
          {question.answer}
        </Text>
        {/* Word audio + 単語の状態 live in their own fixed slot at the end of
         * the row, same layout as the sentence column, so both line up in a
         * straight column regardless of how long the meaning text is. */}
        <View className="mt-0.5 flex-row items-start" style={{ gap: 4 }}>
          <Text className="flex-1 text-sm text-neutral-500 dark:text-neutral-400">
            {question.partOfSpeechJa ? `${question.partOfSpeechJa}: ` : ""}
            {question.meaningJa}
          </Text>
          <View style={{ alignItems: "flex-end" }}>
            <Pressable
              onPress={handleSpeakWord}
              hitSlop={8}
              className="items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/40"
              style={{ width: 26, height: 26 }}
            >
              <Ionicons name="volume-medium-outline" size={14} color="#7C3AED" />
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
          <Text className="text-base leading-6 text-neutral-700 dark:text-neutral-200">
            {exampleSentence}
          </Text>
          <Text className="mt-1 text-base leading-6 text-neutral-500 dark:text-neutral-400">
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
            style={{ width: 26, height: 26 }}
          >
            <Ionicons name="volume-medium-outline" size={14} color="#7C3AED" />
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

/** Full 単語一覧 for a single article, reached from 単語帳 or the article detail screen's button. */
export default function VocabularyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: article, isLoading } = useArticle(id);
  const { data: questions } = useQuizQuestions(article?.id);
  // Separate mutation instances so each button's isPending/disabled state
  // is independent - sharing one mutation made pressing either button
  // visually "press" both.
  const resetWordStatuses = useResetQuestionStatuses(article?.id);
  const resetSentenceStatuses = useResetQuestionStatuses(article?.id);

  const vocabularyQuestions = (questions ?? []).filter(
    (question) => question.type === "vocabulary"
  );
  const sentenceQuestions = (questions ?? []).filter((question) => question.type === "sentence");

  const handleResetWordStatuses = () => {
    resetWordStatuses.mutate(vocabularyQuestions.map((question) => question.id));
  };

  const handleResetSentenceStatuses = () => {
    resetSentenceStatuses.mutate(sentenceQuestions.map((question) => question.id));
  };

  if (isLoading || !article) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary-50 dark:bg-neutral-900">
        <ActivityIndicator color="#7C3AED" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-neutral-900" edges={["bottom"]}>
      <GradientHeader
        eyebrow="単語帳"
        title={article.title}
        subtitle={difficultyLabelsJa[article.difficultyLevel]}
        right={
          <View style={{ gap: 8 }}>
            <Button
              label="単語帳一覧へ"
              variant="secondary"
              onPress={() => router.replace("/vocabulary")}
            />
            <Button
              label="英文 & Quizへ"
              variant="secondary"
              onPress={() => router.push(`/articles/${article.id}`)}
            />
          </View>
        }
      />

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingVertical: 20, gap: 16 }}>
        <Card>
          <View className="flex-row items-center pb-2" style={{ gap: 8 }}>
            <Text className="text-sm font-medium text-neutral-400" style={{ width: 160 }}>
              単語 / 品詞: 意味
            </Text>
            <Text className="flex-1 text-sm font-medium text-neutral-400">
              例文 / 日本語ヒント
            </Text>
            <View className="flex-row" style={{ gap: 6 }}>
              <Pressable
                onPress={handleResetWordStatuses}
                disabled={resetWordStatuses.isPending || vocabularyQuestions.length === 0}
                className={`rounded-full bg-neutral-100 px-2 py-1 dark:bg-neutral-700 ${
                  resetWordStatuses.isPending || vocabularyQuestions.length === 0
                    ? "opacity-50"
                    : ""
                }`}
              >
                <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-300">
                  単語の初期化
                </Text>
              </Pressable>
              <Pressable
                onPress={handleResetSentenceStatuses}
                disabled={resetSentenceStatuses.isPending || sentenceQuestions.length === 0}
                className={`rounded-full bg-neutral-100 px-2 py-1 dark:bg-neutral-700 ${
                  resetSentenceStatuses.isPending || sentenceQuestions.length === 0
                    ? "opacity-50"
                    : ""
                }`}
              >
                <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-300">
                  英文の初期化
                </Text>
              </Pressable>
            </View>
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
            <Text className="py-4 text-center text-sm text-neutral-400">単語問題がありません</Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
