import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GradientHeader } from "@/components/GradientHeader";
import { FLASH_CARD_OPTIONS, QuizDirectionButtons } from "@/components/QuizDirectionButtons";
import { difficultyColors, difficultyLabelsJa } from "@/constants/theme";
import { useArticle } from "@/hooks/useArticle";
import { useDeleteArticle } from "@/hooks/useDeleteArticle";
import type { ParagraphItem } from "@/types";
import { confirmDestructiveAction } from "@/utils/confirm";

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: article, isLoading } = useArticle(id);
  const deleteArticle = useDeleteArticle();

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
      </ScrollView>
    </SafeAreaView>
  );
}
