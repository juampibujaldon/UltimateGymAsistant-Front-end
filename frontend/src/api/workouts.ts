/**
 * API functions for workout session operations.
 */

import type { Workout, WorkoutSummary } from "../types";
import apiClient from "./client";

export const listWorkouts = (): Promise<WorkoutSummary[]> =>
    apiClient.get("/workouts/").then((r) => r.data);

export const createWorkout = (name?: string, notes?: string): Promise<Workout> =>
    apiClient.post("/workouts/", { name: name || "", notes }).then((r) => r.data);

export const generateWorkout = (category?: string): Promise<Workout> =>
    apiClient.post("/workouts/generate", { category }).then((r) => r.data);

export const getWorkout = (id: number): Promise<Workout> =>
    apiClient.get(`/workouts/${id}`).then((r) => r.data);

export const updateWorkout = (
    id: number,
    data: { name?: string; notes?: string; is_finished?: boolean }
): Promise<Workout> =>
    apiClient.patch(`/workouts/${id}`, data).then((r) => r.data);

export const deleteWorkout = (id: number): Promise<void> =>
    apiClient.delete(`/workouts/${id}`).then(() => undefined);

export const addExerciseToWorkout = (
    workoutId: number,
    exerciseId: number,
    order: number
): Promise<Workout> =>
    apiClient
        .post(`/workouts/${workoutId}/exercises`, { exercise_id: exerciseId, order })
        .then((r) => r.data);

export const removeExerciseFromWorkout = (
    workoutId: number,
    workoutExerciseId: number
): Promise<Workout> =>
    apiClient
        .delete(`/workouts/${workoutId}/exercises/${workoutExerciseId}`)
        .then((r) => r.data);
