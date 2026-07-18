import { Tabs } from "expo-router";
import { Text } from "react-native";

const TAB_ICONS: Record<string, string> = {
  dashboard: "📊",
  articles: "📚",
  vocabulary: "📖",
  review: "🔁",
  settings: "⚙️",
};

function TabIcon({ name, color }: { name: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{TAB_ICONS[name]}</Text>;
}

/** Bottom tab navigation for the app's four main sections. */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#7C3AED",
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "ダッシュボード",
          tabBarIcon: ({ color }) => <TabIcon name="dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="articles"
        options={{
          title: "英文",
          tabBarIcon: ({ color }) => <TabIcon name="articles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{
          title: "単語帳",
          tabBarIcon: ({ color }) => <TabIcon name="vocabulary" color={color} />,
        }}
      />
      <Tabs.Screen
        name="review/index"
        options={{
          title: "復習",
          tabBarIcon: ({ color }) => <TabIcon name="review" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: "設定",
          tabBarIcon: ({ color }) => <TabIcon name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}
