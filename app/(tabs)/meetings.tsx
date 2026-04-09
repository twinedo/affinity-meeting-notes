import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const placeholderMeetings = [
  { id: "meeting-001", title: "Placeholder Meeting 001" },
  { id: "meeting-002", title: "Placeholder Meeting 002" }
];

export default function MeetingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meetings</Text>
      <Text style={styles.body}>
        Static route placeholder for the future meetings list.
      </Text>
      {placeholderMeetings.map((meeting) => (
        <Link
          href={`/meeting/${meeting.id}`}
          key={meeting.id}
          style={styles.link}
        >
          {meeting.title}
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 24
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
