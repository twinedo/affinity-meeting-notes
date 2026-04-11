import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ExpoLinking from "expo-linking";
import { useEffect } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNotificationsStore } from "../../stores/notifications-store";
import { useRecordingController } from "../../hooks/use-recording-controller";
import { useMeetingsStore } from "../../stores/meetings-store";
import { APP_COLORS } from "../../utils/constant";
import { getMeetingStatusLabel } from "../../utils/fun";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const createMeetingFromRecording = useMeetingsStore(
    (state) => state.createMeetingFromRecording
  );
  const fetchMeetings = useMeetingsStore((state) => state.fetchMeetings);
  const isLoading = useMeetingsStore((state) => state.isLoading);
  const isSaving = useMeetingsStore((state) => state.isSaving);
  const meetings = useMeetingsStore((state) => state.meetings);
  const storeErrorMessage = useMeetingsStore((state) => state.errorMessage);
  const notificationPermissionState = useNotificationsStore(
    (state) => state.permissionState
  );
  const notificationRegistrationError = useNotificationsStore(
    (state) => state.registrationError
  );
  const recentMeeting = meetings[0];
  const recordingController = useRecordingController();
  const combinedErrorMessage =
    recordingController.errorMessage ?? storeErrorMessage;
  const availableHeight = height - insets.top - insets.bottom;
  const isCompactHeight = availableHeight < 720;
  const isNarrowWidth = width < 360;
  const horizontalPadding = isNarrowWidth ? 20 : 24;
  const topPadding = insets.top + 8;
  const bottomPadding = isCompactHeight ? 16 : 24;
  const heroMarginTop = isCompactHeight ? 12 : 20;
  const recordButtonSize = isCompactHeight ? 144 : 164;
  const recordIconSize = isCompactHeight ? 52 : 62;
  const recordButtonMarginTop = isCompactHeight ? 28 : 44;
  const helperMarginTop = isCompactHeight ? 20 : 32;
  const sectionPaddingTop = isCompactHeight ? 20 : 28;

  useEffect(() => {
    void fetchMeetings();
  }, [fetchMeetings]);

  async function handleRecordPress() {
    if (recordingController.isRecording) {
      const recordingResult = await recordingController.stopRecording();

      if (!recordingResult) {
        return;
      }

      await createMeetingFromRecording({
        audioFileUri: recordingResult.audioFileUri,
        durationMillis: recordingResult.durationMillis
      });
      return;
    }

    await recordingController.startRecording();
  }

  async function handleLogoPress() {
    await ExpoLinking.openURL("https://affinitylabs.ai/");
  }

  return (
    <View style={styles.safeArea}>
      <Pressable
        accessibilityRole="link"
        hitSlop={8}
        onPress={handleLogoPress}
        style={[
          styles.logoContainer,
          {
            marginLeft: 8,
            marginTop: topPadding,
            paddingHorizontal: 10,
            paddingVertical: 8
          }
        ]}
      >
        <Image
          source={require("../../assets/logo-text.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Pressable>
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingBottom: bottomPadding,
            paddingHorizontal: horizontalPadding
          }
        ]}
        showsVerticalScrollIndicator={false}
        style={styles.container}
      >
        <View>
          <View style={[styles.hero, { marginTop: heroMarginTop }]}>
            <Text style={styles.title}>In-Person Notes</Text>
            <Text style={styles.subtitle}>Record meetings, get notes</Text>
          </View>

          <View
            style={[styles.recordButtonShadow, { marginTop: recordButtonMarginTop }]}
          >
            <Pressable
              disabled={recordingController.isBusy || isSaving}
              onPress={handleRecordPress}
              style={[
                styles.recordButton,
                {
                  height: recordButtonSize,
                  width: recordButtonSize
                },
                recordingController.isRecording && styles.recordButtonActive,
                (recordingController.isBusy || isSaving) &&
                  styles.recordButtonDisabled
              ]}
            >
              <Ionicons color="#FFFFFF" name="mic" size={recordIconSize} />
              <Text style={styles.recordButtonLabel}>
                {recordingController.isRecording
                  ? "Stop Recording"
                  : isSaving
                    ? "Uploading..."
                    : "Start Recording"}
              </Text>
            </Pressable>
          </View>

          <Text
            style={[styles.helperText, { marginTop: helperMarginTop }]}
          >
            {recordingController.isRecording
              ? `Recording now • ${recordingController.timerLabel}`
              : isSaving
                ? "Saving your recording and preparing your meeting notes..."
                : "Tap to record and turn your conversation into notes."}
          </Text>

          {combinedErrorMessage ? (
            <Text style={styles.errorText}>{combinedErrorMessage}</Text>
          ) : null}
          {notificationPermissionState !== "granted" &&
            notificationRegistrationError ? (
            <Text style={styles.infoText}>{notificationRegistrationError}</Text>
          ) : null}
        </View>

        <View style={[styles.section, { paddingTop: sectionPaddingTop }]}>
          <View
            style={[
              styles.sectionDivider,
              { marginBottom: 16 }
            ]}
          />
          <Text style={styles.sectionTitle}>Recent Meeting</Text>
          {isLoading && !recentMeeting ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>Loading meetings...</Text>
            </View>
          ) : recentMeeting ? (
            <Link href={`/meeting/${recentMeeting.id}`} asChild>
              <Pressable style={styles.meetingCard}>
                <Text style={styles.meetingTitle}>{recentMeeting.title}</Text>
                <Text style={styles.meetingMeta}>
                  {getMeetingStatusLabel(recentMeeting.status)}
                </Text>
                <Text
                  numberOfLines={2}
                  style={styles.meetingPreview}
                >
                  {recentMeeting.preview}
                </Text>
              </Pressable>
            </Link>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>No meetings yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_COLORS.background
  },
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "space-between"
  },
  logo: {
    height: 20,
    width: 60
  },
  logoContainer: {
    alignSelf: "flex-start",
    backgroundColor: APP_COLORS.textPrimary,
    borderColor: APP_COLORS.border,
    borderRadius: 14,
    borderWidth: 5
  },
  hero: {
    alignItems: "center"
  },
  title: {
    color: APP_COLORS.textPrimary,
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.8
  },
  subtitle: {
    color: APP_COLORS.textSecondary,
    fontSize: 18,
    marginTop: 8,
    fontWeight: "500"
  },
  recordButtonShadow: {
    alignItems: "center",
    shadowColor: "#B46A33",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 8
  },
  recordButton: {
    alignItems: "center",
    backgroundColor: "#F03A39",
    borderColor: "#FFB6B5",
    borderWidth: 4,
    borderRadius: 999,
    height: 164,
    justifyContent: "center",
    width: 164
  },
  recordButtonActive: {
    backgroundColor: "#C92A2A"
  },
  recordButtonDisabled: {
    opacity: 0.75
  },
  recordButtonLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8
  },
  helperText: {
    color: APP_COLORS.textSecondary,
    fontWeight: "500",
    textAlign: "center"
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    lineHeight: 20,
    textAlign: "center"
  },
  infoText: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    marginTop: 12,
    textAlign: "center"
  },
  section: {
    marginTop: 16
  },
  sectionDivider: {
    backgroundColor: APP_COLORS.divider,
    height: 1
  },
  sectionTitle: {
    color: APP_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12
  },
  meetingCard: {
    backgroundColor: APP_COLORS.surface,
    borderColor: APP_COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: APP_COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2
  },
  meetingTitle: {
    color: APP_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "700"
  },
  meetingMeta: {
    color: APP_COLORS.accent,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8
  },
  meetingPreview: {
    color: APP_COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8
  },
  emptyCard: {
    backgroundColor: APP_COLORS.surface,
    borderColor: APP_COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: APP_COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2
  },
  emptyCardText: {
    color: APP_COLORS.textMuted,
    fontSize: 16,
    fontWeight: "500"
  }
});
