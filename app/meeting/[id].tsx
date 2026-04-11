import { Ionicons } from "@expo/vector-icons";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMeetingsStore } from "../../stores/meetings-store";
import { APP_COLORS } from "../../utils/constant";
import { formatDurationLabel, getMeetingStatusLabel } from "../../utils/fun";

export default function MeetingDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const errorMessage = useMeetingsStore((state) => state.errorMessage);
  const fetchMeetingById = useMeetingsStore((state) => state.fetchMeetingById);
  const isLoading = useMeetingsStore((state) => state.isLoading);
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

  if (!meeting && isLoading) {
    return (
      <View style={styles.safeArea}>
        <Header topInset={insets.top} />
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackTitle}>Loading meeting...</Text>
          <Text style={styles.fallbackBody}>
            Pulling the latest details from Supabase.
          </Text>
        </View>
      </View>
    );
  }

  if (!meeting) {
    return (
      <View style={styles.safeArea}>
        <Header topInset={insets.top} />
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackTitle}>Meeting not found</Text>
          <Text style={styles.fallbackBody}>
            {errorMessage ??
              "The selected meeting could not be loaded from Supabase."}
          </Text>
        </View>
      </View>
    );
  }

  const statusLabel = getMeetingStatusLabel(meeting.status);
  const resolvedDurationMillis = Math.max(
    meeting.durationMillis ?? 0,
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

  return (
    <View style={styles.safeArea}>
      <Header topInset={insets.top} />

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

          <Text style={styles.cardTitle}> Transcript</Text>
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
  backButton: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    width: 28
  },
  headerTitle: {
    color: APP_COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "700"
  },
  headerSpacer: {
    width: 28
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

function Header({ topInset }: { topInset: number }) {
  return (
    <View style={[styles.header, { paddingTop: topInset + 10 }]}>
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
      <Text style={styles.headerTitle}>Meeting Details</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}
