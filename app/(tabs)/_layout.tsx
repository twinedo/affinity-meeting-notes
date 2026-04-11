import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { APP_COLORS } from "../../utils/constant";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: APP_COLORS.accent,
        tabBarInactiveTintColor: APP_COLORS.tabInactive,
        tabBarStyle: {
          backgroundColor: APP_COLORS.backgroundElevated,
          borderTopColor: APP_COLORS.border,
          height: 64,
          paddingBottom: 4
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600"
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              color={color}
              name={focused ? "home" : "home-outline"}
              size={size}
            />
          )
        }}
      />
      <Tabs.Screen
        name="meetings"
        options={{
          title: "Meetings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              color={color}
              name={focused ? "briefcase" : "briefcase-outline"}
              size={size}
            />
          )
        }}
      />
    </Tabs>
  );
}
