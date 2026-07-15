import { ActivityIndicator, Pressable, Text } from "react-native";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
}

const containerClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 active:bg-primary-700",
  secondary: "bg-primary-100 active:bg-primary-200 dark:bg-primary-900",
  ghost: "border border-primary-300 bg-transparent dark:border-primary-700",
};

const labelClasses: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-primary-700 dark:text-primary-200",
  ghost: "text-primary-600 dark:text-primary-300",
};

/** Reusable action button with primary/secondary/ghost variants. */
export function Button({ label, onPress, variant = "primary", disabled, loading }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`items-center justify-center rounded-xl px-4 py-3 ${containerClasses[variant]} ${
        disabled || loading ? "opacity-50" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#7C3AED"} />
      ) : (
        <Text className={`text-base font-semibold ${labelClasses[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
