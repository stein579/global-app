import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { gradientColors } from "@/constants/theme";

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  /** Small section label shown above the title, e.g. the section a detail screen belongs to. */
  eyebrow?: string;
  right?: ReactNode;
}

/** Vivid purple gradient header used at the top of every top-level screen. */
export function GradientHeader({ title, subtitle, eyebrow, right }: GradientHeaderProps) {
  const { colorScheme } = useColorScheme();
  const colors = colorScheme === "dark" ? gradientColors.dark : gradientColors.light;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-b-3xl px-5 pb-6 pt-16"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          {eyebrow ? (
            <Text className="text-xs font-semibold tracking-wide text-white/70">{eyebrow}</Text>
          ) : null}
          <Text className="text-2xl font-bold text-white">{title}</Text>
          {subtitle ? <Text className="mt-1 text-sm text-white/80">{subtitle}</Text> : null}
        </View>
        {right ? <View className="ml-3">{right}</View> : null}
      </View>
    </LinearGradient>
  );
}
