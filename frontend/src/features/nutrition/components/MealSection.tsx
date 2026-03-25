import { useMemo, useState } from "react";
import { Plus, ScanBarcode, Trash2 } from "lucide-react";
import type { NutritionFoodEntry, NutritionMealEntry } from "../../../types";

function sumFoods(foods: NutritionFoodEntry[]) {
  return foods.reduce(
    (acc, food) => {
      acc.calories += food.calories;
      acc.protein += food.protein;
      acc.carbs += food.carbs;
      acc.fat += food.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export default function MealSection({
  title,
  mealType,
  meal,
  labels,
  onCreateMeal,
  onDeleteMeal,
  onDeleteFood,
  onAddManualFood,
  onScanFood,
}: {
  title: string;
  mealType: string;
  meal?: NutritionMealEntry;
  labels: Record<string, string>;
  onCreateMeal: (mealType: string) => Promise<NutritionMealEntry>;
  onDeleteMeal: (mealId: number) => Promise<void>;
  onDeleteFood: (foodId: number) => Promise<void>;
  onAddManualFood: (mealId: number, payload: {
    name: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => Promise<void>;
  onScanFood: (meal: NutritionMealEntry) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    grams: 100,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const totals = useMemo(() => sumFoods(meal?.foods ?? []), [meal?.foods]);

  const ensureMeal = async () => {
    if (meal) return meal;
    return onCreateMeal(mealType);
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const targetMeal = await ensureMeal();
      await onAddManualFood(targetMeal.id, {
        name: form.name.trim(),
        grams: Number(form.grams),
        calories: Number(form.calories),
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fat: Number(form.fat),
      });
      setForm({ name: "", grams: 100, calories: 0, protein: 0, carbs: 0, fat: 0 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-[2rem] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-text">{title}</h3>
          <p className="text-sm text-text-secondary">
            {totals.calories.toFixed(0)} kcal · {totals.protein.toFixed(0)}p · {totals.carbs.toFixed(0)}c · {totals.fat.toFixed(0)}f
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={async () => onScanFood(await ensureMeal())}>
            <ScanBarcode className="h-4 w-4" />
          </button>
          {meal && (
            <button type="button" className="btn-danger px-3 py-2" onClick={() => onDeleteMeal(meal.id)}>
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {(meal?.foods ?? []).map((food) => (
          <div key={food.id} className="flex items-center justify-between rounded-2xl border border-surface-border bg-surface-hover px-4 py-3">
            <div>
              <p className="font-medium text-text">{food.name}</p>
              <p className="text-xs text-text-secondary">
                {food.grams.toFixed(0)}g · {food.calories.toFixed(0)} kcal · {food.protein.toFixed(0)}p · {food.carbs.toFixed(0)}c · {food.fat.toFixed(0)}f
              </p>
            </div>
            <button type="button" className="text-red-400 hover:text-red-300" onClick={() => onDeleteFood(food.id)}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-6">
        <input className="input md:col-span-2" placeholder={labels.foodName} value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        <input className="input" type="number" placeholder="g" value={form.grams} onChange={(event) => setForm((prev) => ({ ...prev, grams: Number(event.target.value) }))} />
        <input className="input" type="number" placeholder="kcal" value={form.calories} onChange={(event) => setForm((prev) => ({ ...prev, calories: Number(event.target.value) }))} />
        <input className="input" type="number" placeholder="P" value={form.protein} onChange={(event) => setForm((prev) => ({ ...prev, protein: Number(event.target.value) }))} />
        <input className="input" type="number" placeholder="C" value={form.carbs} onChange={(event) => setForm((prev) => ({ ...prev, carbs: Number(event.target.value) }))} />
      </div>
      <div className="mt-2 grid gap-2 md:grid-cols-[1fr_auto]">
        <input className="input" type="number" placeholder="F" value={form.fat} onChange={(event) => setForm((prev) => ({ ...prev, fat: Number(event.target.value) }))} />
        <button type="button" className="btn-primary justify-center" disabled={submitting} onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          {labels.addFood}
        </button>
      </div>
    </div>
  );
}
