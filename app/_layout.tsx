import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useNotifications } from "../hooks/use-notifications";
import { APP_COLORS } from "../utils/constant";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";

export default function RootLayout() {
  useNotifications();

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
