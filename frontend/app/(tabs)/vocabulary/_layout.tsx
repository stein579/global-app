import { Stack } from "expo-router";

/** Local stack so the article's word list can push over the article picker while staying in the 単語帳 tab. */
export default function VocabularyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
