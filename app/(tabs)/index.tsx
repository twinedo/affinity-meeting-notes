import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Affinity Meeting Notes</Text>
      <Text style={styles.body}>
        Baseline Expo Router scaffold for the take-home task. Recording,
        notifications, Supabase, and backend logic are intentionally not wired
        yet.
      </Text>
      <Link href="/meeting/example-meeting" style={styles.link}>
        Open placeholder meeting detail
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 12
  },
  title: {
    fontSize: 28,
    fontWeight: "700"
  },
  body: {
    fontSize: 16,
    lineHeight: 24
  },
  link: {
    color: "#0f62fe",
    fontSize: 16,
    fontWeight: "600"
  }
});
