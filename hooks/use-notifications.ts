import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

import { useNotificationsStore } from "../stores/notifications-store";
import {
  PUSH_DEVICE_REQUIRED_MESSAGE,
  PUSH_PROJECT_ID_MISSING_MESSAGE
} from "../utils/constant";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export function useNotifications() {
  const lastHandledNotificationIdRef = useRef<string | null>(null);
  const setExpoPushToken = useNotificationsStore((state) => state.setExpoPushToken);
  const setPermissionState = useNotificationsStore(
    (state) => state.setPermissionState
  );
  const setRegistrationError = useNotificationsStore(
    (state) => state.setRegistrationError
  );

  useEffect(() => {
    void registerForPushNotificationsAsync({
      setExpoPushToken,
      setPermissionState,
      setRegistrationError
    });

    const pushTokenSubscription = Notifications.addPushTokenListener((token) => {
      setExpoPushToken(token.data);
      setRegistrationError(null);
    });

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        redirectToMeeting(response.notification);
      });

    const initialResponse = Notifications.getLastNotificationResponse();
    if (initialResponse?.notification) {
      redirectToMeeting(initialResponse.notification);
    }

    return () => {
      pushTokenSubscription.remove();
      responseSubscription.remove();
    };
  }, [setExpoPushToken, setPermissionState, setRegistrationError]);

  function redirectToMeeting(notification: Notifications.Notification) {
    if (
      lastHandledNotificationIdRef.current === notification.request.identifier
    ) {
      return;
    }

    lastHandledNotificationIdRef.current = notification.request.identifier;
    const data = notification.request.content.data;
    const url =
      typeof data?.url === "string"
        ? data.url
        : typeof data?.meetingId === "string"
          ? `/meeting/${data.meetingId}`
          : null;

    if (url) {
      router.push(url as never);
      void Notifications.clearLastNotificationResponseAsync();
    }
  }
}

async function registerForPushNotificationsAsync(input: {
  setExpoPushToken: (token: string | null) => void;
  setPermissionState: (state: "unknown" | "granted" | "denied" | "unsupported") => void;
  setRegistrationError: (message: string | null) => void;
}) {
  if (Platform.OS === "web") {
    input.setPermissionState("unsupported");
    input.setRegistrationError(
      "Expo push notifications are only configured for iOS and Android in this project."
    );
    input.setExpoPushToken(null);
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      importance: Notifications.AndroidImportance.MAX,
      lightColor: "#2F80ED",
      name: "default",
      vibrationPattern: [0, 250, 250, 250]
    });
  }

  if (!Device.isDevice) {
    input.setPermissionState("unsupported");
    input.setRegistrationError(PUSH_DEVICE_REQUIRED_MESSAGE);
    input.setExpoPushToken(null);
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const permissionResponse = await Notifications.requestPermissionsAsync();
    finalStatus = permissionResponse.status;
  }

  if (finalStatus !== "granted") {
    input.setPermissionState("denied");
    input.setRegistrationError(
      "Notification permission was not granted. Meeting processing will continue without push alerts."
    );
    input.setExpoPushToken(null);
    return;
  }

  input.setPermissionState("granted");

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

    if (!projectId || typeof projectId !== "string") {
      throw new Error(PUSH_PROJECT_ID_MISSING_MESSAGE);
    }

    const expoPushToken = (
      await Notifications.getExpoPushTokenAsync({
        projectId
      })
    ).data;
    input.setExpoPushToken(expoPushToken);
    input.setRegistrationError(null);
  } catch (error) {
    input.setExpoPushToken(null);
    input.setRegistrationError(
      error instanceof Error ? error.message : "Unable to register for push notifications."
    );
  }
}
