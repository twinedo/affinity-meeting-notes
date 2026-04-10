const {
  AndroidConfig,
  withAndroidManifest,
  withInfoPlist,
  withPlugins
} = require("expo/config-plugins");
const expoAudioPlugin = require("expo-audio/app.plugin");
const withExpoAudio = expoAudioPlugin.default ?? expoAudioPlugin;

const DEFAULT_MICROPHONE_PERMISSION =
  "Allow $(PRODUCT_NAME) to access your microphone.";

const ANDROID_PERMISSIONS = [
  "android.permission.RECORD_AUDIO",
  "android.permission.MODIFY_AUDIO_SETTINGS",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_MICROPHONE",
  "android.permission.POST_NOTIFICATIONS"
];

function ensureAndroidRecordingService(androidManifest) {
  const mainApplication =
    AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);

  const services = mainApplication.service ?? [];
  const existingService = services.find(
    (service) =>
      service.$["android:name"] ===
      "expo.modules.audio.service.AudioRecordingService"
  );

  if (existingService) {
    existingService.$["android:foregroundServiceType"] = "microphone";
    existingService.$["android:exported"] = "false";
    mainApplication.service = services;
    return androidManifest;
  }

  mainApplication.service = [
    ...services,
    {
      $: {
        "android:exported": "false",
        "android:foregroundServiceType": "microphone",
        "android:name": "expo.modules.audio.service.AudioRecordingService"
      }
    }
  ];

  return androidManifest;
}

function withBackgroundAudio(
  config,
  { microphonePermission = DEFAULT_MICROPHONE_PERMISSION } = {}
) {
  config = withPlugins(config, [
    [
      withExpoAudio,
      {
        enableBackgroundRecording: true,
        microphonePermission,
        recordAudioAndroid: true
      }
    ]
  ]);

  config = withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;
    const backgroundModes = Array.isArray(infoPlist.UIBackgroundModes)
      ? infoPlist.UIBackgroundModes
      : [];

    if (!backgroundModes.includes("audio")) {
      backgroundModes.push("audio");
    }

    infoPlist.UIBackgroundModes = backgroundModes;
    infoPlist.NSMicrophoneUsageDescription = microphonePermission;

    return config;
  });

  config = AndroidConfig.Permissions.withPermissions(config, ANDROID_PERMISSIONS);

  return withAndroidManifest(config, (config) => {
    config.modResults = ensureAndroidRecordingService(config.modResults);
    return config;
  });
}

module.exports = withBackgroundAudio;
