import { Alert, Platform } from "react-native";

/**
 * Cross-platform confirmation dialog for destructive actions.
 *
 * `Alert.alert`'s multi-button API is not implemented by react-native-web:
 * on web it degrades to a single-button `window.alert` and never invokes any
 * button's `onPress`, so a "delete" confirmation silently does nothing when
 * running in a browser. Route through `window.confirm` on web instead, and
 * keep the native `Alert.alert` behavior on iOS/Android.
 */
export function confirmDestructiveAction(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void
) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: "キャンセル", style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ]);
}
