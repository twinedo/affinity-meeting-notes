import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState
} from "expo-audio";
import { useEffect, useState } from "react";

import { formatRecordingTimer } from "../utils/constant";

export type RecordingResult = {
  audioFileUri: string;
  durationMillis: number;
};

type PermissionState = "unknown" | "granted" | "denied";

export function useRecordingController() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);

  const [permissionState, setPermissionState] = useState<PermissionState>("unknown");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AudioModule.getRecordingPermissionsAsync()
      .then((response) => {
        if (isMounted) {
          setPermissionState(response.granted ? "granted" : "unknown");
        }
      })
      .catch(() => {
        if (isMounted) {
          setPermissionState("unknown");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function ensurePermission() {
    const response = await AudioModule.requestRecordingPermissionsAsync();

    if (!response.granted) {
      setPermissionState("denied");
      setErrorMessage("Microphone permission is required to record a meeting.");
      return false;
    }

    setPermissionState("granted");
    return true;
  }

  async function startRecording() {
    if (isBusy || recorderState.isRecording) {
      return false;
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      const hasPermission = await ensurePermission();

      if (!hasPermission) {
        return false;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true
      });

      await recorder.prepareToRecordAsync();
      recorder.record();

      return true;
    } catch {
      setErrorMessage("Unable to start recording. Please try again.");
      return false;
    } finally {
      setIsBusy(false);
    }
  }

  async function stopRecording(): Promise<RecordingResult | null> {
    if (isBusy || !recorderState.isRecording) {
      return null;
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      await recorder.stop();
      await setAudioModeAsync({
        allowsRecording: false
      });

      const nextState = recorder.getStatus();
      const audioFileUri = nextState.url ?? recorder.uri;

      if (!audioFileUri) {
        setErrorMessage("Recording finished, but no audio file was returned.");
        return null;
      }

      return {
        audioFileUri,
        durationMillis: nextState.durationMillis
      };
    } catch {
      setErrorMessage("Unable to stop recording. Please try again.");
      return null;
    } finally {
      setIsBusy(false);
    }
  }

  return {
    errorMessage,
    hasPermission: permissionState === "granted",
    isBusy,
    isRecording: recorderState.isRecording,
    permissionState,
    startRecording,
    stopRecording,
    timerLabel: formatRecordingTimer(recorderState.durationMillis)
  };
}
