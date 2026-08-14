import React, { useEffect, useState } from "react";
import { Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PrimaryButton, SectionHeader, Surface, typography } from "@/components/fittrack-ui";
import { syncWorkoutNotifications } from "@/lib/notifications";
import { selectPlan, toDateKey, useWorkoutStore } from "@/lib/workout-store";
import { useColors } from "@/hooks/use-colors";

const timeOptions = Array.from({ length: 24 }, (_, hour) => [0, 15, 30, 45].map((minute) => ({ hour, minute })) ).flat();
const timeLabel = (hour: number, minute: number) => `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

export default function SettingsScreen() {
  const colors = useColors();
  const { state, hydrated, updateSettings } = useWorkoutStore();
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const todayPlan = selectPlan(state, toDateKey(new Date()));

  const applyChange = async (change: Parameters<typeof updateSettings>[0]) => {
    const next = { ...state.settings, ...change };
    updateSettings(change);
    if (change.notificationsEnabled !== undefined || change.notificationHour !== undefined || change.notificationMinute !== undefined || change.fullSummary !== undefined) {
      setSyncing(true);
      try {
        const result = await syncWorkoutNotifications(next, todayPlan, state.exercises);
        if (Platform.OS !== "web" && result.permission && result.permission !== "granted" && result.permission !== "disabled") Alert.alert("Permissão necessária", "Ative as notificações do FitTrack nos ajustes do dispositivo para receber seus lembretes.");
      } catch { Alert.alert("Não foi possível agendar", "Verifique as permissões de notificação e tente novamente."); } finally { setSyncing(false); }
    }
  };

  useEffect(() => { if (state.settings.notificationsEnabled && hydrated) { syncWorkoutNotifications(state.settings, todayPlan, state.exercises).catch(() => undefined); } }, [hydrated, state.settings, state.exercises, todayPlan]);

  return <ScreenContainer className="px-5" safeAreaClassName="bg-background">
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View><Text style={[styles.eyebrow, { color: colors.primary }]}>PREFERÊNCIAS</Text><Text style={[typography.title, { color: colors.foreground }]}>Ajustes.</Text><Text style={[styles.intro, { color: colors.muted }]}>Deixe o FitTrack trabalhar do seu jeito.</Text></View>
      <SectionHeader title="Notificações" />
      <Surface style={styles.settingsCard}>
        <SettingRow icon="bell.fill" title="Lembrete diário" description="Receba um aviso no início do dia do treino" value={state.settings.notificationsEnabled} onValueChange={(value) => applyChange({ notificationsEnabled: value })} colors={colors} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Pressable onPress={() => setTimeModalVisible(true)} style={({ pressed }) => [styles.timeRow, { opacity: pressed ? 0.65 : 1 }]}><View style={[styles.settingIcon, { backgroundColor: `${colors.primary}16` }]}><IconSymbol name="clock" size={20} color={colors.primary} /></View><View style={styles.settingCopy}><Text style={[styles.settingTitle, { color: colors.foreground }]}>Horário do lembrete</Text><Text style={[styles.settingDescription, { color: colors.muted }]}>Todos os dias, no horário escolhido</Text></View><Text style={[styles.timeValue, { color: colors.primary }]}>{timeLabel(state.settings.notificationHour, state.settings.notificationMinute)}</Text></Pressable>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow icon="doc.on.doc" title="Resumo completo" description="Inclui os exercícios e séries no aviso" value={state.settings.fullSummary} onValueChange={(value) => applyChange({ fullSummary: value })} colors={colors} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow icon="bell" title="Lembrete no fim do dia" description="Avisar quando o treino ainda estiver pendente" value={state.settings.eveningReminder} onValueChange={(value) => applyChange({ eveningReminder: value })} colors={colors} />
      </Surface>
      <Text style={[styles.helper, { color: colors.muted }]}>{syncing ? "Atualizando lembrete…" : Platform.OS === "web" ? "Notificações locais ficam disponíveis no iOS e Android." : "O lembrete é salvo como uma notificação local no dispositivo."}</Text>
      <SectionHeader title="Durante o treino" />
      <Surface style={styles.settingsCard}><SettingRow icon="timer" title="Cronômetro de descanso" description="Sugerir o descanso entre séries" value={state.settings.restTimerEnabled} onValueChange={(value) => updateSettings({ restTimerEnabled: value })} colors={colors} /></Surface>
      <SectionHeader title="Sobre o FitTrack" />
      <Surface style={styles.aboutCard}><View style={[styles.aboutMark, { backgroundColor: colors.primary }]}><Image source={require("@/assets/images/icon.png")} style={styles.aboutMarkImage} /></View><View style={styles.aboutCopy}><Text style={[styles.aboutTitle, { color: colors.foreground }]}>FitTrack</Text><Text style={[styles.aboutText, { color: colors.muted }]}>Planejamento simples. Consistência visível. Versão MVP 1.0.</Text></View></Surface>
      <Text style={[styles.storageNote, { color: colors.muted }]}>Os dados ficam persistidos localmente neste dispositivo e a estrutura está preparada para sincronização em nuvem no futuro.</Text>
    </ScrollView>
    <Modal visible={timeModalVisible} transparent animationType="slide" onRequestClose={() => setTimeModalVisible(false)}><View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: colors.background }]}><View style={styles.modalHeader}><View><Text style={[styles.modalTitle, { color: colors.foreground }]}>Horário do lembrete</Text><Text style={[styles.modalSubtitle, { color: colors.muted }]}>Escolha quando começar o dia de treino</Text></View><Pressable onPress={() => setTimeModalVisible(false)}><IconSymbol name="xmark" size={22} color={colors.muted} /></Pressable></View><View style={styles.timeGrid}>{timeOptions.map((option) => { const selected = option.hour === state.settings.notificationHour && option.minute === state.settings.notificationMinute; return <Pressable key={`${option.hour}-${option.minute}`} onPress={() => { applyChange({ notificationHour: option.hour, notificationMinute: option.minute }); setTimeModalVisible(false); }} style={({ pressed }) => [styles.timeOption, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border, opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.timeOptionText, { color: selected ? "#ffffff" : colors.foreground }]}>{timeLabel(option.hour, option.minute)}</Text></Pressable>; })}</View><PrimaryButton variant="secondary" onPress={() => setTimeModalVisible(false)}>Fechar</PrimaryButton></View></View></Modal>
  </ScreenContainer>;
}

function SettingRow({ icon, title, description, value, onValueChange, colors }: { icon: string; title: string; description: string; value: boolean; onValueChange: (value: boolean) => void; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.settingRow}><View style={[styles.settingIcon, { backgroundColor: `${colors.primary}16` }]}><IconSymbol name={icon as any} size={20} color={colors.primary} /></View><View style={styles.settingCopy}><Text style={[styles.settingTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.settingDescription, { color: colors.muted }]}>{description}</Text></View><Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.border, true: `${colors.primary}70` }} thumbColor={value ? colors.primary : colors.muted} /></View>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 45, gap: 16 },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  intro: { fontSize: 14, lineHeight: 20, marginTop: 7 },
  settingsCard: { padding: 15, gap: 13, borderRadius: 20 },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  settingIcon: { width: 39, height: 39, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  settingCopy: { flex: 1 },
  settingTitle: { fontSize: 14, fontWeight: "900" },
  settingDescription: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  timeValue: { fontSize: 17, fontWeight: "900" },
  divider: { height: 1, opacity: 0.75 },
  helper: { fontSize: 11, lineHeight: 16, marginTop: -7 },
  aboutCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 20, backgroundColor: "rgba(2,132,199,0.08)" },
  aboutMark: { width: 48, height: 48, borderRadius: 16, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  aboutMarkImage: { width: "100%", height: "100%" },
  aboutCopy: { flex: 1 },
  aboutTitle: { fontSize: 16, fontWeight: "900" },
  aboutText: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  storageNote: { textAlign: "center", fontSize: 11, lineHeight: 16, marginTop: 3 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "flex-end" },
  modalCard: { maxHeight: "76%", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, gap: 15 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  modalTitle: { fontSize: 21, fontWeight: "900" },
  modalSubtitle: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeOption: { width: "22.5%", minHeight: 43, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  timeOptionText: { fontSize: 13, fontWeight: "800" },
});
