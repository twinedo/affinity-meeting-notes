import { Ionicons } from "@expo/vector-icons";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import * as ExpoLinking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMeetingsStore } from "../../stores/meetings-store";
import { APP_COLORS } from "../../utils/constant";
import { formatDurationLabel, getMeetingStatusLabel } from "../../utils/fun";

export default function MeetingDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [isOptionsMenuVisible, setIsOptionsMenuVisible] = useState(false);
  const [isShareMenuVisible, setIsShareMenuVisible] = useState(false);
  const deleteMeeting = useMeetingsStore((state) => state.deleteMeeting);
  const errorMessage = useMeetingsStore((state) => state.errorMessage);
  const fetchMeetingById = useMeetingsStore((state) => state.fetchMeetingById);
  const isLoading = useMeetingsStore((state) => state.isLoading);
  const isSaving = useMeetingsStore((state) => state.isSaving);
  const meeting = useMeetingsStore((state) =>
    state.meetings.find((entry) => entry.id === id)
  );
  const audioSource = meeting?.audioUrl ?? meeting?.localAudioFileUri ?? null;
  const player = useAudioPlayer(audioSource, { updateInterval: 250 });
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    if (!id) {
      return;
    }

    void fetchMeetingById(id);
  }, [fetchMeetingById, id]);

  if (!meeting) {
    const fallbackTitle = isLoading ? "Loading meeting..." : "Meeting not found";
    const fallbackBody = isLoading
      ? "Pulling the latest details from Supabase."
      : errorMessage ?? "The selected meeting could not be loaded from Supabase.";

    return (
      <View style={styles.safeArea}>
        <Header topInset={insets.top} />
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackTitle}>{fallbackTitle}</Text>
          <Text style={styles.fallbackBody}>{fallbackBody}</Text>
        </View>
      </View>
    );
  }

  const selectedMeeting = meeting;
  const statusLabel = getMeetingStatusLabel(selectedMeeting.status);
  const resolvedDurationMillis = Math.max(
    selectedMeeting.durationMillis ?? 0,
    Math.round(playerStatus.duration * 1000)
  );
  const resolvedDurationLabel =
    resolvedDurationMillis > 0
      ? formatDurationLabel(resolvedDurationMillis)
      : null;
  const canPlayAudio = Boolean(audioSource) && playerStatus.isLoaded;

  async function handlePlayPress() {
    if (!audioSource) {
      return;
    }

    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: true
    });

    if (
      playerStatus.duration > 0 &&
      playerStatus.currentTime >= playerStatus.duration
    ) {
      player.seekTo(0);
    }

    if (playerStatus.playing) {
      player.pause();
      return;
    }

    player.play();
  }

  async function handleDownloadAudioPress() {
    if (!audioSource || isDownloadingAudio) {
      return;
    }

    setIsOptionsMenuVisible(false);

    const tempFileUri = FileSystem.cacheDirectory
      ? `${FileSystem.cacheDirectory}meeting-audio-${selectedMeeting.id}.${getAudioFileExtension(
          selectedMeeting.audioPath ?? audioSource
        )}`
      : null;

    if (!tempFileUri) {
      setDownloadMessage("Unable to prepare a local audio download.");
      return;
    }

    setDownloadMessage(null);
    setIsDownloadingAudio(true);

    try {
      const downloadResult = await FileSystem.downloadAsync(audioSource, tempFileUri);
      const mimeType = getAudioMimeType(selectedMeeting.audioPath ?? audioSource);

      if (Platform.OS === "android") {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!permissions.granted || !permissions.directoryUri) {
          setDownloadMessage("Download cancelled.");
          return;
        }

        const fileContents = await FileSystem.readAsStringAsync(downloadResult.uri, {
          encoding: FileSystem.EncodingType.Base64
        });
        const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          `meeting-${selectedMeeting.id}`,
          mimeType
        );

        await FileSystem.StorageAccessFramework.writeAsStringAsync(
          destinationUri,
          fileContents,
          { encoding: FileSystem.EncodingType.Base64 }
        );
        setDownloadMessage("Audio saved to your selected folder.");
      } else {
        const savedUri = FileSystem.documentDirectory
          ? `${FileSystem.documentDirectory}meeting-${selectedMeeting.id}.${getAudioFileExtension(
              selectedMeeting.audioPath ?? audioSource
            )}`
          : downloadResult.uri;

        if (savedUri !== downloadResult.uri) {
          await FileSystem.copyAsync({
            from: downloadResult.uri,
            to: savedUri
          });
        }

        setDownloadMessage("Audio downloaded to local app files.");
      }
    } catch (error) {
      setDownloadMessage(getDownloadErrorMessage(error));
    } finally {
      setIsDownloadingAudio(false);
      await FileSystem.deleteAsync(tempFileUri, { idempotent: true }).catch(() => {
        // Temporary cleanup failure should not block the download flow.
      });
    }
  }

  async function shareMeetingLink() {
    const meetingLink = ExpoLinking.createURL(`/meeting/${selectedMeeting.id}`);

    setIsShareMenuVisible(false);
    await Share.share({
      message: `Open this meeting in Affinity Meeting Notes:\n${meetingLink}`,
      title: selectedMeeting.title
    });
  }

  async function shareTranscript() {
    setIsShareMenuVisible(false);
    await Share.share({
      message: `Affinity Meeting Notes:\n${selectedMeeting.title}\n\nTranscript\n${selectedMeeting.transcript}`,
      title: `${selectedMeeting.title} Transcript`
    });
  }

  async function shareSummary() {
    setIsShareMenuVisible(false);
    await Share.share({
      message: `Affinity Meeting Notes:\n${selectedMeeting.title}\n\nSummary\n${selectedMeeting.summary}`,
      title: `${selectedMeeting.title} Summary`
    });
  }

  function handleDeletePress() {
    if (isSaving) {
      return;
    }

    setIsOptionsMenuVisible(false);

    Alert.alert(
      "Delete meeting?",
      "This will permanently remove the meeting, transcript, summary, and audio file.",
      [
        {
          style: "cancel",
          text: "Cancel"
        },
        {
          style: "destructive",
          text: "Delete",
          onPress: () => {
            void confirmDeleteMeeting();
          }
        }
      ]
    );
  }

  async function confirmDeleteMeeting() {
    const didDelete = await deleteMeeting(selectedMeeting.id);

    if (!didDelete) {
      return;
    }

    router.replace("/(tabs)/meetings");
  }

  return (
    <View style={styles.safeArea}>
      <Header
        onOptionsPress={() => {
          setIsOptionsMenuVisible(true);
        }}
        onSharePress={() => {
          setIsShareMenuVisible(true);
        }}
        topInset={insets.top}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => {
          setIsShareMenuVisible(false);
        }}
        transparent
        visible={isShareMenuVisible}
      >
        <Pressable
          onPress={() => {
            setIsShareMenuVisible(false);
          }}
          style={styles.shareMenuBackdrop}
        >
          <Pressable style={[styles.shareMenu, { top: insets.top + 58 }]}>
            <Text style={styles.shareMenuTitle}>Share meeting</Text>
            <Pressable onPress={() => void shareMeetingLink()} style={styles.shareMenuItem}>
              <Ionicons
                color={APP_COLORS.textSecondary}
                name="link-outline"
                size={18}
              />
              <Text style={styles.shareMenuItemText}>Share deep link</Text>
            </Pressable>
            <Pressable onPress={() => void shareTranscript()} style={styles.shareMenuItem}>
              <Ionicons
                color={APP_COLORS.textSecondary}
                name="document-text-outline"
                size={18}
              />
              <Text style={styles.shareMenuItemText}>Share transcript</Text>
            </Pressable>
            <Pressable onPress={() => void shareSummary()} style={styles.shareMenuItem}>
              <Ionicons
                color={APP_COLORS.textSecondary}
                name="sparkles-outline"
                size={18}
              />
              <Text style={styles.shareMenuItemText}>Share summary</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => {
          setIsOptionsMenuVisible(false);
        }}
        transparent
        visible={isOptionsMenuVisible}
      >
        <Pressable
          onPress={() => {
            setIsOptionsMenuVisible(false);
          }}
          style={styles.shareMenuBackdrop}
        >
          <Pressable style={[styles.shareMenu, { top: insets.top + 58 }]}>
            <Text style={styles.shareMenuTitle}>Options</Text>
            <Pressable
              disabled={!canPlayAudio || isDownloadingAudio}
              onPress={() => {
                void handleDownloadAudioPress();
              }}
              style={[
                styles.shareMenuItem,
                (!canPlayAudio || isDownloadingAudio) && styles.playButtonDisabled
              ]}
            >
              <Ionicons
                color={APP_COLORS.textSecondary}
                name="download-outline"
                size={18}
              />
              <Text style={styles.shareMenuItemText}>
                {isDownloadingAudio ? "Downloading..." : "Download audio"}
              </Text>
            </Pressable>
            <Pressable onPress={handleDeletePress} style={styles.shareMenuItem}>
              <Ionicons color="#B42318" name="trash-outline" size={18} />
              <Text
                style={[styles.shareMenuItemText, styles.shareMenuItemTextDanger]}
              >
                Delete meeting
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metaBlock}>
          <Text style={styles.metaTitle}>{meeting.scheduledAtLabel}</Text>
          <View style={styles.metaDivider} />
          <Text style={styles.metaText}>Status: {statusLabel}</Text>
          {resolvedDurationLabel ? (
            <Text style={styles.metaText}>Duration: {resolvedDurationLabel}</Text>
          ) : null}
        </View>

        <Pressable
          disabled={!canPlayAudio}
          onPress={() => {
            void handlePlayPress();
          }}
          style={[styles.playButton, !canPlayAudio && styles.playButtonDisabled]}
        >
          <Ionicons
            color="#FFFFFF"
            name={playerStatus.playing ? "pause" : "play"}
            size={24}
          />
          <Text style={styles.playButtonText}>
            {playerStatus.playing ? "Pause Audio" : "Play Audio"}
          </Text>
        </Pressable>
        {!canPlayAudio ? (
          <Text style={styles.audioHintText}>
            Audio is still loading or unavailable for this meeting.
          </Text>
        ) : null}
        {downloadMessage ? (
          <Text style={styles.downloadMessageText}>{downloadMessage}</Text>
        ) : null}

        <View style={styles.card}>
          {meeting.audioPath ? (
            <Text style={styles.localFileText}>Recording saved for this meeting</Text>
          ) : null}
          {meeting.status === "failed" ? (
            <Text style={styles.failureText}>
              Processing did not complete for this meeting. You can review the
              uploaded audio and try another recording run.
            </Text>
          ) : null}

          <Text style={styles.cardTitle}>Transcript</Text>
          <View style={styles.cardDivider} />
          <Text style={styles.cardBody}>{meeting.transcript}</Text>

          <Text style={[styles.cardTitle, styles.sectionHeading]}>Summary</Text>
          <View style={styles.cardDivider} />
          <Text style={styles.cardBody}>{meeting.summary}</Text>
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
  header: {
    alignItems: "center",
    backgroundColor: APP_COLORS.backgroundElevated,
    borderBottomColor: APP_COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 14,
    paddingHorizontal: 12,
    paddingTop: 10
  },
  headerLeft: {
    alignItems: "flex-start",
    width: 72
  },
  backButton: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    width: 28
  },
  headerTitle: {
    color: APP_COLORS.textPrimary,
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center"
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 72,
    columnGap: 8
  },
  headerActionButton: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    width: 28
  },
  headerActionButtonTrailing: {
    marginLeft: 8
  },
  content: {
    backgroundColor: APP_COLORS.background,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24
  },
  fallbackTitle: {
    color: APP_COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center"
  },
  fallbackBody: {
    color: APP_COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    textAlign: "center"
  },
  shareMenuBackdrop: {
    flex: 1
  },
  shareMenu: {
    backgroundColor: APP_COLORS.surface,
    borderColor: APP_COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: "absolute",
    right: 12,
    shadowColor: APP_COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    width: 220
  },
  shareMenuTitle: {
    color: APP_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8
  },
  shareMenuItem: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 10
  },
  shareMenuItemText: {
    color: APP_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 10
  },
  shareMenuItemTextDanger: {
    color: "#B42318"
  },
  metaBlock: {
    alignItems: "center"
  },
  metaTitle: {
    color: APP_COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "700"
  },
  metaDivider: {
    backgroundColor: APP_COLORS.divider,
    height: 1,
    marginVertical: 12,
    width: "100%"
  },
  metaText: {
    color: APP_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 28
  },
  playButton: {
    alignItems: "center",
    backgroundColor: APP_COLORS.accent,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 16
  },
  playButtonDisabled: {
    opacity: 0.65
  },
  audioHintText: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "center"
  },
  playButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10
  },
  downloadMessageText: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "center"
  },
  localFileText: {
    color: APP_COLORS.accent,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10
  },
  failureText: {
    color: "#B42318",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 10
  },
  card: {
    backgroundColor: APP_COLORS.surface,
    borderColor: APP_COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 18,
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
  sectionHeading: {
    marginTop: 20
  },
  cardDivider: {
    backgroundColor: APP_COLORS.divider,
    height: 1,
    marginVertical: 12
  },
  cardBody: {
    color: APP_COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 30
  }
});

function Header({
  onOptionsPress,
  onSharePress,
  topInset
}: {
  onOptionsPress?: () => void;
  onSharePress?: () => void;
  topInset: number;
}) {
  return (
    <View style={[styles.header, { paddingTop: topInset + 10 }]}>
      <View style={styles.headerLeft}>
        <Pressable
          hitSlop={10}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }

            router.replace("/(tabs)/meetings");
          }}
          style={styles.backButton}
        >
          <Ionicons color={APP_COLORS.textSecondary} name="chevron-back" size={26} />
        </Pressable>
      </View>
      <Text style={styles.headerTitle}>Meeting Details</Text>
      <View style={styles.headerActions}>
        {onSharePress ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={onSharePress}
            style={[styles.headerActionButton]}
          >
            <Ionicons
              color={APP_COLORS.textSecondary}
              name="share-social-outline"
              size={22}
            />
          </Pressable>
        ) : null}
        {onOptionsPress ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={onOptionsPress}
            style={styles.headerActionButton}
          >
            <Ionicons color={APP_COLORS.textSecondary} name="settings-outline" size={21} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function getAudioFileExtension(audioReference: string): string {
  const match = audioReference.match(/\.([a-z0-9]+)(?:\?|$)/i);

  if (!match) {
    return "m4a";
  }

  return match[1].toLowerCase();
}

function getAudioMimeType(audioReference: string): string {
  const extension = getAudioFileExtension(audioReference);

  if (extension === "wav") {
    return "audio/wav";
  }

  if (extension === "caf") {
    return "audio/x-caf";
  }

  if (extension === "aac") {
    return "audio/aac";
  }

  if (extension === "mp3") {
    return "audio/mpeg";
  }

  return "audio/mp4";
}

function getDownloadErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to download the audio right now.";
}
