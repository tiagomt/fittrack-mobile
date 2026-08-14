import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/lib/theme-provider";
import { WorkoutProvider } from "@/lib/workout-store";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <WorkoutProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </WorkoutProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
