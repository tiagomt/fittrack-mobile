import { describe, expect, it } from "vitest";
import { getCompletionPercent, getWeekDates, initialWorkoutState, startOfWeek, toDateKey, workoutReducer } from "../lib/workout-store";

describe("workout domain", () => {
  it("gera uma semana com sete datas começando na segunda-feira", () => {
    const dates = getWeekDates(startOfWeek(new Date("2026-08-12T12:00:00")));
    expect(dates).toHaveLength(7);
    expect(new Date(`${dates[0]}T12:00:00`).getDay()).toBe(1);
  });

  it("mantém o estado inicial com exercícios e planejamento semanal", () => {
    const state = initialWorkoutState();
    expect(state.exercises.length).toBeGreaterThan(0);
    expect(state.plans).toHaveLength(7);
    expect(state.settings.notificationsEnabled).toBe(true);
  });

  it("adiciona um exercício ao dia sem perder os demais exercícios", () => {
    const state = initialWorkoutState();
    const date = toDateKey(startOfWeek());
    const exerciseId = state.exercises[9].id;
    const next = workoutReducer(state, { type: "toggle-plan-exercise", date, exerciseId });
    expect(next.plans.find((plan) => plan.date === date)?.exerciseIds).toContain(exerciseId);
  });

  it("calcula progresso por séries depois de iniciar e concluir uma série", () => {
    const state = initialWorkoutState();
    const date = state.plans.find((plan) => plan.exerciseIds.length > 0)!.date;
    const exerciseId = state.plans.find((plan) => plan.date === date)!.exerciseIds[0];
    const started = workoutReducer(state, { type: "start-workout", date });
    const next = workoutReducer(started, { type: "toggle-set", date, exerciseId, setIndex: 0 });
    expect(getCompletionPercent(next, date)).toBeGreaterThan(0);
    expect(getCompletionPercent(next, date)).toBeLessThan(100);
  });

  it("marca o treino como concluído e registra todas as séries planejadas", () => {
    const state = initialWorkoutState();
    const date = state.plans.find((plan) => plan.exerciseIds.length > 0)!.date;
    const completed = workoutReducer(state, { type: "set-workout-status", date, status: "completed" });
    const session = completed.sessions.find((item) => item.date === date);
    expect(session?.status).toBe("completed");
    expect(getCompletionPercent(completed, date)).toBe(100);
  });
});
