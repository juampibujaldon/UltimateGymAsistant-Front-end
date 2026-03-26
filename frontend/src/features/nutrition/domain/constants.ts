import type { MealType } from "./types";

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export const DEFAULT_NUTRITION_GOALS = {
  calorie_target: 2200,
  protein_target: 160,
  carbs_target: 220,
  fat_target: 70,
};

export const NUTRITION_STORAGE_KEY = "gym_ai_nutrition_v1";
