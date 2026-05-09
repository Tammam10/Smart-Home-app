import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const MOTION_ALERT_CHANNEL_ID = "motion-alerts";

let channelReady = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

const hasNotificationPermission = (settings) =>
  settings.granted ||
  settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

async function ensureMotionChannel() {
  if (Platform.OS !== "android" || channelReady) return;

  await Notifications.setNotificationChannelAsync(MOTION_ALERT_CHANNEL_ID, {
    name: "Motion alerts",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#ef4444",
    enableVibrate: true,
    sound: "default",
  });

  channelReady = true;
}

export async function registerForLocalNotifications() {
  if (Platform.OS === "web") return false;

  await ensureMotionChannel();

  const currentSettings = await Notifications.getPermissionsAsync();
  if (hasNotificationPermission(currentSettings)) return true;

  const requestedSettings = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  return hasNotificationPermission(requestedSettings);
}

export async function notifyMotionDetected({ temperatureLabel } = {}) {
  const canNotify = await registerForLocalNotifications();
  if (!canNotify) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Motion detected",
      body: temperatureLabel
        ? `Movement detected near your home. Current temperature: ${temperatureLabel}.`
        : "Movement detected near your home.",
      data: {
        type: "motion-detected",
        detectedAt: Date.now(),
      },
      sound: "default",
      priority: Notifications.AndroidNotificationPriority.HIGH,
      color: "#ef4444",
    },
    trigger:
      Platform.OS === "android"
        ? { channelId: MOTION_ALERT_CHANNEL_ID }
        : null,
  });

  return true;
}
