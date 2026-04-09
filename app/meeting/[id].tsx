import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meeting Detail</Text>
      <Text style={styles.body}>Meeting ID: {id ?? "unknown"}</Text>
      <Text style={styles.body}>
        This is a placeholder detail route for the future transcript and summary
        view.
      </Text>
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
  }
});
