import React, { useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { EmptyState, PrimaryButton, StatusBadge, Surface, typography } from "@/components/fittrack-ui";
import { formatLongDate, formatShortDate, getWeekDates, selectPlan, selectSession, startOfWeek, toDateKey, useWorkoutStore } from "@/lib/workout-store";
import { useColors } from "@/hooks/use-colors";

const addDays = (dateKey: string, amount: number) => {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
};

export default function WeekScreen() {
  const colors = useColors();
  const { state, togglePlanExercise, removePlanExercise, movePlanExercise, copyPlan, duplicateWeek } = useWorkoutStore();
  const currentWeek = toDateKey(startOfWeek());
  const [weekStart, setWeekStart] = useState(currentWeek);
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const plan = selectPlan(state, selectedDate);
  const session = selectSession(state, selectedDate);
  const planExercises = (plan?.exerciseIds ?? []).map((id) => state.exercises.find((exercise) => exercise.id === id)).filter(Boolean);
  const availableExercises = state.exercises.filter((exercise) => !(plan?.exerciseIds ?? []).includes(exercise.id));

  const selectDay = (date: string) => { setSelectedDate(date); setAddModalVisible(false); };
  const shiftWeek = (direction: number) => { const next = addDays(weekStart, direction * 7); setWeekStart(next); setSelectedDate(next); };
  const handleDuplicate = () => {
    const target = addDays(weekStart, 7);
    duplicateWeek(weekStart, target);
    Alert.alert("Semana duplicada", `O planejamento foi copiado para a semana de ${formatShortDate(target)}.`);
  };

  return <ScreenContainer className="px-5" safeAreaClassName="bg-background">
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>PLANEJAMENTO</Text><Text style={[typography.title, { color: colors.foreground }]}>Sua semana.</Text></View><Pressable onPress={handleDuplicate} style={({ pressed }) => [styles.headerIcon, { backgroundColor: colors.surface, opacity: pressed ? 0.65 : 1 }]}><IconSymbol name="doc.on.doc" size={20} color={colors.primary} /></Pressable></View>
      <View style={styles.weekSwitcher}><Pressable onPress={() => shiftWeek(-1)} style={styles.switcherButton}><IconSymbol name="chevron.left" size={20} color={colors.foreground} /></Pressable><View style={styles.weekSwitcherCopy}><Text style={[styles.weekLabel, { color: colors.foreground }]}>{weekStart === currentWeek ? "Semana atual" : `Semana de ${formatShortDate(weekStart)}`}</Text><Text style={[styles.weekHint, { color: colors.muted }]}>Toque em um dia para editar</Text></View><Pressable onPress={() => shiftWeek(1)} style={styles.switcherButton}><IconSymbol name="chevron.right" size={20} color={colors.foreground} /></Pressable></View>
      <FlatList horizontal showsHorizontalScrollIndicator={false} data={weekDates} keyExtractor={(item) => item} contentContainerStyle={styles.daysList} renderItem={({ item }) => {
        const dayPlan = selectPlan(state, item);
        const daySession = selectSession(state, item);
        const selected = item === selectedDate;
        const date = new Date(`${item}T12:00:00`);
        const weekday = date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
        return <Pressable onPress={() => selectDay(item)} style={({ pressed }) => [styles.dayCard, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border, opacity: pressed ? 0.75 : 1 }]}><Text style={[styles.dayName, { color: selected ? "#ffffff" : colors.muted }]}>{weekday.charAt(0).toUpperCase() + weekday.slice(1)}</Text><Text style={[styles.dayNumber, { color: selected ? "#ffffff" : colors.foreground }]}>{date.getDate()}</Text><View style={[styles.dayDot, { backgroundColor: daySession?.status === "completed" ? colors.success : dayPlan?.exerciseIds.length ? selected ? "#ffffff" : colors.primary : "transparent" }]} /></Pressable>;
      }} />

      <View style={styles.selectedHeading}><View><Text style={[styles.selectedDate, { color: colors.foreground }]}>{formatLongDate(selectedDate)}</Text><Text style={[styles.selectedSubtitle, { color: colors.muted }]}>{plan?.title ?? "Dia livre"}</Text></View>{plan?.exerciseIds.length ? <StatusBadge label={session?.status === "completed" ? "Concluído" : `${plan.exerciseIds.length} exercícios`} tone={session?.status === "completed" ? "success" : "primary"} /> : null}</View>
      <Surface style={styles.planCard}>
        {planExercises.length > 0 ? <FlatList scrollEnabled={false} data={planExercises} keyExtractor={(item) => item!.id} renderItem={({ item, index }) => {
          if (!item) return null;
          return <View style={[styles.planExerciseRow, index < planExercises.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}><View style={[styles.planIndex, { backgroundColor: `${colors.primary}16` }]}><Text style={[styles.planIndexText, { color: colors.primary }]}>{index + 1}</Text></View><View style={styles.planExerciseCopy}><Text style={[styles.planExerciseName, { color: colors.foreground }]}>{item.name}</Text><Text style={[styles.planExerciseDetail, { color: colors.muted }]}>{item.sets} × {item.reps}  •  {item.category}</Text></View><Pressable onPress={() => movePlanExercise(selectedDate, item.id, -1)} style={styles.smallIcon}><IconSymbol name="chevron.up" size={18} color={index === 0 ? colors.border : colors.muted} /></Pressable><Pressable onPress={() => movePlanExercise(selectedDate, item.id, 1)} style={styles.smallIcon}><IconSymbol name="chevron.down" size={18} color={index === planExercises.length - 1 ? colors.border : colors.muted} /></Pressable><Pressable onPress={() => removePlanExercise(selectedDate, item.id)} style={styles.smallIcon}><IconSymbol name="trash" size={18} color={colors.error} /></Pressable></View>;
        }} /> : <EmptyState icon="calendar" title="Dia livre" description="Deixe este dia sem treino ou adicione exercícios da sua biblioteca." />}
        <PrimaryButton variant="secondary" icon="plus" onPress={() => setAddModalVisible(true)}>{planExercises.length ? "Adicionar exercício" : "Montar treino"}</PrimaryButton>
      </Surface>

      {planExercises.length ? <View style={styles.copyActions}><PrimaryButton variant="ghost" icon="doc.on.doc" onPress={() => setCopyModalVisible(true)}>Copiar para outro dia</PrimaryButton><PrimaryButton variant="ghost" icon="arrow.clockwise" onPress={handleDuplicate}>Duplicar semana</PrimaryButton></View> : null}

      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}><View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: colors.background }]}><View style={styles.modalHeader}><View><Text style={[styles.modalTitle, { color: colors.foreground }]}>Adicionar exercício</Text><Text style={[styles.modalSubtitle, { color: colors.muted }]}>{formatLongDate(selectedDate)}</Text></View><Pressable onPress={() => setAddModalVisible(false)}><IconSymbol name="xmark" size={22} color={colors.muted} /></Pressable></View><FlatList data={availableExercises} keyExtractor={(item) => item.id} style={styles.modalList} renderItem={({ item }) => <Pressable onPress={() => { togglePlanExercise(selectedDate, item.id); setAddModalVisible(false); }} style={({ pressed }) => [styles.modalExercise, { borderBottomColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><View style={styles.modalExerciseCopy}><Text style={[styles.modalExerciseName, { color: colors.foreground }]}>{item.name}</Text><Text style={[styles.modalExerciseDetail, { color: colors.muted }]}>{item.category}  •  {item.sets} × {item.reps}</Text></View><IconSymbol name="plus.circle.fill" size={23} color={colors.primary} /></Pressable>} ListEmptyComponent={<EmptyState icon="figure.strengthtraining.traditional" title="Biblioteca vazia" description="Cadastre exercícios na aba Exercícios." />} /><PrimaryButton variant="secondary" onPress={() => setAddModalVisible(false)}>Fechar</PrimaryButton></View></View></Modal>

      <Modal visible={copyModalVisible} transparent animationType="slide" onRequestClose={() => setCopyModalVisible(false)}><View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: colors.background }]}><View style={styles.modalHeader}><View><Text style={[styles.modalTitle, { color: colors.foreground }]}>Copiar treino para</Text><Text style={[styles.modalSubtitle, { color: colors.muted }]}>Escolha o dia de destino</Text></View><Pressable onPress={() => setCopyModalVisible(false)}><IconSymbol name="xmark" size={22} color={colors.muted} /></Pressable></View><FlatList data={getWeekDates(weekStart).filter((date) => date !== selectedDate)} keyExtractor={(item) => item} style={styles.modalList} renderItem={({ item }) => <Pressable onPress={() => { copyPlan(selectedDate, item); setCopyModalVisible(false); Alert.alert("Treino copiado", `O treino foi copiado para ${formatLongDate(item)}.`); }} style={({ pressed }) => [styles.modalExercise, { borderBottomColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.modalExerciseName, { color: colors.foreground }]}>{formatLongDate(item)}</Text><Text style={[styles.modalExerciseDetail, { color: colors.muted }]}>{selectPlan(state, item)?.exerciseIds.length ?? 0} exercícios planejados</Text></Pressable>} /></View></View></Modal>
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 42, gap: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  headerIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  weekSwitcher: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  switcherButton: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  weekSwitcherCopy: { alignItems: "center" },
  weekLabel: { fontSize: 15, fontWeight: "800" },
  weekHint: { fontSize: 12, marginTop: 3 },
  daysList: { gap: 9 },
  dayCard: { width: 57, height: 79, borderRadius: 17, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  dayName: { fontSize: 11, fontWeight: "800" },
  dayNumber: { fontSize: 22, lineHeight: 27, fontWeight: "900" },
  dayDot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  selectedHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  selectedDate: { fontSize: 21, lineHeight: 27, fontWeight: "900" },
  selectedSubtitle: { fontSize: 13, marginTop: 3 },
  planCard: { gap: 14 },
  planExerciseRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 9 },
  planIndex: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  planIndexText: { fontSize: 12, fontWeight: "900" },
  planExerciseCopy: { flex: 1 },
  planExerciseName: { fontSize: 15, fontWeight: "800" },
  planExerciseDetail: { fontSize: 12, marginTop: 3 },
  smallIcon: { width: 28, height: 32, alignItems: "center", justifyContent: "center" },
  copyActions: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "flex-end" },
  modalCard: { minHeight: "54%", maxHeight: "82%", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, gap: 15 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  modalTitle: { fontSize: 21, fontWeight: "900" },
  modalSubtitle: { fontSize: 13, marginTop: 4 },
  modalList: { flexGrow: 0 },
  modalExercise: { paddingVertical: 14, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalExerciseCopy: { flex: 1 },
  modalExerciseName: { fontSize: 15, fontWeight: "800" },
  modalExerciseDetail: { fontSize: 12, marginTop: 3 },
});
