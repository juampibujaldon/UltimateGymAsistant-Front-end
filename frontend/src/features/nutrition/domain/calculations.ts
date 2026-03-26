import type {
  NutritionDaySummary,
  NutritionFoodEntry,
  NutritionGoal,
  NutritionHistoryPoint,
  NutritionMealEntry,
} from "../../../types";

export function sumMealFoods(foods: NutritionFoodEntry[]) {
  return foods.reduce(
    (acc, food) => {
      acc.calories += food.calories;
      acc.protein += food.protein;
      acc.carbs += food.carbs;
      acc.fat += food.fat;
      acc.fiber += food.fiber ?? 0;
      acc.sugar += food.sugar ?? 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
  );
}

export function buildDaySummary(day: string, goals: NutritionGoal, meals: NutritionMealEntry[]): NutritionDaySummary {
  const todaysMeals = meals
    .filter((meal) => meal.entry_date === day)
    .sort((left, right) => left.created_at.localeCompare(right.created_at));
  const totals = todaysMeals.reduce(
    (acc, meal) => {
      const mealTotals = sumMealFoods(meal.foods);
      acc.calories += mealTotals.calories;
      acc.protein += mealTotals.protein;
      acc.carbs += mealTotals.carbs;
      acc.fat += mealTotals.fat;
      acc.fiber += mealTotals.fiber;
      acc.sugar += mealTotals.sugar;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
  );

  return {
    date: day,
    goals,
    totals,
    remaining: {
      calories: Math.max(0, goals.calorie_target - totals.calories),
      protein: Math.max(0, goals.protein_target - totals.protein),
      carbs: Math.max(0, goals.carbs_target - totals.carbs),
      fat: Math.max(0, goals.fat_target - totals.fat),
      fiber: 0,
      sugar: 0,
    },
    meals: todaysMeals,
  };
}

export function buildHistory(days: number, goals: NutritionGoal, meals: NutritionMealEntry[], endDay: string) {
  const history: NutritionHistoryPoint[] = [];
  const end = new Date(`${endDay}T12:00:00`);

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const cursor = new Date(end);
    cursor.setDate(end.getDate() - offset);
    const date = cursor.toISOString().slice(0, 10);
    const summary = buildDaySummary(date, goals, meals);
    history.push({
      date,
      calories: summary.totals.calories,
      protein: summary.totals.protein,
      carbs: summary.totals.carbs,
      fat: summary.totals.fat,
    });
  }

  return history;
}

export function getMacroCompletionLabel(value: number, goal: number) {
  if (goal <= 0) return 0;
  return Math.round((value / goal) * 100);
}

export function buildDailyInsight(summary: NutritionDaySummary, language: string) {
  const proteinGap = Math.max(0, Math.round(summary.goals.protein_target - summary.totals.protein));
  const caloriesGap = Math.round(summary.goals.calorie_target - summary.totals.calories);
  const isSpanish = language === "es";

  if (proteinGap > 0) {
    return isSpanish
      ? `Te faltan ${proteinGap} g de proteína hoy. Suma una comida simple alta en proteína para cerrar el día con más precisión.`
      : `You are still ${proteinGap} g short on protein today. Add one simple high-protein food to close the day more accurately.`;
  }

  if (caloriesGap > 250) {
    return isSpanish
      ? `Aún tienes margen de ${caloriesGap} kcal. Un snack balanceado con carbohidratos y proteína puede ayudarte a acercarte al objetivo.`
      : `You still have ${caloriesGap} kcal available. A balanced snack with carbs and protein can help you land closer to target.`;
  }

  return isSpanish
    ? "Tu día está bastante alineado con el objetivo. Mantén la misma estructura de comidas para sostener consistencia."
    : "Your day is well aligned with the target. Keep the same meal structure to stay consistent.";
}

export function buildWeeklyInsight(history: NutritionHistoryPoint[], language: string) {
  const isSpanish = language === "es";
  const averageCalories =
    history.reduce((total, point) => total + point.calories, 0) / Math.max(1, history.length);
  const averageProtein =
    history.reduce((total, point) => total + point.protein, 0) / Math.max(1, history.length);

  return isSpanish
    ? `Promedio semanal: ${averageCalories.toFixed(0)} kcal y ${averageProtein.toFixed(0)} g de proteína por día. Revisa si tu desayuno y snack mantienen la misma calidad que almuerzo y cena.`
    : `Weekly average: ${averageCalories.toFixed(0)} kcal and ${averageProtein.toFixed(0)} g protein per day. Check whether breakfast and snacks match the quality of lunch and dinner.`;
}
