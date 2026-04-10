import { ConfigContext, ExpoConfig } from "expo/config";

import withBackgroundAudio from "./plugins/withBackgroundAudio.js";

export default ({config} : ConfigContext) : ExpoConfig=> ({
  ...config,
  android: {
    edgeToEdgeEnabled: true
  },
  experiments: {
    typedRoutes: true
  },
  ios: {
    bundleIdentifier: "com.anonymous.affinity-meeting-notes",
    supportsTablet: true
  },
  name: "Affinity Meeting Notes",
  newArchEnabled: true,
  orientation: "portrait",
  plugins: [
    "expo-router",
    [
      withBackgroundAudio,
      {
        microphonePermission:
          "Allow $(PRODUCT_NAME) to access your microphone."
      }
    ] as never
  ],
  scheme: "affinitymeetingnotes",
  slug: "affinity-meeting-notes",
  userInterfaceStyle: "automatic",
  version: "1.0.0",
  web: {
    bundler: "metro"
  }
});
