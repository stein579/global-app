import { Redirect } from "expo-router";

/** Root path redirects straight into the Dashboard tab. */
export default function Index() {
  return <Redirect href="/(tabs)/dashboard" />;
}
