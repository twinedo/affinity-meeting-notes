import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { meetings } from "../data/meetings";

export default function HomeScreen() {
  const recentMeeting = meetings[0];

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>In-Person Notes</Text>
          <Text style={styles.subtitle}>Record meetings, get notes</Text>
        </View>

        <View style={styles.recordButtonShadow}>
          <View style={styles.recordButton}>
            <Ionicons color="#FFFFFF" name="mic" size={62} />
            <Text style={styles.recordButtonLabel}>Start Recording</Text>
          </View>
        </View>

        <Text style={styles.helperText}>
          Tap to record. Running in the background.
        </Text>

        <View style={styles.section}>
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionTitle}>Recent Meeting</Text>
          {recentMeeting ? (
            <View style={styles.meetingCard}>
              <Text style={styles.meetingTitle}>{recentMeeting.title}</Text>
              <Text style={styles.meetingMeta}>{recentMeeting.statusLabel}</Text>
              <Text style={styles.meetingPreview}>{recentMeeting.preview}</Text>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>No meetings yet</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FE"
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F9FE",
    paddingHorizontal: 24,
    paddingTop: 12
  },
  hero: {
    alignItems: "center",
    marginTop: 20
  },
  title: {
    color: "#2F3747",
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -0.8
  },
  subtitle: {
    color: "#7A8395",
    fontSize: 18,
    marginTop: 8,
    fontWeight: "500"
  },
  recordButtonShadow: {
    alignItems: "center",
    marginTop: 54,
    shadowColor: "#D72B2B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8
  },
  recordButton: {
    alignItems: "center",
    backgroundColor: "#F03A39",
    borderColor: "#FFB6B5",
    borderWidth: 4,
    borderRadius: 999,
    height: 194,
    justifyContent: "center",
    width: 194
  },
  recordButtonLabel: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8
  },
  helperText: {
    color: "#667085",
    fontSize: 17,
    fontWeight: "500",
    marginTop: 36,
    textAlign: "center"
  },
  section: {
    marginTop: 30
  },
  sectionDivider: {
    backgroundColor: "#E5EAF2",
    height: 1,
    marginBottom: 20
  },
  sectionTitle: {
    color: "#364152",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12
  },
  meetingCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E6EBF3",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2
  },
  meetingTitle: {
    color: "#364152",
    fontSize: 16,
    fontWeight: "700"
  },
  meetingMeta: {
    color: "#2F80ED",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8
  },
  meetingPreview: {
    color: "#667085",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E6EBF3",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2
  },
  emptyCardText: {
    color: "#97A0AF",
    fontSize: 16,
    fontWeight: "500"
  }
});
