import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useColorScheme as useNativewindColorScheme } from "nativewind";
import { useEffect } from "react";

import { useAppStore } from "@/store/useAppStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

/**
 * App shell: wires up React Query (server cache) and syncs the persisted
 * Zustand color-scheme preference into NativeWind. All screen-specific
 * logic lives in hooks/screens, not here.
 */
export default function RootLayout() {
  const colorScheme = useAppStore((state) => state.colorScheme);
  const { setColorScheme } = useNativewindColorScheme();

  useEffect(() => {
    setColorScheme(colorScheme);
  }, [colorScheme, setColorScheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="quiz/vocabulary" options={{ presentation: "modal" }} />
        <Stack.Screen name="quiz/sentence" options={{ presentation: "modal" }} />
        <Stack.Screen name="cards/flash" options={{ presentation: "modal" }} />
      </Stack>
    </QueryClientProvider>
  );
}
