import React, { useMemo } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProgressBar, SectionHeader, StatusBadge, Surface, PrimaryButton, typography } from "@/components/fittrack-ui";
import { formatLongDate, getCompletionPercent, selectPlan, selectSession, toDateKey, useWorkoutStore } from "@/lib/workout-store";
import { useColors } from "@/hooks/use-colors";
import { RestTimer } from "@/components/rest-timer";

export default function TodayScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, startWorkout, toggleSet, setWorkoutStatus } = useWorkoutStore();
  const today = toDateKey(new Date());
  const plan = selectPlan(state, today);
  const session = selectSession(state, today);
  const progress = getCompletionPercent(state, today);
  const plannedCount = state.plans.filter((item) => item.exerciseIds.length > 0).length;
  const completedCount = state.sessions.filter((item) => item.status === "completed").length;

  const planExercises = useMemo(() => (plan?.exerciseIds ?? []).map((id) => state.exercises.find((exercise) => exercise.id === id)).filter(Boolean), [plan, state.exercises]);
  const sessionLogs = session?.exerciseLogs ?? [];

  const statusLabel = session?.status === "completed" || progress === 100 ? "Concluído" : session?.status === "partial" ? "Parcialmente concluído" : session?.status === "skipped" ? "Pulado" : session?.status === "not_done" ? "Não realizado" : "Pendente";
  const statusTone = session?.status === "completed" || progress === 100 ? "success" : session?.status === "partial" ? "warning" : session?.status === "skipped" || session?.status === "not_done" ? "error" : "primary";

  const handleStart = () => {
    if (!plan || plan.exerciseIds.length === 0) {
      Alert.alert("Dia de descanso", "Não há exercícios planejados para hoje. Você pode organizar este dia na aba Semana.");
      return;
    }
    startWorkout(today);
  };

  return <ScreenContainer className="px-5" safeAreaClassName="bg-background">
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.brandMark}><Image source={require("@/assets/images/icon.png")} style={styles.brandMarkImage} /></View>
        <View style={styles.headerCopy}><Text style={[styles.eyebrow, { color: colors.primary }]}>FITTRACK</Text><Text style={[typography.title, { color: colors.foreground }]}>Seu treino, no ritmo certo.</Text></View>
        <Pressable onPress={() => router.push("/(tabs)/settings" as any)} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surface, opacity: pressed ? 0.65 : 1 }]}><IconSymbol name="gearshape.fill" size={21} color={colors.foreground} /></Pressable>
      </View>

      <Surface accent style={styles.todayCard}>
        <View style={styles.todayTop}><View><Text style={[styles.cardEyebrow, { color: colors.muted }]}>{formatLongDate(today)}</Text><Text style={[styles.todayTitle, { color: colors.foreground }]}>{plan?.title ?? "Dia livre"}</Text></View><StatusBadge label={statusLabel} tone={statusTone as any} /></View>
        {plan && plan.exerciseIds.length > 0 ? <>
          <View style={styles.progressRow}><Text style={[styles.progressLabel, { color: colors.muted }]}>{progress === 0 ? "Pronto para começar" : `${progress}% do treino concluído`}</Text><Text style={[styles.progressValue, { color: colors.primary }]}>{progress}%</Text></View>
          <ProgressBar value={progress} />
          <View style={styles.todayMeta}><Text style={[styles.metaText, { color: colors.muted }]}><IconSymbol name="figure.strengthtraining.traditional" size={15} color={colors.muted} /> {plan.exerciseIds.length} exercícios</Text><Text style={[styles.metaText, { color: colors.muted }]}><IconSymbol name="clock" size={15} color={colors.muted} /> {session?.durationSeconds ? `${Math.round(session.durationSeconds / 60)} min` : "~35 min"}</Text></View>
          <PrimaryButton onPress={handleStart} icon={progress > 0 ? "arrow.right" : "play.fill"}>{progress === 0 ? "Iniciar treino" : progress === 100 ? "Ver treino concluído" : "Retomar treino"}</PrimaryButton>
        </> : <View style={styles.restContent}><View style={[styles.restIcon, { backgroundColor: `${colors.success}18` }]}><IconSymbol name="trophy.fill" size={25} color={colors.success} /></View><View style={styles.restCopy}><Text style={[styles.restTitle, { color: colors.foreground }]}>Recuperação também é treino.</Text><Text style={[styles.restDescription, { color: colors.muted }]}>Hoje está livre no seu planejamento. Aproveite para descansar ou organize um treino na semana.</Text></View></View>}
      </Surface>

      <SectionHeader title="Resumo da semana" action="Ver histórico" onAction={() => router.push("/(tabs)/history" as any)} />
      <View style={styles.metricsRow}><Surface style={styles.metricCard}><Text style={[styles.metricValue, { color: colors.foreground }]}>{completedCount}</Text><Text style={[styles.metricLabel, { color: colors.muted }]}>concluídos</Text><View style={[styles.metricLine, { backgroundColor: colors.success }]} /></Surface><Surface style={styles.metricCard}><Text style={[styles.metricValue, { color: colors.foreground }]}>{plannedCount}</Text><Text style={[styles.metricLabel, { color: colors.muted }]}>planejados</Text><View style={[styles.metricLine, { backgroundColor: colors.primary }]} /></Surface><Surface style={styles.metricCard}><Text style={[styles.metricValue, { color: colors.foreground }]}>{plannedCount ? Math.round((completedCount / plannedCount) * 100) : 0}%</Text><Text style={[styles.metricLabel, { color: colors.muted }]}>consistência</Text><View style={[styles.metricLine, { backgroundColor: colors.warning }]} /></Surface></View>

      {plan && plan.exerciseIds.length > 0 ? <>
        <SectionHeader title="Exercícios de hoje" action="Editar" onAction={() => router.push("/week" as any)} />
        <View style={styles.exerciseList}>{planExercises.map((exercise, index) => {
          if (!exercise) return null;
          const log = sessionLogs.find((item) => item.exerciseId === exercise.id);
          const completedSets = log?.completedSets ?? 0;
          return <Surface key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseCardHeader}><View style={[styles.exerciseNumber, { backgroundColor: `${colors.primary}16` }]}><Text style={[styles.exerciseNumberText, { color: colors.primary }]}>{String(index + 1).padStart(2, "0")}</Text></View><View style={styles.exerciseCopy}><Text style={[styles.exerciseName, { color: colors.foreground }]}>{exercise.name}</Text><Text style={[styles.exerciseDetail, { color: colors.muted }]}>{exercise.sets} séries × {exercise.reps} {exercise.durationSeconds ? `• ${exercise.durationSeconds}s` : "reps"}  •  {exercise.restSeconds}s descanso</Text></View><IconSymbol name={completedSets >= exercise.sets ? "checkmark.circle.fill" : "chevron.right"} size={23} color={completedSets >= exercise.sets ? colors.success : colors.muted} /></View>
            <View style={styles.setRow}>{Array.from({ length: exercise.sets }, (_, setIndex) => { const done = setIndex < completedSets; return <Pressable key={setIndex} onPress={() => { if (!session) startWorkout(today); toggleSet(today, exercise.id, setIndex); }} style={({ pressed }) => [styles.setChip, { backgroundColor: done ? `${colors.success}18` : colors.background, borderColor: done ? colors.success : colors.border, opacity: pressed ? 0.65 : 1 }]}><IconSymbol name={done ? "checkmark" : "circle"} size={13} color={done ? colors.success : colors.muted} /><Text style={[styles.setChipText, { color: done ? colors.success : colors.muted }]}>Série {setIndex + 1}</Text></Pressable>; })}</View>
          </Surface>;
        })}</View>
        {progress > 0 && progress < 100 ? <View style={styles.secondaryActions}><PrimaryButton variant="secondary" onPress={() => setWorkoutStatus(today, "partial")}>Marcar como parcial</PrimaryButton><PrimaryButton variant="ghost" onPress={() => setWorkoutStatus(today, "skipped")}>Pular treino</PrimaryButton></View> : null}
        {state.settings.restTimerEnabled ? <RestTimer initialSeconds={planExercises[0]?.restSeconds ?? 90} /> : null}
      </> : null}
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 40, gap: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  brandMark: { width: 42, height: 42, borderRadius: 14, overflow: "hidden", backgroundColor: "#0284c7", alignItems: "center", justifyContent: "center" },
  brandMarkImage: { width: "100%", height: "100%" },
  headerCopy: { flex: 1, gap: 2 },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  iconButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  todayCard: { padding: 18, gap: 17 },
  todayTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  cardEyebrow: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  todayTitle: { fontSize: 24, lineHeight: 30, fontWeight: "900", marginTop: 4 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 13, fontWeight: "700" },
  progressValue: { fontSize: 18, fontWeight: "900" },
  todayMeta: { flexDirection: "row", justifyContent: "space-between" },
  metaText: { fontSize: 12, fontWeight: "700", flexDirection: "row", alignItems: "center" },
  restContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  restIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  restCopy: { flex: 1 },
  restTitle: { fontSize: 15, fontWeight: "800" },
  restDescription: { fontSize: 13, lineHeight: 18, marginTop: 3 },
  metricsRow: { flexDirection: "row", gap: 10 },
  metricCard: { flex: 1, padding: 13, borderRadius: 17, gap: 3 },
  metricValue: { fontSize: 24, lineHeight: 28, fontWeight: "900" },
  metricLabel: { fontSize: 11, fontWeight: "700" },
  metricLine: { height: 3, borderRadius: 2, marginTop: 7, width: 28 },
  exerciseList: { gap: 10 },
  exerciseCard: { padding: 14, borderRadius: 18, gap: 13 },
  exerciseCardHeader: { flexDirection: "row", alignItems: "center", gap: 11 },
  exerciseNumber: { width: 37, height: 37, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  exerciseNumberText: { fontSize: 12, fontWeight: "900" },
  exerciseCopy: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: "800" },
  exerciseDetail: { fontSize: 12, marginTop: 3 },
  setRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  setChip: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 8 },
  setChipText: { fontSize: 11, fontWeight: "800" },
  secondaryActions: { flexDirection: "row", alignItems: "center", gap: 8 },
});
