import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { AppSettings, WorkoutPlan, Exercise } from "@/lib/workout-store";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function syncWorkoutNotifications(settings: AppSettings, plan?: WorkoutPlan, exercises: Exercise[] = []) {
  if (Platform.OS === "web") return { supported: false, permission: "web" };
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.notificationsEnabled) return { supported: true, permission: "disabled" };
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("fittrack-daily", {
      name: "Lembretes de treino",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180, 100, 180],
      lightColor: "#0284c7",
    });
  }
  const permission = await Notifications.getPermissionsAsync();
  let finalStatus = permission.status;
  if (finalStatus !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    finalStatus = requested.status;
  }
  if (finalStatus !== "granted") return { supported: true, permission: finalStatus };
  const summary = settings.fullSummary && plan?.exerciseIds.length
    ? exercises.filter((exercise) => plan.exerciseIds.includes(exercise.id)).map((exercise) => `• ${exercise.name} — ${exercise.sets}×${exercise.reps}`).join("\n")
    : "Seu treino planejado está esperando por você.";
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Seu treino de hoje está pronto",
      body: summary,
      sound: "default",
      data: { url: "/(tabs)" },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: settings.notificationHour, minute: settings.notificationMinute },
  });
  return { supported: true, permission: finalStatus };
}
