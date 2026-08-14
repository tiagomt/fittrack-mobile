import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarButton: HapticTab, tabBarStyle: { paddingTop: 8, paddingBottom: bottomPadding, height: 58 + bottomPadding, backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 0.5 } }}>
    <Tabs.Screen name="index" options={{ title: "Hoje", tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={23} color={color} /> }} />
    <Tabs.Screen name="week" options={{ title: "Semana", tabBarIcon: ({ color }) => <IconSymbol name="calendar" size={23} color={color} /> }} />
    <Tabs.Screen name="exercises" options={{ title: "Exercícios", tabBarIcon: ({ color }) => <IconSymbol name="figure.strengthtraining.traditional" size={23} color={color} /> }} />
    <Tabs.Screen name="history" options={{ title: "Histórico", tabBarIcon: ({ color }) => <IconSymbol name="chart.bar.fill" size={23} color={color} /> }} />
    <Tabs.Screen name="settings" options={{ title: "Ajustes", tabBarIcon: ({ color }) => <IconSymbol name="gearshape.fill" size={23} color={color} /> }} />
  </Tabs>;
}
