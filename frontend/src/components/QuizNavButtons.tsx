import { View } from "react-native";

import { Button } from "@/components/Button";

interface QuizNavButtonsProps {
  onPrevious: () => void;
  onNext: () => void;
  isFirst: boolean;
}

/**
 * Bottom-left 前へ/次へ pair letting the user move between questions/cards
 * at any time, independent of whether the current one has been answered.
 */
export function QuizNavButtons({ onPrevious, onNext, isFirst }: QuizNavButtonsProps) {
  return (
    <View className="flex-row" style={{ gap: 10 }}>
      <View style={{ width: 100 }}>
        <Button label="← 前へ" variant="secondary" onPress={onPrevious} disabled={isFirst} />
      </View>
      <View style={{ width: 100 }}>
        <Button label="次へ →" variant="secondary" onPress={onNext} />
      </View>
    </View>
  );
}
