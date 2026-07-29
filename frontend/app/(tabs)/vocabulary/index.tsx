import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/Card";
import { GradientHeader } from "@/components/GradientHeader";
import { ReorderableList } from "@/components/ReorderableList";
import { difficultyColors, difficultyLabelsJa } from "@/constants/theme";
import { useArticles } from "@/hooks/useArticles";
import { useReorderArticles } from "@/hooks/useReorderArticles";
import type { ArticleSummary } from "@/types";

function ArticleRow({
  article,
  onPress,
  onLongPress,
  isActive,
}: {
  article: ArticleSummary;
  onPress: () => void;
  onLongPress: () => void;
  isActive: boolean;
}) {
  return (
    <Card className={`mb-3 ${isActive ? "opacity-70" : ""}`}>
      <Pressable onPress={onPress} onLongPress={onLongPress} disabled={isActive} delayLongPress={250}>
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 text-base font-semibold text-neutral-900 dark:text-white" numberOfLines={1}>
            {article.title}
          </Text>
          <Text
            className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${difficultyColors[article.difficultyLevel]}`}
          >
            {difficultyLabelsJa[article.difficultyLevel]}
          </Text>
        </View>
      </Pressable>
    </Card>
  );
}

/** Picks which article's full vocabulary list to view, mirroring the 英文一覧 list's layout. */
export default function VocabularyIndexScreen() {
  const router = useRouter();
  const { data: articles, isLoading, refetch, isRefetching } = useArticles();
  const reorderArticles = useReorderArticles();

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-neutral-900" edges={["bottom"]}>
      <GradientHeader title="単語帳一覧" subtitle="英文を選ぶと全単語一覧が見られます" />

      <View className="flex-1 px-5 pt-4">
        <ReorderableList
          data={articles ?? []}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={refetch}
          onReorder={(data) => reorderArticles.mutate(data)}
          renderItem={({ item, drag, isActive }) => (
            <ArticleRow
              article={item}
              onPress={() => router.push(`/vocabulary/${item.id}`)}
              onLongPress={drag}
              isActive={isActive}
            />
          )}
          ListEmptyComponent={
            !isLoading ? (
              <Text className="mt-10 text-center text-neutral-400">
                まだ英文がありません。「英文」タブから新規解析で追加しましょう。
              </Text>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
