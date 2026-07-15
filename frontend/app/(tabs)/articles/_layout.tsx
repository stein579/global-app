import { Stack } from "expo-router";

/** Local stack so the article detail screen can push over the list while staying in the Articles tab. */
export default function ArticlesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
