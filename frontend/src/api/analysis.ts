/**
 * API functions for progress and AI analysis.
 */

import type { AnalysisResponse, ProgressData } from "../types";
import apiClient from "./client";

export const getProgress = (exerciseId: number): Promise<ProgressData> =>
    apiClient.get(`/progress/${exerciseId}`).then((r) => r.data);

export const analyzeWorkout = (workoutId: number, lang: string = "es"): Promise<AnalysisResponse> =>
    apiClient.get(`/analysis/${workoutId}?lang=${lang}`).then((r) => r.data);
