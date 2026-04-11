import { Link } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMeetingsStore } from "../../stores/meetings-store";
import { APP_COLORS } from "../../utils/constant";
import { getMeetingStatusLabel } from "../../utils/fun";

export default function MeetingsScreen() {
  const insets = useSafeAreaInsets();
  const errorMessage = useMeetingsStore((state) => state.errorMessage);
  const fetchMeetings = useMeetingsStore((state) => state.fetchMeetings);
  const hasLoaded = useMeetingsStore((state) => state.hasLoaded);
  const isLoading = useMeetingsStore((state) => state.isLoading);
  const meetings = useMeetingsStore((state) => state.meetings);

  useEffect(() => {
    void fetchMeetings();
  }, [fetchMeetings]);

  return (
    <View style={styles.safeArea}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
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
            <Text style={styles.emptyBody}>
              Pulling the latest meetings from Supabase.
            </Text>
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
                    : meeting.status === "failed"
                      ? styles.failedPill
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
                      : meeting.status === "failed"
                        ? styles.failedText
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
                  meeting.status === "completed" && styles.completedPreview,
                  meeting.status === "failed" && styles.failedPreview
                ]}
              >
                {meeting.preview}
              </Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_COLORS.background
  },
  header: {
    alignItems: "center",
    backgroundColor: APP_COLORS.backgroundElevated,
    borderBottomColor: APP_COLORS.border,
    borderBottomWidth: 1,
    paddingBottom: 14,
    paddingTop: 10
  },
  headerTitle: {
    color: APP_COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "700"
  },
  content: {
    backgroundColor: APP_COLORS.background,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 24
  },
  card: {
    backgroundColor: APP_COLORS.surface,
    borderColor: APP_COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: APP_COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2
  },
  cardTitle: {
    color: APP_COLORS.textPrimary,
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
    backgroundColor: APP_COLORS.accentSoft
  },
  completedPill: {
    backgroundColor: "#CFF5C7"
  },
  uploadedPill: {
    backgroundColor: "#D9E8FF"
  },
  failedPill: {
    backgroundColor: "#FFD8D6"
  },
  statusText: {
    fontSize: 15,
    fontWeight: "700"
  },
  processingText: {
    color: APP_COLORS.accentText
  },
  completedText: {
    color: "#2C8B4B"
  },
  uploadedText: {
    color: "#2F5FB8"
  },
  failedText: {
    color: "#B42318"
  },
  preview: {
    color: APP_COLORS.textSecondary,
    fontSize: 16,
    marginTop: 12
  },
  completedPreview: {
    color: APP_COLORS.textPrimary,
    fontWeight: "600"
  },
  failedPreview: {
    color: "#8F2D23"
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 12
  },
  emptyCard: {
    backgroundColor: APP_COLORS.surface,
    borderColor: APP_COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: APP_COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2
  },
  emptyTitle: {
    color: APP_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "700"
  },
  emptyBody: {
    color: APP_COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8
  }
});
