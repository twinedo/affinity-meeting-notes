import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

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
  const screenScale = clamp(
    Math.min(width / 390, (height - insets.top - insets.bottom - 64) / 720),
    0.8,
    1
  );
  const horizontalPadding = Math.round(24 * screenScale);
  const topPadding = Math.max(8, Math.round(insets.top + 6 * screenScale));
  const bottomPadding = Math.max(16, Math.round(24 * screenScale));
  const logoWidth = Math.round(60 * screenScale);
  const logoHeight = Math.round(20 * screenScale);
  const logoPaddingHorizontal = Math.max(8, Math.round(10 * screenScale));
  const logoPaddingVertical = Math.max(6, Math.round(8 * screenScale));
  const logoBorderWidth = Math.max(2, Math.round(5 * screenScale));
  const heroMarginTop = Math.round(20 * screenScale);
  const titleFontSize = Math.max(26, Math.round(32 * screenScale));
  const subtitleFontSize = Math.max(14, Math.round(18 * screenScale));
  const recordButtonSize = Math.max(132, Math.round(164 * screenScale));
  const recordIconSize = Math.max(48, Math.round(62 * screenScale));
  const recordButtonLabelSize = Math.max(14, Math.round(16 * screenScale));
  const recordButtonMarginTop = Math.max(28, Math.round(54 * screenScale));
  const helperMarginTop = Math.max(20, Math.round(36 * screenScale));
  const helperFontSize = Math.max(14, Math.round(17 * screenScale));
  const sectionPaddingTop = Math.max(18, Math.round(30 * screenScale));
  const sectionTitleSize = Math.max(15, Math.round(16 * screenScale));
  const sectionDividerMarginBottom = Math.max(12, Math.round(20 * screenScale));
  const meetingTitleSize = Math.max(15, Math.round(16 * screenScale));
  const meetingMetaSize = Math.max(13, Math.round(14 * screenScale));
  const meetingPreviewSize = Math.max(14, Math.round(15 * screenScale));
  const meetingPreviewLineHeight = Math.max(20, Math.round(22 * screenScale));

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

  return (
    <View style={styles.safeArea}>
      <View
        style={[
          styles.logoContainer,
          {
            borderWidth: logoBorderWidth,
            marginLeft: Math.max(8, Math.round(8 * screenScale)),
            marginTop: topPadding,
            paddingHorizontal: logoPaddingHorizontal,
            paddingVertical: logoPaddingVertical
          }
        ]}
      >
        <Image
          source={require("../../assets/logo-text.png")}
          style={[styles.logo, { height: logoHeight, width: logoWidth }]}
          resizeMode="contain"
        />
      </View>
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
            <Text style={[styles.title, { fontSize: titleFontSize }]}>
              In-Person Notes
            </Text>
            <Text style={[styles.subtitle, { fontSize: subtitleFontSize }]}>
              Record meetings, get notes
            </Text>
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
              <Text
                style={[styles.recordButtonLabel, { fontSize: recordButtonLabelSize }]}
              >
                {recordingController.isRecording
                  ? "Stop Recording"
                  : isSaving
                    ? "Uploading..."
                    : "Start Recording"}
              </Text>
            </Pressable>
          </View>

          <Text
            style={[
              styles.helperText,
              { fontSize: helperFontSize, marginTop: helperMarginTop }
            ]}
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
              { marginBottom: sectionDividerMarginBottom }
            ]}
          />
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize }]}>
            Recent Meeting
          </Text>
          {isLoading && !recentMeeting ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>Loading meetings...</Text>
            </View>
          ) : recentMeeting ? (
            <Link href={`/meeting/${recentMeeting.id}`} asChild>
              <Pressable style={styles.meetingCard}>
                <Text style={[styles.meetingTitle, { fontSize: meetingTitleSize }]}>
                  {recentMeeting.title}
                </Text>
                <Text style={[styles.meetingMeta, { fontSize: meetingMetaSize }]}>
                  {getMeetingStatusLabel(recentMeeting.status)}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.meetingPreview,
                    {
                      fontSize: meetingPreviewSize,
                      lineHeight: meetingPreviewLineHeight
                    }
                  ]}
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
