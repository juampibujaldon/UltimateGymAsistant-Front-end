import type { NutritionRepository } from "../domain/types";
import {
  addMealFood,
  createMealEntry,
  deleteMealEntry,
  deleteMealFood,
  getDailyNutritionInsight,
  getNutritionDay,
  getNutritionHistory,
  getWeeklyNutritionInsight,
  lookupFoodBarcode,
  updateMealFood,
  updateNutritionGoals,
} from "../api";

export class RemoteNutritionRepository implements NutritionRepository {
  getNutritionDay = getNutritionDay;
  getNutritionHistory = getNutritionHistory;
  updateNutritionGoals = updateNutritionGoals;
  createMealEntry = createMealEntry;
  deleteMealEntry = deleteMealEntry;
  addMealFood = addMealFood;
  updateMealFood = updateMealFood;
  deleteMealFood = deleteMealFood;
  lookupFoodBarcode = lookupFoodBarcode;
  getDailyNutritionInsight = getDailyNutritionInsight;
  getWeeklyNutritionInsight = getWeeklyNutritionInsight;
}
