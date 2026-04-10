import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMeetingsStore } from "../../stores/meetings-store";
import { getMeetingStatusLabel } from "../../utils/constant";

export default function MeetingsScreen() {
  const meetings = useMeetingsStore((state) => state.meetings);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meetings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {meetings.map((meeting) => (
          <Link href={`/meeting/${meeting.id}`} key={meeting.id} asChild>
            <Pressable style={styles.card}>
              <Text style={styles.cardTitle}>{meeting.title}</Text>
              <View
                style={[
                  styles.statusPill,
                  meeting.status === "completed"
                    ? styles.completedPill
                    : styles.processingPill
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    meeting.status === "completed"
                      ? styles.completedText
                      : styles.processingText
                  ]}
                >
                  {getMeetingStatusLabel(meeting.status)}
                </Text>
              </View>
              <Text
                style={[
                  styles.preview,
                  meeting.status === "completed" && styles.completedPreview
                ]}
              >
                {meeting.preview}
              </Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FE"
  },
  header: {
    alignItems: "center",
    borderBottomColor: "#E6EBF3",
    borderBottomWidth: 1,
    paddingBottom: 14,
    paddingTop: 10
  },
  headerTitle: {
    color: "#2F3747",
    fontSize: 28,
    fontWeight: "700"
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 14
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E6EBF3",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2
  },
  cardTitle: {
    color: "#364152",
    fontSize: 18,
    fontWeight: "700"
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  processingPill: {
    backgroundColor: "#FFE186"
  },
  completedPill: {
    backgroundColor: "#CFF5C7"
  },
  statusText: {
    fontSize: 15,
    fontWeight: "700"
  },
  processingText: {
    color: "#8A6A00"
  },
  completedText: {
    color: "#2C8B4B"
  },
  preview: {
    color: "#7A8395",
    fontSize: 16,
    marginTop: 12
  },
  completedPreview: {
    color: "#364152",
    fontWeight: "600"
  }
});
