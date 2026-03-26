import { startTransition, useCallback, useState, type Dispatch, type SetStateAction } from "react";
import type {
  NutritionDaySummary,
  NutritionFoodEntry,
  NutritionFoodLookupResult,
  NutritionGoal,
  NutritionHistoryPoint,
  NutritionMealEntry,
} from "../../../types";
import type { NutritionFoodInput, NutritionGoalsInput, MealType } from "../domain/types";
import { nutritionRepository } from "../repositories/nutritionRepository";

interface UseNutritionState {
  summary: NutritionDaySummary | null;
  history: NutritionHistoryPoint[];
  dailyInsight: string;
  weeklyInsight: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
  currentDay: string;
  setCurrentDay: Dispatch<SetStateAction<string>>;
}

interface UseNutritionActions {
  refreshDay: (day: string, language: string) => Promise<void>;
  refreshHistory: (days: number) => Promise<void>;
  refresh: (day: string, language: string, days?: number) => Promise<void>;
  createMeal: (mealType: MealType, date: string, language: string) => Promise<NutritionMealEntry>;
  deleteMeal: (mealId: number, language: string) => Promise<void>;
  addFood: (mealId: number, foodData: NutritionFoodInput, language: string) => Promise<NutritionFoodEntry>;
  deleteFood: (foodId: number, language: string) => Promise<void>;
  updateFood: (foodId: number, foodData: Partial<NutritionFoodInput>, language: string) => Promise<NutritionFoodEntry>;
  updateGoals: (goals: NutritionGoalsInput, language: string) => Promise<NutritionGoal>;
  lookupBarcode: (barcode: string) => Promise<NutritionFoodLookupResult>;
}

export function useNutrition(initialDay?: string): UseNutritionState & UseNutritionActions {
  const [summary, setSummary] = useState<NutritionDaySummary | null>(null);
  const [history, setHistory] = useState<NutritionHistoryPoint[]>([]);
  const [dailyInsight, setDailyInsight] = useState("");
  const [weeklyInsight, setWeeklyInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState(initialDay || new Date().toISOString().slice(0, 10));

  const refreshHistory = useCallback(async (days: number = 7) => {
    const dayHistory = await nutritionRepository.getNutritionHistory(days);
    startTransition(() => setHistory(dayHistory));
  }, []);

  const refreshDay = useCallback(async (day: string, language: string) => {
    const [daySummary, daily, weekly] = await Promise.all([
      nutritionRepository.getNutritionDay(day),
      nutritionRepository.getDailyNutritionInsight(day, language),
      nutritionRepository.getWeeklyNutritionInsight(7, language),
    ]);

    startTransition(() => {
      setSummary(daySummary);
      setDailyInsight(daily.summary);
      setWeeklyInsight(weekly.summary);
    });
  }, []);

  const refresh = useCallback(
    async (day: string, language: string, days: number = 7) => {
      setLoading(true);
      setError(null);
      setCurrentDay(day);

      try {
        const [daySummary, dayHistory, daily, weekly] = await Promise.all([
          nutritionRepository.getNutritionDay(day),
          nutritionRepository.getNutritionHistory(days),
          nutritionRepository.getDailyNutritionInsight(day, language),
          nutritionRepository.getWeeklyNutritionInsight(days, language),
        ]);

        startTransition(() => {
          setSummary(daySummary);
          setHistory(dayHistory);
          setDailyInsight(daily.summary);
          setWeeklyInsight(weekly.summary);
        });
      } catch (refreshError) {
        const message = refreshError instanceof Error ? refreshError.message : "Failed to load nutrition data";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const runMutation = useCallback(
    async <T,>(operation: () => Promise<T>, language: string) => {
      setSaving(true);
      setError(null);
      try {
        const result = await operation();
        await refresh(currentDay, language);
        return result;
      } catch (mutationError) {
        const message = mutationError instanceof Error ? mutationError.message : "Nutrition action failed";
        setError(message);
        throw mutationError;
      } finally {
        setSaving(false);
      }
    },
    [currentDay, refresh],
  );

  const createMeal = useCallback(
    (mealType: MealType, date: string, language: string) =>
      runMutation(() => nutritionRepository.createMealEntry({ meal_type: mealType, entry_date: date, title: mealType }), language),
    [runMutation],
  );

  const deleteMeal = useCallback(
    (mealId: number, language: string) => runMutation(() => nutritionRepository.deleteMealEntry(mealId), language),
    [runMutation],
  );

  const addFood = useCallback(
    (mealId: number, foodData: NutritionFoodInput, language: string) =>
      runMutation(() => nutritionRepository.addMealFood(mealId, foodData), language),
    [runMutation],
  );

  const deleteFood = useCallback(
    (foodId: number, language: string) => runMutation(() => nutritionRepository.deleteMealFood(foodId), language),
    [runMutation],
  );

  const updateFood = useCallback(
    (foodId: number, foodData: Partial<NutritionFoodInput>, language: string) =>
      runMutation(() => nutritionRepository.updateMealFood(foodId, foodData), language),
    [runMutation],
  );

  const updateGoals = useCallback(
    (goals: NutritionGoalsInput, language: string) =>
      runMutation(() => nutritionRepository.updateNutritionGoals(goals), language),
    [runMutation],
  );

  const lookupBarcode = useCallback((barcode: string) => nutritionRepository.lookupFoodBarcode(barcode), []);

  return {
    summary,
    history,
    dailyInsight,
    weeklyInsight,
    loading,
    saving,
    error,
    currentDay,
    setCurrentDay,
    refreshDay,
    refreshHistory,
    refresh,
    createMeal,
    deleteMeal,
    addFood,
    deleteFood,
    updateFood,
    updateGoals,
    lookupBarcode,
  };
}
