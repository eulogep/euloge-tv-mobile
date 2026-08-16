import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { Platform } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#A27BFF",
        tabBarInactiveTintColor: "#747386",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: "rgba(16,16,29,0.98)",
          borderTopColor: "rgba(162,123,255,0.28)",
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} />,
        }}
      />
      <Tabs.Screen name="explore" options={{ title: "Explorer", tabBarIcon: ({ color }) => <MaterialIcons size={24} name="explore" color={color} /> }} />
      <Tabs.Screen name="live" options={{ title: "Live", tabBarIcon: ({ color }) => <MaterialIcons size={24} name="sensors" color={color} /> }} />
      <Tabs.Screen name="my-list" options={{ title: "Ma liste", tabBarIcon: ({ color }) => <MaterialIcons size={24} name="star-outline" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profil", tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person-outline" color={color} /> }} />
    </Tabs>
  );
}
