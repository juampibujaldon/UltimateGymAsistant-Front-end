/**
 * API functions for set operations.
 */

import type { Set } from "../types";
import apiClient from "./client";

export const addSet = (
    workoutExerciseId: number,
    data: { set_number: number; weight: number; reps: number; rir?: number; notes?: string }
): Promise<Set> =>
    apiClient
        .post(`/sets/?workout_exercise_id=${workoutExerciseId}`, data)
        .then((r) => r.data);

export const updateSet = (
    setId: number,
    data: { weight?: number; reps?: number; rir?: number; notes?: string }
): Promise<Set> =>
    apiClient.put(`/sets/${setId}`, data).then((r) => r.data);

export const deleteSet = (setId: number): Promise<void> =>
    apiClient.delete(`/sets/${setId}`).then(() => undefined);
