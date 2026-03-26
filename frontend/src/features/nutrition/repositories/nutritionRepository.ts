import type { NutritionRepository } from "../domain/types";
import { LocalNutritionRepository } from "./localNutritionRepository";
import { RemoteNutritionRepository } from "./remoteNutritionRepository";

const remoteRepository = new RemoteNutritionRepository();
const localRepository = new LocalNutritionRepository();

async function withFallback<T>(primary: () => Promise<T>, fallback: () => Promise<T>) {
  try {
    return await primary();
  } catch {
    return fallback();
  }
}

export const nutritionRepository: NutritionRepository = {
  getNutritionDay: (day) =>
    withFallback(() => remoteRepository.getNutritionDay(day), () => localRepository.getNutritionDay(day)),
  getNutritionHistory: (days) =>
    withFallback(() => remoteRepository.getNutritionHistory(days), () => localRepository.getNutritionHistory(days)),
  updateNutritionGoals: (payload) =>
    withFallback(() => remoteRepository.updateNutritionGoals(payload), () => localRepository.updateNutritionGoals(payload)),
  createMealEntry: (payload) =>
    withFallback(() => remoteRepository.createMealEntry(payload), () => localRepository.createMealEntry(payload)),
  deleteMealEntry: (mealId) =>
    withFallback(() => remoteRepository.deleteMealEntry(mealId), () => localRepository.deleteMealEntry(mealId)),
  addMealFood: (mealId, payload) =>
    withFallback(() => remoteRepository.addMealFood(mealId, payload), () => localRepository.addMealFood(mealId, payload)),
  updateMealFood: (foodId, payload) =>
    withFallback(() => remoteRepository.updateMealFood(foodId, payload), () => localRepository.updateMealFood(foodId, payload)),
  deleteMealFood: (foodId) =>
    withFallback(() => remoteRepository.deleteMealFood(foodId), () => localRepository.deleteMealFood(foodId)),
  lookupFoodBarcode: (barcode) =>
    withFallback(() => remoteRepository.lookupFoodBarcode(barcode), () => localRepository.lookupFoodBarcode(barcode)),
  getDailyNutritionInsight: (day, lang) =>
    withFallback(
      () => remoteRepository.getDailyNutritionInsight(day, lang),
      () => localRepository.getDailyNutritionInsight(day, lang),
    ),
  getWeeklyNutritionInsight: (days, lang) =>
    withFallback(
      () => remoteRepository.getWeeklyNutritionInsight(days, lang),
      () => localRepository.getWeeklyNutritionInsight(days, lang),
    ),
};
