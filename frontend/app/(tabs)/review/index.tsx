import { useRouter } from "expo-router";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GradientHeader } from "@/components/GradientHeader";
import { FLASH_CARD_OPTIONS, QuizDirectionButtons } from "@/components/QuizDirectionButtons";
import { useArticles } from "@/hooks/useArticles";
import type { ArticleSummary } from "@/types";

function ReviewRow({ article }: { article: ArticleSummary }) {
  const router = useRouter();
  return (
    <Card className="mb-3">
      <Text className="mb-3 text-base font-semibold text-neutral-900 dark:text-white" numberOfLines={1}>
        {article.title}
      </Text>
      <View style={{ gap: 12 }}>
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
    </Card>
  );
}

export default function ReviewIndexScreen() {
  const { data: articles, isLoading, refetch, isRefetching } = useArticles();

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-neutral-900" edges={["bottom"]}>
      <GradientHeader title="復習" subtitle="記事ごとにクイズ・フラッシュカードで復習しましょう" />
      <View className="flex-1 px-5 pt-4">
        <FlatList
          data={articles ?? []}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => <ReviewRow article={item} />}
          ListEmptyComponent={
            !isLoading ? (
              <Text className="mt-10 text-center text-neutral-400">
                復習できる記事がありません。まずは記事を解析しましょう。
              </Text>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
