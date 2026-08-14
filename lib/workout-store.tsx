import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";

export type WorkoutStatus = "in_progress" | "completed" | "partial" | "not_done" | "skipped";

export type Exercise = {
  id: string;
  name: string;
  description: string;
  category: string;
  sets: number;
  reps: number;
  durationSeconds?: number;
  restSeconds: number;
  notes: string;
  isCustom?: boolean;
};

export type WorkoutPlan = {
  id: string;
  date: string;
  title: string;
  exerciseIds: string[];
};

export type ExerciseLog = {
  exerciseId: string;
  plannedSets: number;
  plannedReps: number;
  completedSets: number;
  completedReps: number[];
  notes: string;
};

export type WorkoutSession = {
  id: string;
  planId: string;
  date: string;
  status: WorkoutStatus;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  exerciseLogs: ExerciseLog[];
  notes: string;
};

export type AppSettings = {
  notificationsEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;
  fullSummary: boolean;
  eveningReminder: boolean;
  restTimerEnabled: boolean;
};

export type WorkoutState = {
  exercises: Exercise[];
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
  settings: AppSettings;
};

type Action =
  | { type: "hydrate"; state: WorkoutState }
  | { type: "add-exercise"; exercise: Exercise }
  | { type: "update-exercise"; exercise: Exercise }
  | { type: "delete-exercise"; id: string }
  | { type: "toggle-plan-exercise"; date: string; exerciseId: string }
  | { type: "remove-plan-exercise"; date: string; exerciseId: string }
  | { type: "move-plan-exercise"; date: string; exerciseId: string; direction: -1 | 1 }
  | { type: "copy-plan"; sourceDate: string; targetDate: string }
  | { type: "duplicate-week"; sourceWeekStart: string; targetWeekStart: string }
  | { type: "start-workout"; date: string }
  | { type: "toggle-set"; date: string; exerciseId: string; setIndex: number }
  | { type: "set-workout-status"; date: string; status: WorkoutStatus }
  | { type: "update-settings"; settings: Partial<AppSettings> };

const STORAGE_KEY = "fittrack-state-v1";

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const pad = (value: number) => String(value).padStart(2, "0");

export const toDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const fromDateKey = (dateKey: string) => new Date(`${dateKey}T12:00:00`);

export const startOfWeek = (date = new Date()) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(12, 0, 0, 0);
  return result;
};

export const getWeekDates = (weekStart: Date | string = startOfWeek()) => {
  const base = typeof weekStart === "string" ? fromDateKey(weekStart) : new Date(weekStart);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() + index);
    return toDateKey(date);
  });
};

export const formatLongDate = (dateKey: string) => {
  const value = fromDateKey(dateKey).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const formatShortDate = (dateKey: string) => fromDateKey(dateKey).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

const seedExercises: Exercise[] = [
  { id: "pull-up", name: "Pull Up", description: "Puxada na barra com pegada pronada.", category: "Costas", sets: 4, reps: 8, restSeconds: 90, notes: "Utilizar pegada pronada.", isCustom: false },
  { id: "muscle-up", name: "Muscle Up", description: "Transição explosiva da barra para apoio.", category: "Full body", sets: 3, reps: 5, restSeconds: 120, notes: "Priorizar técnica e controle.", isCustom: false },
  { id: "handstand", name: "Handstand", description: "Equilíbrio invertido com braços estendidos.", category: "Ombros", sets: 4, reps: 1, durationSeconds: 30, restSeconds: 90, notes: "Manter o core ativo.", isCustom: false },
  { id: "squat", name: "Agachamento", description: "Agachamento livre com amplitude confortável.", category: "Pernas", sets: 4, reps: 10, restSeconds: 90, notes: "Joelhos acompanham a linha dos pés.", isCustom: false },
  { id: "calf-raise", name: "Panturrilha", description: "Elevação de panturrilhas em pé.", category: "Pernas", sets: 3, reps: 15, restSeconds: 60, notes: "Pausar no topo do movimento.", isCustom: false },
  { id: "pistol-squat", name: "Pistol Squat", description: "Agachamento unilateral com controle.", category: "Pernas", sets: 3, reps: 6, restSeconds: 90, notes: "Usar apoio se necessário.", isCustom: false },
  { id: "planche", name: "Planche", description: "Isometria de força com o corpo paralelo ao chão.", category: "Peito e core", sets: 4, reps: 1, durationSeconds: 20, restSeconds: 120, notes: "Progredir com variação adequada.", isCustom: false },
  { id: "l-sit", name: "L-Sit", description: "Isometria com pernas estendidas à frente.", category: "Core", sets: 4, reps: 1, durationSeconds: 20, restSeconds: 90, notes: "Empurrar o chão com os ombros.", isCustom: false },
  { id: "pike-push-up", name: "Pike Push Up", description: "Flexão com quadril elevado para trabalhar ombros.", category: "Ombros", sets: 3, reps: 10, restSeconds: 75, notes: "Descer com controle.", isCustom: false },
  { id: "dips", name: "Dips", description: "Paralelas com amplitude controlada.", category: "Peito e tríceps", sets: 4, reps: 8, restSeconds: 90, notes: "Evitar perder a posição dos ombros.", isCustom: false },
];

const buildSeedState = (): WorkoutState => {
  const week = getWeekDates();
  const templates = [
    { title: "Upper Body", exerciseIds: ["pull-up", "muscle-up", "handstand"] },
    { title: "Pernas e potência", exerciseIds: ["squat", "calf-raise", "pistol-squat"] },
    { title: "Core e equilíbrio", exerciseIds: ["planche", "l-sit", "pike-push-up"] },
    { title: "Upper Body", exerciseIds: ["dips", "pull-up", "handstand"] },
    { title: "Mobilidade e técnica", exerciseIds: ["l-sit", "pike-push-up"] },
    { title: "Full body", exerciseIds: ["squat", "dips", "pull-up"] },
  ];
  const plans = week.map((date, index) => ({
    id: `plan-${date}`,
    date,
    title: index === 6 ? "Descanso" : templates[index % templates.length].title,
    exerciseIds: index === 6 ? [] : templates[index % templates.length].exerciseIds,
  }));
  return {
    exercises: seedExercises,
    plans,
    sessions: [],
    settings: {
      notificationsEnabled: true,
      notificationHour: 8,
      notificationMinute: 0,
      fullSummary: true,
      eveningReminder: false,
      restTimerEnabled: true,
    },
  };
};

const createSession = (state: WorkoutState, date: string, existing?: WorkoutSession): WorkoutSession | null => {
  const plan = state.plans.find((item) => item.date === date);
  if (!plan || plan.exerciseIds.length === 0) return null;
  const exerciseLogs = plan.exerciseIds.map((exerciseId) => {
    const exercise = state.exercises.find((item) => item.id === exerciseId);
    return {
      exerciseId,
      plannedSets: exercise?.sets ?? 0,
      plannedReps: exercise?.reps ?? 0,
      completedSets: existing?.exerciseLogs.find((log) => log.exerciseId === exerciseId)?.completedSets ?? 0,
      completedReps: existing?.exerciseLogs.find((log) => log.exerciseId === exerciseId)?.completedReps ?? [],
      notes: existing?.exerciseLogs.find((log) => log.exerciseId === exerciseId)?.notes ?? "",
    };
  });
  return {
    id: existing?.id ?? uid("session"),
    planId: plan.id,
    date,
    status: existing?.status === "completed" ? "completed" : "in_progress",
    startedAt: existing?.startedAt ?? new Date().toISOString(),
    endedAt: existing?.endedAt,
    durationSeconds: existing?.durationSeconds,
    exerciseLogs,
    notes: existing?.notes ?? "",
  };
};

export const workoutReducer = (state: WorkoutState, action: Action): WorkoutState => {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "add-exercise":
      return { ...state, exercises: [...state.exercises, action.exercise] };
    case "update-exercise":
      return { ...state, exercises: state.exercises.map((exercise) => exercise.id === action.exercise.id ? action.exercise : exercise) };
    case "delete-exercise":
      return {
        ...state,
        exercises: state.exercises.filter((exercise) => exercise.id !== action.id),
        plans: state.plans.map((plan) => ({ ...plan, exerciseIds: plan.exerciseIds.filter((id) => id !== action.id) })),
      };
    case "toggle-plan-exercise": {
      const plan = state.plans.find((item) => item.date === action.date);
      const nextPlan = plan
        ? { ...plan, exerciseIds: plan.exerciseIds.includes(action.exerciseId) ? plan.exerciseIds.filter((id) => id !== action.exerciseId) : [...plan.exerciseIds, action.exerciseId] }
        : { id: `plan-${action.date}`, date: action.date, title: "Treino personalizado", exerciseIds: [action.exerciseId] };
      return { ...state, plans: plan ? state.plans.map((item) => item.id === plan.id ? nextPlan : item) : [...state.plans, nextPlan] };
    }
    case "remove-plan-exercise":
      return { ...state, plans: state.plans.map((plan) => plan.date === action.date ? { ...plan, exerciseIds: plan.exerciseIds.filter((id) => id !== action.exerciseId) } : plan) };
    case "move-plan-exercise": {
      return {
        ...state,
        plans: state.plans.map((plan) => {
          if (plan.date !== action.date) return plan;
          const index = plan.exerciseIds.indexOf(action.exerciseId);
          const target = index + action.direction;
          if (index < 0 || target < 0 || target >= plan.exerciseIds.length) return plan;
          const ids = [...plan.exerciseIds];
          [ids[index], ids[target]] = [ids[target], ids[index]];
          return { ...plan, exerciseIds: ids };
        }),
      };
    }
    case "copy-plan": {
      const source = state.plans.find((plan) => plan.date === action.sourceDate);
      if (!source) return state;
      const target = state.plans.find((plan) => plan.date === action.targetDate);
      const next = { ...source, id: target?.id ?? `plan-${action.targetDate}`, date: action.targetDate, exerciseIds: [...source.exerciseIds] };
      return { ...state, plans: target ? state.plans.map((plan) => plan.id === target.id ? next : plan) : [...state.plans, next] };
    }
    case "duplicate-week": {
      const sourceDates = getWeekDates(action.sourceWeekStart);
      const targetDates = getWeekDates(action.targetWeekStart);
      const clones = sourceDates.map((sourceDate, index) => {
        const source = state.plans.find((plan) => plan.date === sourceDate);
        if (!source) return null;
        const date = targetDates[index];
        return { ...source, id: `plan-${date}`, date, exerciseIds: [...source.exerciseIds] };
      }).filter(Boolean) as WorkoutPlan[];
      const dates = new Set(clones.map((plan) => plan.date));
      return { ...state, plans: [...state.plans.filter((plan) => !dates.has(plan.date)), ...clones] };
    }
    case "start-workout": {
      const current = state.sessions.find((session) => session.date === action.date);
      const session = createSession(state, action.date, current);
      if (!session) return state;
      return { ...state, sessions: current ? state.sessions.map((item) => item.id === current.id ? session : item) : [...state.sessions, session] };
    }
    case "toggle-set": {
      const current = state.sessions.find((session) => session.date === action.date);
      const session = createSession(state, action.date, current);
      if (!session) return state;
      const logs = session.exerciseLogs.map((log) => {
        if (log.exerciseId !== action.exerciseId) return log;
        const isCompleted = action.setIndex < log.completedSets;
        const completedSets = isCompleted ? Math.max(0, log.completedSets - 1) : Math.min(log.plannedSets, log.completedSets + 1);
        return { ...log, completedSets, completedReps: Array.from({ length: completedSets }, () => log.plannedReps) };
      });
      const allDone = logs.length > 0 && logs.every((log) => log.completedSets >= log.plannedSets);
      const next = { ...session, exerciseLogs: logs, status: allDone ? "completed" : "in_progress", endedAt: allDone ? new Date().toISOString() : undefined } as WorkoutSession;
      return { ...state, sessions: current ? state.sessions.map((item) => item.id === current.id ? next : item) : [...state.sessions, next] };
    }
    case "set-workout-status": {
      const current = state.sessions.find((session) => session.date === action.date);
      const session = createSession(state, action.date, current);
      if (!session) return state;
      const completedLogs = action.status === "completed"
        ? session.exerciseLogs.map((log) => ({ ...log, completedSets: log.plannedSets, completedReps: Array.from({ length: log.plannedSets }, () => log.plannedReps) }))
        : session.exerciseLogs;
      const next = { ...session, status: action.status, exerciseLogs: completedLogs, endedAt: ["completed", "partial", "not_done", "skipped"].includes(action.status) ? new Date().toISOString() : session.endedAt };
      return { ...state, sessions: current ? state.sessions.map((item) => item.id === current.id ? next : item) : [...state.sessions, next] };
    }
    case "update-settings":
      return { ...state, settings: { ...state.settings, ...action.settings } };
    default:
      return state;
  }
};

type WorkoutContextValue = {
  state: WorkoutState;
  hydrated: boolean;
  addExercise: (exercise: Omit<Exercise, "id">) => void;
  updateExercise: (exercise: Exercise) => void;
  deleteExercise: (id: string) => void;
  togglePlanExercise: (date: string, exerciseId: string) => void;
  removePlanExercise: (date: string, exerciseId: string) => void;
  movePlanExercise: (date: string, exerciseId: string, direction: -1 | 1) => void;
  copyPlan: (sourceDate: string, targetDate: string) => void;
  duplicateWeek: (sourceWeekStart: string, targetWeekStart: string) => void;
  startWorkout: (date: string) => void;
  toggleSet: (date: string, exerciseId: string, setIndex: number) => void;
  setWorkoutStatus: (date: string, status: WorkoutStatus) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
};

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workoutReducer, undefined, buildSeedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { dispatch({ type: "hydrate", state: JSON.parse(raw) as WorkoutState }); } catch { /* fallback to seed state */ }
      }
      setHydrated(true);
    }).catch(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [hydrated, state]);

  const value = useMemo<WorkoutContextValue>(() => ({
    state,
    hydrated,
    addExercise: (exercise) => dispatch({ type: "add-exercise", exercise: { ...exercise, id: uid("exercise") } }),
    updateExercise: (exercise) => dispatch({ type: "update-exercise", exercise }),
    deleteExercise: (id) => dispatch({ type: "delete-exercise", id }),
    togglePlanExercise: (date, exerciseId) => dispatch({ type: "toggle-plan-exercise", date, exerciseId }),
    removePlanExercise: (date, exerciseId) => dispatch({ type: "remove-plan-exercise", date, exerciseId }),
    movePlanExercise: (date, exerciseId, direction) => dispatch({ type: "move-plan-exercise", date, exerciseId, direction }),
    copyPlan: (sourceDate, targetDate) => dispatch({ type: "copy-plan", sourceDate, targetDate }),
    duplicateWeek: (sourceWeekStart, targetWeekStart) => dispatch({ type: "duplicate-week", sourceWeekStart, targetWeekStart }),
    startWorkout: (date) => dispatch({ type: "start-workout", date }),
    toggleSet: (date, exerciseId, setIndex) => dispatch({ type: "toggle-set", date, exerciseId, setIndex }),
    setWorkoutStatus: (date, status) => dispatch({ type: "set-workout-status", date, status }),
    updateSettings: (settings) => dispatch({ type: "update-settings", settings }),
  }), [state, hydrated]);

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkoutStore() {
  const context = useContext(WorkoutContext);
  if (!context) throw new Error("useWorkoutStore deve ser usado dentro de WorkoutProvider");
  return context;
}

export function selectPlan(state: WorkoutState, date: string) {
  return state.plans.find((plan) => plan.date === date);
}

export function selectSession(state: WorkoutState, date: string) {
  return state.sessions.find((session) => session.date === date);
}

export function getCompletionPercent(state: WorkoutState, date: string) {
  const plan = selectPlan(state, date);
  const session = selectSession(state, date);
  if (!plan || plan.exerciseIds.length === 0) return 0;
  if (session?.status === "completed") return 100;
  const totalSets = session?.exerciseLogs.reduce((sum, log) => sum + log.plannedSets, 0) ?? 0;
  const completedSets = session?.exerciseLogs.reduce((sum, log) => sum + log.completedSets, 0) ?? 0;
  return totalSets ? Math.round((completedSets / totalSets) * 100) : 0;
}

export function formatDuration(seconds?: number) {
  if (!seconds) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}min${remainder ? ` ${remainder}s` : ""}`;
}

export const initialWorkoutState = buildSeedState;
