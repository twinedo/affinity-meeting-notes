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
