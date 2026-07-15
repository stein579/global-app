import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";

// Which side a flashcard shows first - purely a client-side display choice,
// not a distinct backend question type (see `cards/flash.tsx`).
export type FlashCardDirection = "en_to_ja" | "ja_to_en";

export interface FlashCardOption {
  label: string;
  direction: FlashCardDirection;
}

export const FLASH_CARD_OPTIONS: FlashCardOption[] = [
  { label: "英→日", direction: "en_to_ja" },
  { label: "日→英", direction: "ja_to_en" },
];

interface QuizDirectionButtonsProps {
  label: string;
  articleId: string;
  options: FlashCardOption[];
}

/**
 * Section title + one button per flashcard direction, each launching
 * `cards/flash` with a different `direction` query param.
 */
export function QuizDirectionButtons({ label, articleId, options }: QuizDirectionButtonsProps) {
  const router = useRouter();

  return (
    <View style={{ gap: 8 }}>
      <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</Text>
      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {options.map((option, index) => (
          <View key={option.direction} style={{ flexBasis: "48%", flexGrow: 1 }}>
            <Button
              label={option.label}
              variant={index === 0 ? "primary" : "secondary"}
              onPress={() =>
                router.push(`/cards/flash?articleId=${articleId}&direction=${option.direction}`)
              }
            />
          </View>
        ))}
      </View>
    </View>
  );
}
