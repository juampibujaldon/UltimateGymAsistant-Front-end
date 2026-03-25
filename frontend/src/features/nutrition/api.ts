import apiClient from "../../api/client";
import type {
  NutritionDaySummary,
  NutritionFoodEntry,
  NutritionFoodLookupResult,
  NutritionGoal,
  NutritionHistoryPoint,
  NutritionInsightResponse,
  NutritionMealEntry,
} from "../../types";

export const getNutritionGoals = (): Promise<NutritionGoal> =>
  apiClient.get("/nutrition/goals").then((response) => response.data);

export const updateNutritionGoals = (payload: {
  calorie_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
}): Promise<NutritionGoal> =>
  apiClient.put("/nutrition/goals", payload).then((response) => response.data);

export const getNutritionDay = (day: string): Promise<NutritionDaySummary> =>
  apiClient.get("/nutrition/day", { params: { day } }).then((response) => response.data);

export const getNutritionHistory = (days = 7): Promise<NutritionHistoryPoint[]> =>
  apiClient.get("/nutrition/history", { params: { days } }).then((response) => response.data);

export const createMealEntry = (payload: {
  meal_type: string;
  entry_date: string;
  title?: string;
  notes?: string;
  foods?: Array<{
    name: string;
    brand?: string | null;
    barcode?: string | null;
    quantity?: number;
    unit?: string;
    grams?: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number | null;
    sugar?: number | null;
    source?: string;
  }>;
}): Promise<NutritionMealEntry> =>
  apiClient.post("/nutrition/meals", payload).then((response) => response.data);

export const updateMealEntry = (
  mealId: number,
  payload: Partial<{ meal_type: string; entry_date: string; title: string; notes: string }>,
): Promise<NutritionMealEntry> =>
  apiClient.patch(`/nutrition/meals/${mealId}`, payload).then((response) => response.data);

export const deleteMealEntry = (mealId: number): Promise<void> =>
  apiClient.delete(`/nutrition/meals/${mealId}`).then(() => undefined);

export const addMealFood = (
  mealId: number,
  payload: {
    name: string;
    brand?: string | null;
    barcode?: string | null;
    quantity?: number;
    unit?: string;
    grams?: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number | null;
    sugar?: number | null;
    source?: string;
  },
): Promise<NutritionFoodEntry> =>
  apiClient.post(`/nutrition/meals/${mealId}/foods`, payload).then((response) => response.data);

export const updateMealFood = (
  foodId: number,
  payload: Partial<{
    name: string;
    brand: string | null;
    barcode: string | null;
    quantity: number;
    unit: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number | null;
    sugar: number | null;
    source: string;
  }>,
): Promise<NutritionFoodEntry> =>
  apiClient.patch(`/nutrition/foods/${foodId}`, payload).then((response) => response.data);

export const deleteMealFood = (foodId: number): Promise<void> =>
  apiClient.delete(`/nutrition/foods/${foodId}`).then(() => undefined);

export const lookupFoodBarcode = (barcode: string): Promise<NutritionFoodLookupResult> =>
  apiClient.get(`/nutrition/barcode/${barcode}`).then((response) => response.data);

export const getDailyNutritionInsight = (day: string, lang: string): Promise<NutritionInsightResponse> =>
  apiClient.get("/nutrition/insights/daily", { params: { day, lang } }).then((response) => response.data);

export const getWeeklyNutritionInsight = (days: number, lang: string): Promise<NutritionInsightResponse> =>
  apiClient.get("/nutrition/insights/weekly", { params: { days, lang } }).then((response) => response.data);
