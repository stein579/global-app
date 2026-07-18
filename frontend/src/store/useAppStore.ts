import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ColorSchemePreference = "light" | "dark" | "system";

interface AppState {
  colorScheme: ColorSchemePreference;
  dailyGoal: number;
  /** Selected TTS voice identifier (Speech.Voice#identifier), or null to auto-pick. */
  voiceIdentifier: string | null;
  setColorScheme: (scheme: ColorSchemePreference) => void;
  setDailyGoal: (goal: number) => void;
  setVoiceIdentifier: (voiceIdentifier: string | null) => void;
}

/**
 * Global, persisted app settings (theme preference, daily study goal, ...).
 * Backs the `settings/index` screen. Kept separate from ephemeral
 * per-session state (see useReviewStore) so persistence stays cheap.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      colorScheme: "system",
      dailyGoal: 10,
      voiceIdentifier: null,
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setDailyGoal: (dailyGoal) => set({ dailyGoal }),
      setVoiceIdentifier: (voiceIdentifier) => set({ voiceIdentifier }),
    }),
    {
      name: "app-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
