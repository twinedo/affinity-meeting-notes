import { Link } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMeetingsStore } from "../../stores/meetings-store";
import { getMeetingStatusLabel } from "../../utils/fun";

export default function MeetingsScreen() {
  const errorMessage = useMeetingsStore((state) => state.errorMessage);
  const fetchMeetings = useMeetingsStore((state) => state.fetchMeetings);
  const hasLoaded = useMeetingsStore((state) => state.hasLoaded);
  const isLoading = useMeetingsStore((state) => state.isLoading);
  const meetings = useMeetingsStore((state) => state.meetings);

  useEffect(() => {
    void fetchMeetings();
  }, [fetchMeetings]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meetings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {isLoading && meetings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Loading meetings...</Text>
          </View>
        ) : null}
        {hasLoaded && !isLoading && meetings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No meetings yet</Text>
            <Text style={styles.emptyBody}>
              Record a meeting from Home after Supabase is configured.
            </Text>
          </View>
        ) : null}
        {meetings.map((meeting) => (
          <Link href={`/meeting/${meeting.id}`} key={meeting.id} asChild>
            <Pressable style={styles.card}>
              <Text style={styles.cardTitle}>{meeting.title}</Text>
              <View
                style={[
                  styles.statusPill,
                  meeting.status === "completed"
                    ? styles.completedPill
                    : meeting.status === "uploaded"
                      ? styles.uploadedPill
                      : styles.processingPill
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    meeting.status === "completed"
                      ? styles.completedText
                      : meeting.status === "uploaded"
                        ? styles.uploadedText
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
  uploadedPill: {
    backgroundColor: "#D9E8FF"
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
  uploadedText: {
    color: "#2F5FB8"
  },
  preview: {
    color: "#7A8395",
    fontSize: 16,
    marginTop: 12
  },
  completedPreview: {
    color: "#364152",
    fontWeight: "600"
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 12
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E6EBF3",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2
  },
  emptyTitle: {
    color: "#364152",
    fontSize: 16,
    fontWeight: "700"
  },
  emptyBody: {
    color: "#667085",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8
  }
});
