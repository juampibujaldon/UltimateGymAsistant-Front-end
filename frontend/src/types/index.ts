/**
 * TypeScript type definitions for the Gym AI Coach app.
 */

export interface User {
    id: number;
    email: string;
    full_name: string | null;
    weight?: number | null;
    height?: number | null;
    goal?: string | null;
    is_active: boolean;
    created_at: string;
}

export interface Token {
    access_token: string;
    token_type: string;
}

export interface Exercise {
    id: number;
    name: string;
    muscle_group: string | null;
    is_custom: boolean;
    created_at: string;
}

export interface Set {
    id: number;
    workout_exercise_id: number;
    set_number: number;
    weight: number;
    reps: number;
    rir: number | null;
    notes: string | null;
    created_at: string;
}

export interface WorkoutExercise {
    id: number;
    workout_id: number;
    exercise_id: number;
    order: number;
    exercise: Exercise;
    sets: Set[];
}

export interface Workout {
    id: number;
    name: string | null;
    date: string;
    notes: string | null;
    is_finished: boolean;
    created_at: string;
    workout_exercises: WorkoutExercise[];
    user_id: number;
}

export interface WorkoutSummary {
    id: number;
    name: string | null;
    date: string;
    notes: string | null;
    is_finished: boolean;
    exercise_count: number;
    set_count: number;
}

export interface ProgressData {
    exercise_id: number;
    exercise_name: string;
    one_rm_history: { date: string; estimated_1rm: number; weight: number; reps: number }[];
    volume_history: { date: string; volume: number }[];
    personal_record: { weight: number; reps: number; estimated_1rm: number; date: string } | null;
}

export interface AnalysisResponse {
    workout_id: number;
    analysis: string;
}

export interface NutritionGoal {
    id: number;
    user_id: number;
    calorie_target: number;
    protein_target: number;
    carbs_target: number;
    fat_target: number;
    created_at: string;
    updated_at: string;
}

export interface NutritionMacroTotals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
}

export interface NutritionFoodEntry {
    id: number;
    meal_entry_id: number;
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
    source: string | null;
    created_at: string;
    updated_at: string;
}

export interface NutritionMealEntry {
    id: number;
    user_id: number;
    meal_type: string;
    entry_date: string;
    title: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    foods: NutritionFoodEntry[];
}

export interface NutritionDaySummary {
    date: string;
    goals: NutritionGoal;
    totals: NutritionMacroTotals;
    remaining: NutritionMacroTotals;
    meals: NutritionMealEntry[];
}

export interface NutritionHistoryPoint {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface NutritionFoodLookupResult {
    barcode: string;
    name: string;
    brand: string | null;
    image_url: string | null;
    default_grams: number;
    calories_per_100g: number;
    protein_per_100g: number;
    carbs_per_100g: number;
    fat_per_100g: number;
    fiber_per_100g: number | null;
    sugar_per_100g: number | null;
    source: string;
}

export interface NutritionInsightResponse {
    period: string;
    summary: string;
}
