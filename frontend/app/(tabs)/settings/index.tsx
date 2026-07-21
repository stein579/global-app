import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GradientHeader } from "@/components/GradientHeader";
import { useAppStore, type ColorSchemePreference } from "@/store/useAppStore";
import { describeVoiceAccent, getAvailableEnglishVoices, guessVoiceGender, speakEnglish } from "@/utils/speech";

const COLOR_SCHEME_OPTIONS: { value: ColorSchemePreference; label: string }[] = [
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
  { value: "system", label: "端末に合わせる" },
];

const DAILY_GOAL_STEPS = [5, 10, 15, 20];

const SPEECH_RATE_OPTIONS: { value: number; label: string }[] = [
  { value: 0.5, label: "0.5x" },
  { value: 0.75, label: "0.75x" },
  { value: 1.0, label: "1.0x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 1.75, label: "1.75x" },
  { value: 2.0, label: "2.0x" },
];

const VOICE_PREVIEW_TEXT = "Hello, this is a test of the text to speech voice.";

const GENDER_LABELS_JA: Record<ReturnType<typeof guessVoiceGender>, string> = {
  female: "女性",
  male: "男性",
  unknown: "",
};

function VoiceRow({
  voice,
  selected,
  onSelect,
}: {
  voice: Speech.Voice;
  selected: boolean;
  onSelect: () => void;
}) {
  const genderLabel = GENDER_LABELS_JA[guessVoiceGender(voice.name)];
  const subtitle = [describeVoiceAccent(voice.language), genderLabel].filter(Boolean).join(" ・ ");

  return (
    <View className="flex-row items-center" style={{ gap: 8 }}>
      <Pressable
        onPress={onSelect}
        className={`flex-1 flex-row items-center justify-between rounded-xl px-4 py-3 ${
          selected ? "bg-primary-600" : "bg-primary-100 dark:bg-primary-900"
        }`}
      >
        <View>
          <Text className={`text-sm font-semibold ${selected ? "text-white" : "text-primary-700 dark:text-primary-200"}`}>
            {voice.name}
          </Text>
          {subtitle ? (
            <Text className={`text-xs ${selected ? "text-white/80" : "text-primary-600 dark:text-primary-300"}`}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {selected ? <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" /> : null}
      </Pressable>
      <Pressable
        onPress={() => {
          Speech.stop();
          speakEnglish(VOICE_PREVIEW_TEXT, voice.identifier ? { voice: voice.identifier } : {});
        }}
        hitSlop={8}
        className="items-center justify-center rounded-xl bg-primary-100 p-3 dark:bg-primary-900"
      >
        <Ionicons name="volume-medium-outline" size={18} color="#7C3AED" />
      </Pressable>
    </View>
  );
}

export default function SettingsScreen() {
  const colorScheme = useAppStore((state) => state.colorScheme);
  const setColorScheme = useAppStore((state) => state.setColorScheme);
  const dailyGoal = useAppStore((state) => state.dailyGoal);
  const setDailyGoal = useAppStore((state) => state.setDailyGoal);
  const voiceIdentifier = useAppStore((state) => state.voiceIdentifier);
  const setVoiceIdentifier = useAppStore((state) => state.setVoiceIdentifier);
  const speechRate = useAppStore((state) => state.speechRate);
  const setSpeechRate = useAppStore((state) => state.setSpeechRate);

  const [voices, setVoices] = useState<Speech.Voice[]>([]);

  useEffect(() => {
    getAvailableEnglishVoices().then(setVoices);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-neutral-900" edges={["bottom"]}>
      <GradientHeader title="設定" subtitle="表示テーマや学習目標をカスタマイズ" />

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingVertical: 20, gap: 16 }}>
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
            1日の学習目標(英文数)
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

        <Card>
          <Text className="mb-3 text-base font-semibold text-neutral-900 dark:text-white">
            読み上げ音声(英語)
          </Text>
          <View style={{ gap: 8 }}>
            <VoiceRow
              voice={{
                identifier: "",
                name: "自動(おすすめ)",
                language: "en-US",
                quality: Speech.VoiceQuality.Default,
              }}
              selected={voiceIdentifier === null}
              onSelect={() => setVoiceIdentifier(null)}
            />
            {voices.map((voice) => (
              <VoiceRow
                key={voice.identifier}
                voice={voice}
                selected={voiceIdentifier === voice.identifier}
                onSelect={() => setVoiceIdentifier(voice.identifier)}
              />
            ))}
            {voices.length === 0 ? (
              <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                端末に追加の英語音声が見つかりませんでした。OSの設定から音声を追加できます。
              </Text>
            ) : null}
          </View>
        </Card>

        <Card>
          <Text className="mb-3 text-base font-semibold text-neutral-900 dark:text-white">
            読み上げ速度
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {SPEECH_RATE_OPTIONS.map((option) => (
              <View key={option.value} style={{ width: "22%" }}>
                <Button
                  label={option.label}
                  variant={speechRate === option.value ? "primary" : "secondary"}
                  onPress={() => setSpeechRate(option.value)}
                />
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
