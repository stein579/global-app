import * as Speech from "expo-speech";

import { useAppStore } from "@/store/useAppStore";

// On some devices/browsers the system's default voice is a local-language
// voice reading English phonetically (e.g. a Japanese voice sounding out
// English words) rather than an actual English speaker. Explicitly picking
// an installed English voice - and letting the user override it from
// Settings - fixes that without any paid TTS API.
const NATIVE_ENGLISH_LOCALES = ["en-us", "en-gb"];

const PREFERRED_ENGLISH_VOICE_NAMES: RegExp[] = [
  /^google us english$/i,
  /^google uk english/i,
  /^samantha$/i,
  /^ava/i,
  /^evan$/i,
  /^tom$/i,
  /^alex$/i,
  /^daniel$/i,
  /^karen$/i,
  /^moira$/i,
  /^tessa$/i,
  /^fiona$/i,
];

const FEMALE_VOICE_NAMES = [
  "samantha",
  "ava",
  "zoe",
  "allison",
  "susan",
  "nicky",
  "kate",
  "serena",
  "karen",
  "moira",
  "tessa",
  "fiona",
  "veena",
  "zira",
  "hazel",
  "victoria",
];

const MALE_VOICE_NAMES = [
  "alex",
  "fred",
  "victor",
  "aaron",
  "evan",
  "tom",
  "daniel",
  "oliver",
  "arthur",
  "lee",
  "rishi",
  "david",
  "mark",
  "james",
  "george",
];

export type VoiceGender = "female" | "male" | "unknown";

function isNativeEnglishLocale(language: string): boolean {
  return NATIVE_ENGLISH_LOCALES.includes(language.toLowerCase());
}

function scoreVoice(voice: Speech.Voice): number {
  let score = 0;

  // iOS/Android report "Enhanced" for their higher-quality on-device voices.
  if (voice.quality === Speech.VoiceQuality.Enhanced) score += 100;

  // Prioritize American/British English over other English locales.
  if (isNativeEnglishLocale(voice.language)) score += 15;
  else if (/^en/i.test(voice.language)) score += 5;

  if (PREFERRED_ENGLISH_VOICE_NAMES.some((pattern) => pattern.test(voice.name))) score += 20;

  return score;
}

async function findBestEnglishVoice(): Promise<Speech.Voice | null> {
  const voices = await getAvailableEnglishVoices();
  if (voices.length === 0) return null;
  return voices[0];
}

/** Best-effort guess at a voice's gender, for display in the voice picker. */
export function guessVoiceGender(name: string): VoiceGender {
  const lower = name.toLowerCase();
  if (lower.includes("female")) return "female";
  if (lower.includes("male")) return "male";
  if (FEMALE_VOICE_NAMES.some((n) => lower.includes(n))) return "female";
  if (MALE_VOICE_NAMES.some((n) => lower.includes(n))) return "male";
  return "unknown";
}

const ACCENT_LABELS_JA: Record<string, string> = {
  "en-us": "アメリカ",
  "en-gb": "イギリス",
  "en-au": "オーストラリア",
  "en-ca": "カナダ",
  "en-ie": "アイルランド",
  "en-in": "インド",
  "en-nz": "ニュージーランド",
  "en-za": "南アフリカ",
};

/** Best-effort Japanese label for a voice's English accent/locale. */
export function describeVoiceAccent(language: string): string {
  return ACCENT_LABELS_JA[language.toLowerCase()] ?? language;
}

let englishVoicesPromise: Promise<Speech.Voice[]> | null = null;

/**
 * All installed English voices, best (native accent, high quality) first.
 * Cached for the session since the installed voice list doesn't change
 * while the app is running.
 */
export function getAvailableEnglishVoices(): Promise<Speech.Voice[]> {
  if (!englishVoicesPromise) {
    englishVoicesPromise = Speech.getAvailableVoicesAsync()
      .then((voices) =>
        voices
          .filter((voice) => /^en/i.test(voice.language))
          .sort((a, b) => scoreVoice(b) - scoreVoice(a))
      )
      .catch(() => []);
  }
  return englishVoicesPromise;
}

/**
 * Speaks English text using the user's chosen voice (see Settings), falling
 * back to the best auto-detected native English voice.
 */
export async function speakEnglish(text: string, options: Speech.SpeechOptions = {}) {
  const { voiceIdentifier: selectedVoiceIdentifier, speechRate } = useAppStore.getState();
  const voice = selectedVoiceIdentifier ?? (await findBestEnglishVoice())?.identifier;

  Speech.speak(text, {
    language: "en-US",
    rate: speechRate,
    ...options,
    voice: options.voice ?? voice,
  });
}
