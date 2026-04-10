import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMeetingsStore } from "../../stores/meetings-store";
import { getMeetingStatusLabel } from "../../utils/constant";

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetings = useMeetingsStore((state) => state.meetings);
  const meeting = meetings.find((entry) => entry.id === id);

  if (!meeting) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
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
            <Ionicons color="#4A5565" name="chevron-back" size={26} />
          </Pressable>
          <Text style={styles.headerTitle}>Meeting Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackTitle}>Meeting not found</Text>
          <Text style={styles.fallbackBody}>
            The selected mock meeting does not exist in local data.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusLabel = getMeetingStatusLabel(meeting.status);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
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
          <Ionicons color="#4A5565" name="chevron-back" size={26} />
        </Pressable>
        <Text style={styles.headerTitle}>Meeting Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metaBlock}>
          <Text style={styles.metaTitle}>{meeting.scheduledAtLabel}</Text>
          <View style={styles.metaDivider} />
          <Text style={styles.metaText}>Status: {statusLabel}</Text>
          {meeting.durationLabel ? (
            <Text style={styles.metaText}>Duration: {meeting.durationLabel}</Text>
          ) : null}
        </View>

        <Pressable style={styles.playButton}>
          <Ionicons color="#FFFFFF" name="play" size={24} />
          <Text style={styles.playButtonText}>Play Audio</Text>
        </Pressable>

        <View style={styles.card}>
          {meeting.audioFileUri ? (
            <Text style={styles.localFileText}>Local audio saved on device</Text>
          ) : null}

          <Text style={styles.cardTitle}>Summary</Text>
          <View style={styles.cardDivider} />
          <Text style={styles.cardBody}>{meeting.summary}</Text>

          <Text style={[styles.cardTitle, styles.sectionHeading]}>Transcript</Text>
          <View style={styles.cardDivider} />
          <Text style={styles.cardBody}>{meeting.transcript}</Text>
        </View>
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
    color: "#2F3747",
    fontSize: 26,
    fontWeight: "700"
  },
  headerSpacer: {
    width: 28
  },
  content: {
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
    color: "#364152",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center"
  },
  fallbackBody: {
    color: "#667085",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    textAlign: "center"
  },
  metaBlock: {
    alignItems: "center"
  },
  metaTitle: {
    color: "#364152",
    fontSize: 20,
    fontWeight: "700"
  },
  metaDivider: {
    backgroundColor: "#E6EBF3",
    height: 1,
    marginVertical: 12,
    width: "100%"
  },
  metaText: {
    color: "#4C5667",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 28
  },
  playButton: {
    alignItems: "center",
    backgroundColor: "#2F80ED",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 16
  },
  playButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10
  },
  localFileText: {
    color: "#2F80ED",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E6EBF3",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 18,
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
  sectionHeading: {
    marginTop: 20
  },
  cardDivider: {
    backgroundColor: "#E6EBF3",
    height: 1,
    marginVertical: 12
  },
  cardBody: {
    color: "#4C5667",
    fontSize: 16,
    lineHeight: 30
  }
});
