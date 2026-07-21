import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/Card";
import { GradientHeader } from "@/components/GradientHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { useArticles } from "@/hooks/useArticles";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardScreen() {
  const router = useRouter();
  const { data: articles, isLoading } = useArticles();
  const dailyGoal = useAppStore((state) => state.dailyGoal);

  const articleCount = articles?.length ?? 0;
  const progress = dailyGoal > 0 ? Math.min(articleCount / dailyGoal, 1) : 0;

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-neutral-900" edges={["bottom"]}>
      <GradientHeader
        title="ダッシュボード"
        subtitle="今日も英文を読んで学習しましょう"
      />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingVertical: 20, gap: 16 }}>
        <Card>
          <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            学習した英文数 / 目標
          </Text>
          <Text className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
            {isLoading ? "…" : articleCount} / {dailyGoal}
          </Text>
          <View className="mt-3">
            <ProgressBar progress={progress} />
          </View>
        </Card>

        <View style={{ gap: 12 }}>
          <Pressable onPress={() => router.push("/(tabs)/articles")}>
            <Card>
              <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                📚 英文一覧・新規解析
              </Text>
              <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                英文を貼り付けてAIで4階層データに解析し、教材を自動生成します
              </Text>
            </Card>
          </Pressable>

          <Pressable onPress={() => router.push("/(tabs)/review")}>
            <Card>
              <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                🔁 復習する
              </Text>
              <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                単語クイズ・文章クイズ・フラッシュカードで定着させましょう
              </Text>
            </Card>
          </Pressable>

          <Pressable onPress={() => router.push("/(tabs)/settings")}>
            <Card>
              <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                ⚙️ 設定
              </Text>
              <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                テーマや1日の学習目標をカスタマイズできます
              </Text>
            </Card>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
