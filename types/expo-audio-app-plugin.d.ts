declare module "expo-audio/app.plugin" {
  import { ConfigPlugin } from "expo/config-plugins";

  const withExpoAudio: ConfigPlugin<{
    enableBackgroundRecording?: boolean;
    microphonePermission?: string;
    recordAudioAndroid?: boolean;
  }>;

  export default withExpoAudio;
}
