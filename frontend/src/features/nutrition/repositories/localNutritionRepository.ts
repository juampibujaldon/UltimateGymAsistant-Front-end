import type {
  NutritionFoodEntry,
  NutritionGoal,
  NutritionMealEntry,
} from "../../../types";
import { DEFAULT_NUTRITION_GOALS, NUTRITION_STORAGE_KEY } from "../domain/constants";
import { buildDailyInsight, buildDaySummary, buildHistory, buildWeeklyInsight } from "../domain/calculations";
import type { NutritionFoodInput, NutritionGoalsInput, NutritionMealInput, NutritionRepository } from "../domain/types";
import { lookupOpenFoodFactsBarcode } from "../infrastructure/openFoodFactsGateway";

interface NutritionStorageShape {
  mealsByUser: Record<string, NutritionMealEntry[]>;
  goalsByUser: Record<string, NutritionGoal>;
  nextMealId: number;
  nextFoodId: number;
}

function nowIso() {
  return new Date().toISOString();
}

function defaultGoal(userKey: string): NutritionGoal {
  const now = nowIso();
  return {
    id: 1,
    user_id: Number(userKey) || 0,
    created_at: now,
    updated_at: now,
    ...DEFAULT_NUTRITION_GOALS,
  };
}

function readStorage(): NutritionStorageShape {
  try {
    const raw = localStorage.getItem(NUTRITION_STORAGE_KEY);
    if (!raw) {
      return { mealsByUser: {}, goalsByUser: {}, nextMealId: 1, nextFoodId: 1 };
    }
    return JSON.parse(raw) as NutritionStorageShape;
  } catch {
    return { mealsByUser: {}, goalsByUser: {}, nextMealId: 1, nextFoodId: 1 };
  }
}

function writeStorage(storage: NutritionStorageShape) {
  localStorage.setItem(NUTRITION_STORAGE_KEY, JSON.stringify(storage));
}

function getUserKey() {
  try {
    const rawUser = localStorage.getItem("gym_ai_user");
    if (!rawUser) return "guest";
    const user = JSON.parse(rawUser) as { id?: number | string };
    return String(user.id ?? "guest");
  } catch {
    return "guest";
  }
}

function getMeals(storage: NutritionStorageShape, userKey: string) {
  return storage.mealsByUser[userKey] ?? [];
}

function getGoals(storage: NutritionStorageShape, userKey: string) {
  return storage.goalsByUser[userKey] ?? defaultGoal(userKey);
}

export class LocalNutritionRepository implements NutritionRepository {
  async getNutritionDay(day: string) {
    const storage = readStorage();
    const userKey = getUserKey();
    return buildDaySummary(day, getGoals(storage, userKey), getMeals(storage, userKey));
  }

  async getNutritionHistory(days = 7) {
    const storage = readStorage();
    const userKey = getUserKey();
    const endDay = new Date().toISOString().slice(0, 10);
    return buildHistory(days, getGoals(storage, userKey), getMeals(storage, userKey), endDay);
  }

  async updateNutritionGoals(payload: NutritionGoalsInput) {
    const storage = readStorage();
    const userKey = getUserKey();
    const previous = getGoals(storage, userKey);
    const nextGoal: NutritionGoal = {
      ...previous,
      ...payload,
      updated_at: nowIso(),
    };

    storage.goalsByUser[userKey] = nextGoal;
    writeStorage(storage);
    return nextGoal;
  }

  async createMealEntry(payload: NutritionMealInput) {
    const storage = readStorage();
    const userKey = getUserKey();
    const nextMeal: NutritionMealEntry = {
      id: storage.nextMealId,
      user_id: Number(userKey) || 0,
      meal_type: payload.meal_type,
      entry_date: payload.entry_date,
      title: payload.title ?? null,
      notes: payload.notes ?? null,
      foods: [],
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    storage.nextMealId += 1;
    storage.mealsByUser[userKey] = [...getMeals(storage, userKey), nextMeal];
    writeStorage(storage);
    return nextMeal;
  }

  async deleteMealEntry(mealId: number) {
    const storage = readStorage();
    const userKey = getUserKey();
    storage.mealsByUser[userKey] = getMeals(storage, userKey).filter((meal) => meal.id !== mealId);
    writeStorage(storage);
  }

  async addMealFood(mealId: number, payload: NutritionFoodInput) {
    const storage = readStorage();
    const userKey = getUserKey();
    const meals = getMeals(storage, userKey);
    const mealIndex = meals.findIndex((meal) => meal.id === mealId);

    if (mealIndex < 0) {
      throw new Error("Meal not found");
    }

    const nextFood: NutritionFoodEntry = {
      id: storage.nextFoodId,
      meal_entry_id: mealId,
      name: payload.name,
      brand: payload.brand ?? null,
      barcode: payload.barcode ?? null,
      quantity: payload.quantity ?? 1,
      unit: payload.unit ?? "g",
      grams: payload.grams ?? 100,
      calories: payload.calories ?? 0,
      protein: payload.protein ?? 0,
      carbs: payload.carbs ?? 0,
      fat: payload.fat ?? 0,
      fiber: payload.fiber ?? null,
      sugar: payload.sugar ?? null,
      source: payload.source ?? "manual",
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    storage.nextFoodId += 1;
    const nextMeals = [...meals];
    nextMeals[mealIndex] = {
      ...nextMeals[mealIndex],
      foods: [...nextMeals[mealIndex].foods, nextFood],
      updated_at: nowIso(),
    };
    storage.mealsByUser[userKey] = nextMeals;
    writeStorage(storage);
    return nextFood;
  }

  async updateMealFood(foodId: number, payload: Partial<NutritionFoodInput>) {
    const storage = readStorage();
    const userKey = getUserKey();
    const meals = getMeals(storage, userKey);
    let updatedFood: NutritionFoodEntry | null = null;

    storage.mealsByUser[userKey] = meals.map((meal) => {
      const nextFoods = meal.foods.map((food) => {
        if (food.id !== foodId) return food;
        updatedFood = {
          ...food,
          ...payload,
          brand: payload.brand ?? food.brand,
          barcode: payload.barcode ?? food.barcode,
          source: payload.source ?? food.source,
          updated_at: nowIso(),
        };
        return updatedFood;
      });
      return nextFoods === meal.foods ? meal : { ...meal, foods: nextFoods, updated_at: nowIso() };
    });

    writeStorage(storage);

    if (!updatedFood) {
      throw new Error("Food not found");
    }

    return updatedFood;
  }

  async deleteMealFood(foodId: number) {
    const storage = readStorage();
    const userKey = getUserKey();
    storage.mealsByUser[userKey] = getMeals(storage, userKey).map((meal) => ({
      ...meal,
      foods: meal.foods.filter((food) => food.id !== foodId),
      updated_at: nowIso(),
    }));
    writeStorage(storage);
  }

  async lookupFoodBarcode(barcode: string) {
    return lookupOpenFoodFactsBarcode(barcode);
  }

  async getDailyNutritionInsight(day: string, lang: string) {
    const summary = await this.getNutritionDay(day);
    return {
      period: day,
      summary: buildDailyInsight(summary, lang),
    };
  }

  async getWeeklyNutritionInsight(days: number, lang: string) {
    const history = await this.getNutritionHistory(days);
    return {
      period: `${days}d`,
      summary: buildWeeklyInsight(history, lang),
    };
  }
}
