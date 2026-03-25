/**
 * API functions for exercise operations.
 */

import type { Exercise } from "../types";
import apiClient from "./client";

export const getExercises = (): Promise<Exercise[]> =>
    apiClient.get("/exercises/").then((r) => r.data);

export const createExercise = (name: string, muscle_group?: string): Promise<Exercise> =>
    apiClient.post("/exercises/", { name, muscle_group, is_custom: true }).then((r) => r.data);

export const deleteExercise = (id: number): Promise<void> =>
    apiClient.delete(`/exercises/${id}`).then(() => undefined);
