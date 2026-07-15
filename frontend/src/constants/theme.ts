// Design tokens for the "vivid purple gradient header, bright light body"
// design system. Keep in sync with tailwind.config.js `primary` scale.

export const gradientColors = {
  light: ["#7C3AED", "#A855F7"] as const,
  dark: ["#4C1D95", "#6D28D9"] as const,
};

export const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  advanced: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200",
};

export const difficultyLabelsJa: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

// Flashcards let the learner flip which side is shown first; this is a
// purely client-side toggle, not a distinct backend question type.
export const directionLabelsJa: Record<string, string> = {
  en_to_ja: "英 → 日",
  ja_to_en: "日 → 英",
};
