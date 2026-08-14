import React, { useMemo, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { EmptyState, PrimaryButton, SectionHeader, Surface, typography } from "@/components/fittrack-ui";
import { Exercise, toDateKey, useWorkoutStore } from "@/lib/workout-store";
import { useColors } from "@/hooks/use-colors";

type FormState = Omit<Exercise, "id" | "isCustom">;
const blankForm: FormState = { name: "", description: "", category: "", sets: 3, reps: 10, durationSeconds: undefined, restSeconds: 60, notes: "" };

const templates = [
  { id: "upper", name: "Upper Body", description: "Força e controle na parte superior", ids: ["pull-up", "muscle-up", "handstand"] },
  { id: "legs", name: "Pernas e potência", description: "Base forte para a semana", ids: ["squat", "calf-raise", "pistol-squat"] },
];

export default function ExercisesScreen() {
  const colors = useColors();
  const { state, addExercise, updateExercise, deleteExercise, togglePlanExercise } = useWorkoutStore();
  const [query, setQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [form, setForm] = useState<FormState>(blankForm);
  const [showTemplates, setShowTemplates] = useState(false);
  const filtered = useMemo(() => state.exercises.filter((exercise) => `${exercise.name} ${exercise.category}`.toLowerCase().includes(query.toLowerCase())), [query, state.exercises]);

  const openCreate = () => { setEditing(null); setForm(blankForm); setModalVisible(true); };
  const openEdit = (exercise: Exercise) => { setEditing(exercise); setForm({ name: exercise.name, description: exercise.description, category: exercise.category, sets: exercise.sets, reps: exercise.reps, durationSeconds: exercise.durationSeconds, restSeconds: exercise.restSeconds, notes: exercise.notes }); setModalVisible(true); };
  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((current) => ({ ...current, [field]: value }));
  const save = () => {
    if (!form.name.trim()) { Alert.alert("Nome necessário", "Informe um nome para o exercício."); return; }
    const normalized = { ...form, name: form.name.trim(), category: form.category.trim() || "Geral", sets: Math.max(1, Number(form.sets) || 1), reps: Math.max(1, Number(form.reps) || 1), restSeconds: Math.max(0, Number(form.restSeconds) || 0), durationSeconds: form.durationSeconds ? Math.max(1, Number(form.durationSeconds)) : undefined };
    if (editing) updateExercise({ ...editing, ...normalized }); else addExercise({ ...normalized, isCustom: true });
    setModalVisible(false);
  };
  const applyTemplate = (ids: string[]) => { const today = toDateKey(new Date()); ids.forEach((id) => { if (state.exercises.some((exercise) => exercise.id === id)) togglePlanExercise(today, id); }); Alert.alert("Modelo aplicado", "Os exercícios foram adicionados ao treino de hoje."); };

  return <ScreenContainer className="px-5" safeAreaClassName="bg-background">
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>BIBLIOTECA</Text><Text style={[typography.title, { color: colors.foreground }]}>Exercícios.</Text></View><Pressable onPress={openCreate} style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary, opacity: pressed ? 0.75 : 1 }]}><IconSymbol name="plus" size={22} color="#ffffff" /></Pressable></View>
      <Text style={[styles.intro, { color: colors.muted }]}>Cadastre uma vez. Reutilize em todos os seus treinos.</Text>
      <PrimaryButton icon="plus" onPress={openCreate}>Novo exercício</PrimaryButton>
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}><IconSymbol name={"magnifyingglass" as any} size={19} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar exercício ou grupo muscular" placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.foreground }]} /></View>
      <SectionHeader title={`${filtered.length} exercícios`} />
      {filtered.length ? <FlatList scrollEnabled={false} data={filtered} keyExtractor={(item) => item.id} renderItem={({ item }) => <Surface style={styles.exerciseCard}><View style={styles.exerciseTop}><View style={[styles.exerciseIcon, { backgroundColor: `${colors.primary}16` }]}><IconSymbol name="figure.strengthtraining.traditional" size={21} color={colors.primary} /></View><View style={styles.exerciseCopy}><Text style={[styles.exerciseName, { color: colors.foreground }]}>{item.name}</Text><Text style={[styles.exerciseCategory, { color: colors.primary }]}>{item.category}</Text></View><Pressable onPress={() => openEdit(item)} style={styles.actionIcon}><IconSymbol name="pencil" size={18} color={colors.muted} /></Pressable><Pressable onPress={() => Alert.alert("Excluir exercício?", "Ele será removido também dos planejamentos futuros.", [{ text: "Cancelar", style: "cancel" }, { text: "Excluir", style: "destructive", onPress: () => deleteExercise(item.id) }])} style={styles.actionIcon}><IconSymbol name="trash" size={18} color={colors.error} /></Pressable></View><Text style={[styles.exerciseDescription, { color: colors.muted }]}>{item.description || "Sem descrição adicionada."}</Text><View style={styles.exerciseStats}><View><Text style={[styles.statValue, { color: colors.foreground }]}>{item.sets} × {item.reps}</Text><Text style={[styles.statLabel, { color: colors.muted }]}>{item.durationSeconds ? `${item.durationSeconds}s por série` : "séries × reps"}</Text></View><View><Text style={[styles.statValue, { color: colors.foreground }]}>{item.restSeconds}s</Text><Text style={[styles.statLabel, { color: colors.muted }]}>descanso</Text></View><Text style={[styles.exerciseNotes, { color: colors.muted }]} numberOfLines={2}>{item.notes || "Sem observações"}</Text></View></Surface>} /> : <EmptyState icon="figure.strengthtraining.traditional" title="Nenhum exercício encontrado" description="Crie um exercício personalizado ou ajuste a busca." />}
      <View style={styles.templatesHeader}><SectionHeader title="Modelos de treino" action={showTemplates ? "Ocultar" : "Ver modelos"} onAction={() => setShowTemplates(!showTemplates)} /></View>
      {showTemplates ? <View style={styles.templatesList}>{templates.map((template) => <Surface key={template.id} style={styles.templateCard}><View style={[styles.templateIcon, { backgroundColor: `${colors.warning}18` }]}><IconSymbol name="trophy.fill" size={20} color={colors.warning} /></View><View style={styles.templateCopy}><Text style={[styles.templateName, { color: colors.foreground }]}>{template.name}</Text><Text style={[styles.templateDescription, { color: colors.muted }]}>{template.description}</Text><Text style={[styles.templateExercises, { color: colors.muted }]}>{template.ids.map((id) => state.exercises.find((exercise) => exercise.id === id)?.name).filter(Boolean).join("  •  ")}</Text></View><Pressable onPress={() => applyTemplate(template.ids)} style={({ pressed }) => [styles.templateButton, { borderColor: colors.primary, opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.templateButtonText, { color: colors.primary }]}>Usar</Text></Pressable></Surface>)}</View> : null}
    </ScrollView>

    <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}><KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === "ios" ? "padding" : undefined}><View style={[styles.modalCard, { backgroundColor: colors.background }]}><View style={styles.modalHeader}><View><Text style={[styles.modalTitle, { color: colors.foreground }]}>{editing ? "Editar exercício" : "Novo exercício"}</Text><Text style={[styles.modalSubtitle, { color: colors.muted }]}>Detalhes usados nos treinos</Text></View><Pressable onPress={() => setModalVisible(false)}><IconSymbol name="xmark" size={22} color={colors.muted} /></Pressable></View><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}><FormField label="Nome" value={form.name} onChangeText={(value) => updateField("name", value)} placeholder="Ex: Pull Up" colors={colors} /><FormField label="Grupo muscular" value={form.category} onChangeText={(value) => updateField("category", value)} placeholder="Ex: Costas" colors={colors} /><View style={styles.formRow}><FormField label="Séries" value={String(form.sets)} onChangeText={(value) => updateField("sets", Number(value.replace(/\D/g, "")) || 0)} keyboardType="number-pad" placeholder="4" colors={colors} /><FormField label="Repetições" value={String(form.reps)} onChangeText={(value) => updateField("reps", Number(value.replace(/\D/g, "")) || 0)} keyboardType="number-pad" placeholder="8" colors={colors} /><FormField label="Descanso (s)" value={String(form.restSeconds)} onChangeText={(value) => updateField("restSeconds", Number(value.replace(/\D/g, "")) || 0)} keyboardType="number-pad" placeholder="90" colors={colors} /></View><FormField label="Descrição" value={form.description} onChangeText={(value) => updateField("description", value)} placeholder="Como executar o exercício" colors={colors} multiline /><FormField label="Observações" value={form.notes} onChangeText={(value) => updateField("notes", value)} placeholder="Dicas, pegada ou adaptações" colors={colors} multiline /></ScrollView><PrimaryButton onPress={save}>{editing ? "Salvar alterações" : "Adicionar exercício"}</PrimaryButton></View></KeyboardAvoidingView></Modal>
  </ScreenContainer>;
}

function FormField({ label, value, onChangeText, placeholder, colors, multiline, keyboardType }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; colors: ReturnType<typeof useColors>; multiline?: boolean; keyboardType?: "number-pad" | "default" }) {
  return <View style={styles.field}><Text style={[styles.fieldLabel, { color: colors.muted }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} keyboardType={keyboardType ?? "default"} multiline={multiline} style={[styles.input, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }, multiline && styles.textArea]} /></View>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 45, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  addButton: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  intro: { fontSize: 14, lineHeight: 20, marginTop: -7 },
  searchBox: { height: 48, borderRadius: 15, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  exerciseCard: { padding: 15, borderRadius: 19, gap: 12 },
  exerciseTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  exerciseIcon: { width: 39, height: 39, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  exerciseCopy: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: "900" },
  exerciseCategory: { fontSize: 12, fontWeight: "700", marginTop: 2 },
  actionIcon: { padding: 5 },
  exerciseDescription: { fontSize: 13, lineHeight: 18 },
  exerciseStats: { flexDirection: "row", alignItems: "center", gap: 18, borderTopWidth: 1, borderTopColor: "rgba(100,116,139,0.12)", paddingTop: 10 },
  statValue: { fontSize: 14, fontWeight: "900" },
  statLabel: { fontSize: 10, marginTop: 2 },
  exerciseNotes: { flex: 1, fontSize: 11, lineHeight: 16 },
  templatesHeader: { marginTop: 6 },
  templatesList: { gap: 10 },
  templateCard: { flexDirection: "row", alignItems: "center", gap: 11, padding: 14, borderRadius: 18 },
  templateIcon: { width: 37, height: 37, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  templateCopy: { flex: 1 },
  templateName: { fontSize: 15, fontWeight: "900" },
  templateDescription: { fontSize: 12, marginTop: 3 },
  templateExercises: { fontSize: 10, marginTop: 6 },
  templateButton: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 8 },
  templateButtonText: { fontSize: 12, fontWeight: "900" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "flex-end" },
  modalCard: { maxHeight: "90%", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, gap: 15 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  modalTitle: { fontSize: 22, fontWeight: "900" },
  modalSubtitle: { fontSize: 13, marginTop: 4 },
  formContent: { gap: 13, paddingBottom: 8 },
  formRow: { flexDirection: "row", gap: 8 },
  field: { flex: 1, gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "800" },
  input: { minHeight: 46, borderWidth: 1, borderRadius: 13, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  textArea: { minHeight: 76, textAlignVertical: "top" },
});
