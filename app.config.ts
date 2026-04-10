import { existsSync } from "node:fs";

import { ConfigContext, ExpoConfig } from "expo/config";

import withBackgroundAudio from "./plugins/withBackgroundAudio.js";

const googleServicesFilePath = "./google-services.json";
const hasGoogleServicesFile = existsSync(googleServicesFilePath);

export default ({config} : ConfigContext) : ExpoConfig=> ({
  ...config,
  android: {
    edgeToEdgeEnabled: true,
    package: "com.anonymous.affinitymeetingnotes",
    ...(hasGoogleServicesFile
      ? {
          googleServicesFile: googleServicesFilePath
        }
      : {})
  },
  extra: {
    ...(config.extra ?? {}),
    eas: {
      // ...((config.extra?.eas as Record<string, unknown> | undefined) ?? {}),
      projectId: "5498dad9-8f0d-4714-9cb4-478eed9474e1"
    }
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
    "expo-notifications",
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
