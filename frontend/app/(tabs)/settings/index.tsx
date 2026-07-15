import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GradientHeader } from "@/components/GradientHeader";
import { useAppStore, type ColorSchemePreference } from "@/store/useAppStore";

const COLOR_SCHEME_OPTIONS: { value: ColorSchemePreference; label: string }[] = [
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
  { value: "system", label: "端末に合わせる" },
];

const DAILY_GOAL_STEPS = [5, 10, 15, 20];

export default function SettingsScreen() {
  const colorScheme = useAppStore((state) => state.colorScheme);
  const setColorScheme = useAppStore((state) => state.setColorScheme);
  const dailyGoal = useAppStore((state) => state.dailyGoal);
  const setDailyGoal = useAppStore((state) => state.setDailyGoal);

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-neutral-900" edges={["bottom"]}>
      <GradientHeader title="設定" subtitle="表示テーマや学習目標をカスタマイズ" />

      <View className="flex-1 px-5 pt-4" style={{ gap: 16 }}>
        <Card>
          <Text className="mb-3 text-base font-semibold text-neutral-900 dark:text-white">
            表示テーマ
          </Text>
          <View style={{ gap: 8 }}>
            {COLOR_SCHEME_OPTIONS.map((option) => (
              <Button
                key={option.value}
                label={option.label}
                variant={colorScheme === option.value ? "primary" : "secondary"}
                onPress={() => setColorScheme(option.value)}
              />
            ))}
          </View>
        </Card>

        <Card>
          <Text className="mb-3 text-base font-semibold text-neutral-900 dark:text-white">
            1日の学習目標(記事数)
          </Text>
          <View className="flex-row" style={{ gap: 8 }}>
            {DAILY_GOAL_STEPS.map((goal) => (
              <View key={goal} className="flex-1">
                <Button
                  label={String(goal)}
                  variant={dailyGoal === goal ? "primary" : "secondary"}
                  onPress={() => setDailyGoal(goal)}
                />
              </View>
            ))}
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}
