import React, { useMemo } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { EmptyState, ProgressBar, SectionHeader, StatusBadge, Surface, typography } from "@/components/fittrack-ui";
import { formatDuration, formatLongDate, getWeekDates, selectPlan, startOfWeek, toDateKey, useWorkoutStore } from "@/lib/workout-store";
import { useColors } from "@/hooks/use-colors";

export default function HistoryScreen() {
  const colors = useColors();
  const { state } = useWorkoutStore();
  const weekDates = getWeekDates(startOfWeek());
  const planned = weekDates.filter((date) => (selectPlan(state, date)?.exerciseIds.length ?? 0) > 0).length;
  const completed = weekDates.filter((date) => state.sessions.some((session) => session.date === date && session.status === "completed")).length;
  const completionRate = planned ? Math.round((completed / planned) * 100) : 0;
  const totalSeconds = state.sessions.reduce((sum, session) => sum + (session.durationSeconds ?? 0), 0);
  const sessions = useMemo(() => [...state.sessions].sort((a, b) => b.date.localeCompare(a.date)), [state.sessions]);
  const currentStreak = useMemo(() => {
    let streak = 0;
    const cursor = new Date();
    while (state.sessions.some((session) => session.date === toDateKey(cursor) && session.status === "completed")) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
    return streak;
  }, [state.sessions]);

  return <ScreenContainer className="px-5" safeAreaClassName="bg-background">
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View><Text style={[styles.eyebrow, { color: colors.primary }]}>CONSISTÊNCIA</Text><Text style={[typography.title, { color: colors.foreground }]}>Seu histórico.</Text><Text style={[styles.intro, { color: colors.muted }]}>Pequenos registros criam uma visão clara da sua evolução.</Text></View>
      <Surface accent style={styles.summaryCard}><View style={styles.summaryTop}><View><Text style={[styles.summaryLabel, { color: colors.muted }]}>Resumo da semana</Text><Text style={[styles.summaryValue, { color: colors.foreground }]}>{completionRate}% de consistência</Text></View><View style={[styles.summaryIcon, { backgroundColor: `${colors.primary}18` }]}><IconSymbol name="chart.bar.fill" size={24} color={colors.primary} /></View></View><ProgressBar value={completionRate} /><View style={styles.summaryStats}><View><Text style={[styles.summaryStatValue, { color: colors.foreground }]}>{completed}/{planned}</Text><Text style={[styles.summaryStatLabel, { color: colors.muted }]}>treinos concluídos</Text></View><View><Text style={[styles.summaryStatValue, { color: colors.foreground }]}>{currentStreak}</Text><Text style={[styles.summaryStatLabel, { color: colors.muted }]}>dias de sequência</Text></View><View><Text style={[styles.summaryStatValue, { color: colors.foreground }]}>{formatDuration(totalSeconds)}</Text><Text style={[styles.summaryStatLabel, { color: colors.muted }]}>tempo total</Text></View></View></Surface>
      <SectionHeader title="Calendário da semana" />
      <Surface style={styles.calendarCard}><View style={styles.calendarRow}>{weekDates.map((date) => { const plan = selectPlan(state, date); const session = state.sessions.find((item) => item.date === date); const day = new Date(`${date}T12:00:00`); const active = Boolean(plan?.exerciseIds.length); const done = session?.status === "completed"; return <View key={date} style={styles.calendarDay}><Text style={[styles.calendarWeekday, { color: colors.muted }]}>{day.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").slice(0, 3)}</Text><View style={[styles.calendarCircle, { backgroundColor: done ? colors.success : active ? `${colors.primary}16` : colors.background, borderColor: done ? colors.success : active ? colors.primary : colors.border }]}><Text style={[styles.calendarNumber, { color: done ? "#ffffff" : colors.foreground }]}>{day.getDate()}</Text></View><View style={[styles.calendarDot, { backgroundColor: done ? colors.success : active ? colors.primary : colors.border }]} /></View>; })}</View></Surface>
      <SectionHeader title="Treinos registrados" />
      {sessions.length ? <FlatList scrollEnabled={false} data={sessions} keyExtractor={(item) => item.id} renderItem={({ item }) => { const plan = selectPlan(state, item.date); const statusTone = item.status === "completed" ? "success" : item.status === "partial" ? "warning" : "error"; const statusLabel = item.status === "completed" ? "Concluído" : item.status === "partial" ? "Parcial" : item.status === "skipped" ? "Pulado" : "Não realizado"; return <Surface style={styles.historyCard}><View style={styles.historyTop}><View style={styles.historyDateIcon}><IconSymbol name="calendar" size={18} color={colors.primary} /></View><View style={styles.historyCopy}><Text style={[styles.historyTitle, { color: colors.foreground }]}>{plan?.title ?? "Treino"}</Text><Text style={[styles.historyDate, { color: colors.muted }]}>{formatLongDate(item.date)}</Text></View><StatusBadge label={statusLabel} tone={statusTone as any} /></View><View style={styles.historyMeta}><Text style={[styles.historyMetaText, { color: colors.muted }]}>{item.exerciseLogs.length} exercícios</Text><Text style={[styles.historyMetaText, { color: colors.muted }]}>{formatDuration(item.durationSeconds)}</Text><Text style={[styles.historyMetaText, { color: colors.muted }]}>{item.startedAt ? new Date(item.startedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}</Text></View></Surface>; }} /> : <EmptyState icon="chart.bar.fill" title="Seu histórico começa aqui" description="Conclua seu primeiro treino para acompanhar consistência, duração e evolução ao longo das semanas." />}
      <Text style={[styles.privacyNote, { color: colors.muted }]}>Seus registros ficam salvos localmente neste dispositivo.</Text>
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 45, gap: 17 },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  intro: { fontSize: 14, lineHeight: 20, marginTop: 7 },
  summaryCard: { padding: 18, gap: 17 },
  summaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 12, fontWeight: "800" },
  summaryValue: { fontSize: 22, lineHeight: 28, fontWeight: "900", marginTop: 3 },
  summaryIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  summaryStats: { flexDirection: "row", justifyContent: "space-between" },
  summaryStatValue: { fontSize: 17, fontWeight: "900" },
  summaryStatLabel: { fontSize: 10, marginTop: 3 },
  calendarCard: { padding: 13 },
  calendarRow: { flexDirection: "row", justifyContent: "space-between" },
  calendarDay: { alignItems: "center", gap: 6 },
  calendarWeekday: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  calendarCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  calendarNumber: { fontSize: 12, fontWeight: "900" },
  calendarDot: { width: 5, height: 5, borderRadius: 3 },
  historyCard: { padding: 14, borderRadius: 18, gap: 12 },
  historyTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  historyDateIcon: { width: 35, height: 35, borderRadius: 11, backgroundColor: "rgba(2,132,199,0.1)", alignItems: "center", justifyContent: "center" },
  historyCopy: { flex: 1 },
  historyTitle: { fontSize: 15, fontWeight: "900" },
  historyDate: { fontSize: 12, marginTop: 3 },
  historyMeta: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "rgba(100,116,139,0.12)", paddingTop: 10 },
  historyMetaText: { fontSize: 11, fontWeight: "700" },
  privacyNote: { fontSize: 11, textAlign: "center", marginTop: 3 },
});
