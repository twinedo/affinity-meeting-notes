export const MEETINGS_TABLE = "meetings";
export const SUPABASE_STORAGE_BUCKET = "meeting-audio";
export const BACKEND_MISSING_ENV_MESSAGE =
  "Set EXPO_PUBLIC_BACKEND_URL to enable backend meeting processing.";
export const PUSH_PROJECT_ID_MISSING_MESSAGE =
  "Set EXPO_PUBLIC_EAS_PROJECT_ID or build with EAS project metadata to register for Expo push notifications.";
export const PUSH_DEVICE_REQUIRED_MESSAGE =
  "Expo push notifications require a physical device. Simulators and emulators cannot receive remote push notifications.";

export const DEFAULT_EMPTY_SUMMARY =
  "Summary will appear here after meeting processing is connected.";

export const DEFAULT_EMPTY_TRANSCRIPT =
  "Transcript will appear here after meeting processing is connected.";

export const SUPABASE_MISSING_ENV_MESSAGE =
  "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to enable meeting sync.";

export const APP_COLORS = {
  background: "#F7F1E4",
  backgroundElevated: "#FBF6EC",
  surface: "#FFFDF8",
  border: "#E6D8BE",
  divider: "#E9DECC",
  textPrimary: "#3E3427",
  textSecondary: "#736551",
  textMuted: "#95866F",
  accent: "#A97A2E",
  accentSoft: "#F1DEB6",
  accentText: "#7A571E",
  tabInactive: "#8A7A62",
  shadow: "#8E7750"
} as const;
