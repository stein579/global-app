import { View } from "react-native";

interface ProgressBarProps {
  /** 0-1 */
  progress: number;
}

/** Simple horizontal progress indicator used in quiz/review flows. */
export function ProgressBar({ progress }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View className="h-2 w-full overflow-hidden rounded-full bg-primary-100 dark:bg-neutral-700">
      <View className="h-full rounded-full bg-primary-600" style={{ width: `${clamped * 100}%` }} />
    </View>
  );
}
