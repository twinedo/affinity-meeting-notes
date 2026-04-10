import { create } from "zustand";

type NotificationPermissionState =
  | "unknown"
  | "granted"
  | "denied"
  | "unsupported";

type NotificationsStore = {
  expoPushToken: string | null;
  permissionState: NotificationPermissionState;
  registrationError: string | null;
  setExpoPushToken: (token: string | null) => void;
  setPermissionState: (state: NotificationPermissionState) => void;
  setRegistrationError: (message: string | null) => void;
};

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  expoPushToken: null,
  permissionState: "unknown",
  registrationError: null,
  setExpoPushToken: (expoPushToken) => set({ expoPushToken }),
  setPermissionState: (permissionState) => set({ permissionState }),
  setRegistrationError: (registrationError) => set({ registrationError })
}));
