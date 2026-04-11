import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { useNotifications } from "../hooks/use-notifications";
import { APP_COLORS } from "../utils/constant";
import { ensureAnonymousSession } from "../utils/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

export default function RootLayout() {
  useNotifications();

  useEffect(() => {
    void ensureAnonymousSession().catch(() => {
      // Meeting queries will surface a useful error message if auth bootstrap fails.
    });
  }, []);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="meeting/[id]" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_COLORS.background
  }
});
