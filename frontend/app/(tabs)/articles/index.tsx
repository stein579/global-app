import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GradientHeader } from "@/components/GradientHeader";
import { difficultyColors, difficultyLabelsJa } from "@/constants/theme";
import { useAnalyzeArticle } from "@/hooks/useAnalyzeArticle";
import { useArticles } from "@/hooks/useArticles";
import { useDeleteArticle } from "@/hooks/useDeleteArticle";
import type { ArticleSummary } from "@/types";
import { confirmDestructiveAction } from "@/utils/confirm";

function confirmDeleteArticle(title: string, onConfirm: () => void) {
  confirmDestructiveAction(
    "この記事を削除しますか？",
    `「${title}」を削除すると、紐づくクイズや学習データもすべて消去されます。この操作は取り消せません。`,
    "削除する",
    onConfirm
  );
}

function ArticleRow({
  article,
  onPress,
  onDelete,
}: {
  article: ArticleSummary;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="mb-3">
      <Pressable onPress={onPress} className="pr-8">
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
        <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400" numberOfLines={2}>
          {article.summaryJa}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => confirmDeleteArticle(article.title, onDelete)}
        hitSlop={8}
        className="absolute right-3 top-3 rounded-full p-1 active:bg-neutral-100 dark:active:bg-neutral-700"
      >
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </Pressable>
    </Card>
  );
}

export default function ArticlesIndexScreen() {
  const router = useRouter();
  const { data: articles, isLoading, refetch, isRefetching } = useArticles();
  const analyzeArticle = useAnalyzeArticle();
  const deleteArticle = useDeleteArticle();

  const [showForm, setShowForm] = useState(false);
  const [rawText, setRawText] = useState("");
  const [title, setTitle] = useState("");

  const handleAnalyze = () => {
    if (!rawText.trim()) return;
    analyzeArticle.mutate(
      { rawText, title: title.trim() || undefined },
      {
        onSuccess: (result) => {
          setShowForm(false);
          setRawText("");
          setTitle("");
          router.push(`/articles/${result.article.id}`);
        },
      }
    );
  };

  const analyzeErrorMessage = analyzeArticle.isError
    ? axios.isAxiosError(analyzeArticle.error)
      ? (analyzeArticle.error.response?.data?.detail ??
        (analyzeArticle.error.code === "ECONNABORTED"
          ? "サーバーからの応答がタイムアウトしました。記事が長い場合は時間がかかることがあります。"
          : "サーバーに接続できませんでした。バックエンドが起動しているか、接続先URLを確認してください。"))
      : "解析中にエラーが発生しました。"
    : null;

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-neutral-900" edges={["bottom"]}>
      <GradientHeader
        title="記事一覧"
        subtitle="AIが解析した英文教材"
        right={
          <Button
            label={showForm ? "閉じる" : "＋ 新規解析"}
            variant="secondary"
            onPress={() => setShowForm((prev) => !prev)}
          />
        }
      />

      <View className="flex-1 px-5 pt-4">
        {showForm ? (
          <Card className="mb-4">
            <Text className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              タイトル (任意)
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="例: A Short Story About the Sea"
              className="mb-3 rounded-lg border border-neutral-200 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:text-white"
              placeholderTextColor="#9CA3AF"
            />
            <Text className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              英文
            </Text>
            <TextInput
              value={rawText}
              onChangeText={setRawText}
              placeholder="解析したい英文を貼り付けてください"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="mb-3 h-32 rounded-lg border border-neutral-200 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:text-white"
            />
            <Button
              label="AIで解析してSupabaseへ保存"
              onPress={handleAnalyze}
              loading={analyzeArticle.isPending}
              disabled={!rawText.trim()}
            />
            {analyzeErrorMessage ? (
              <Text className="mt-2 text-sm text-rose-600 dark:text-rose-400">
                {analyzeErrorMessage}
              </Text>
            ) : null}
          </Card>
        ) : null}

        <FlatList
          data={articles ?? []}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <ArticleRow
              article={item}
              onPress={() => router.push(`/articles/${item.id}`)}
              onDelete={() => deleteArticle.mutate(item.id)}
            />
          )}
          ListEmptyComponent={
            !isLoading ? (
              <Text className="mt-10 text-center text-neutral-400">
                まだ記事がありません。「＋ 新規解析」から追加しましょう。
              </Text>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
