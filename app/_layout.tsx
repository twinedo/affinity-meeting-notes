import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useNotifications } from "../hooks/use-notifications";

export default function RootLayout() {
  useNotifications();

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="meeting/[id]" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
