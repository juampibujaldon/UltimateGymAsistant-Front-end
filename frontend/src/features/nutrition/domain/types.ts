import type {
  NutritionDaySummary,
  NutritionFoodEntry,
  NutritionFoodLookupResult,
  NutritionGoal,
  NutritionHistoryPoint,
  NutritionInsightResponse,
  NutritionMealEntry,
} from "../../../types";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface NutritionGoalsInput {
  calorie_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
}

export interface NutritionMealInput {
  meal_type: MealType;
  entry_date: string;
  title?: string;
  notes?: string;
}

export interface NutritionFoodInput {
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
}

export interface NutritionRepository {
  getNutritionDay(day: string): Promise<NutritionDaySummary>;
  getNutritionHistory(days?: number): Promise<NutritionHistoryPoint[]>;
  updateNutritionGoals(payload: NutritionGoalsInput): Promise<NutritionGoal>;
  createMealEntry(payload: NutritionMealInput): Promise<NutritionMealEntry>;
  deleteMealEntry(mealId: number): Promise<void>;
  addMealFood(mealId: number, payload: NutritionFoodInput): Promise<NutritionFoodEntry>;
  updateMealFood(foodId: number, payload: Partial<NutritionFoodInput>): Promise<NutritionFoodEntry>;
  deleteMealFood(foodId: number): Promise<void>;
  lookupFoodBarcode(barcode: string): Promise<NutritionFoodLookupResult>;
  getDailyNutritionInsight(day: string, lang: string): Promise<NutritionInsightResponse>;
  getWeeklyNutritionInsight(days: number, lang: string): Promise<NutritionInsightResponse>;
}

export interface NutritionProfileInput {
  age: number;
  sex: "male" | "female";
  weightKg: number;
  heightCm: number;
  activityLevel: "low" | "moderate" | "high";
  goalDirection: "lose" | "maintain" | "gain";
  weeklyRate: "gentle" | "standard" | "aggressive";
  objective: string;
}

export interface NutritionRecommendation {
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  maintenanceCalories: number;
  reasoning: string;
  aiSummary: string;
}
