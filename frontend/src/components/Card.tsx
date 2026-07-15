import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: ReactNode;
  className?: string;
}

/** Reusable elevated surface for list items and content blocks. */
export function Card({ children, className, ...rest }: CardProps) {
  return (
    <View
      className={`rounded-2xl bg-white p-4 shadow-sm shadow-black/5 dark:bg-neutral-800 ${
        className ?? ""
      }`}
      {...rest}
    >
      {children}
    </View>
  );
}
