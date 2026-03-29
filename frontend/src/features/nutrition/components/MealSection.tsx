import { useMemo, useState } from "react";
import { Plus, ScanBarcode, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { NutritionMealEntry } from "../../../types";
import { sumMealFoods } from "../domain/calculations";
import type { MealType } from "../domain/types";
import FoodEntryCard from "./FoodEntryCard";

export default function MealSection({
  title,
  mealType,
  meal,
  labels,
  saving,
  onCreateMeal,
  onDeleteMeal,
  onDeleteFood,
  onUpdateFood,
  onAddManualFood,
  onScanFood,
}: {
  title: string;
  mealType: MealType;
  meal?: NutritionMealEntry;
  labels: Record<string, string>;
  saving?: boolean;
  onCreateMeal: (mealType: MealType) => Promise<NutritionMealEntry>;
  onDeleteMeal: (mealId: number) => Promise<void>;
  onDeleteFood: (foodId: number) => Promise<void>;
  onUpdateFood: (foodId: number, payload: { grams: number; calories: number; protein: number; carbs: number; fat: number }) => Promise<void>;
  onAddManualFood: (mealId: number, payload: { name: string; grams: number; calories: number; protein: number; carbs: number; fat: number }) => Promise<void>;
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
  const [isExpanded, setIsExpanded] = useState(false);

  const totals = useMemo(() => sumMealFoods(meal?.foods ?? []), [meal?.foods]);

  const ensureMeal = async () => {
    if (meal) return meal;
    return onCreateMeal(mealType);
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    const targetMeal = await ensureMeal();
    await onAddManualFood(targetMeal.id, { ...form, name: form.name.trim() });
    setForm({ name: "", grams: 100, calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  return (
    <section className="glass-panel rounded-[2rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 cursor-pointer select-none" onClick={() => setIsExpanded((p) => !p)}>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.22em] text-text-muted">{labels.mealLabel}</p>
            {isExpanded ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
          </div>
          <h3 className="mt-1 text-xl font-semibold text-text">{title}</h3>
          <p className="mt-2 text-sm text-text-secondary">
            {totals.calories.toFixed(0)} kcal · {totals.protein.toFixed(0)}p · {totals.carbs.toFixed(0)}c · {totals.fat.toFixed(0)}f
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center relative z-10">
          <button type="button" className="btn-secondary px-3" onClick={async () => onScanFood(await ensureMeal())} disabled={saving}>
            <ScanBarcode className="h-4 w-4" />
            <span className="hidden sm:inline">{labels.scanShort}</span>
          </button>
          {meal && (
            <button type="button" className="btn-danger px-3 py-3" onClick={() => onDeleteMeal(meal.id)} disabled={saving}>
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="mt-5 space-y-3">
            {(meal?.foods ?? []).length === 0 && (
              <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-text-secondary">
                {labels.emptyMeal}
              </div>
            )}
            {(meal?.foods ?? []).map((food) => (
              <FoodEntryCard
                key={food.id}
                food={food}
                labels={labels}
                onDelete={async (foodId) => onDeleteFood(foodId)}
                onUpdate={async (foodId, payload) =>
                  onUpdateFood(foodId, {
                    grams: payload.grams ?? food.grams,
                    calories: payload.calories ?? food.calories,
                    protein: payload.protein ?? food.protein,
                    carbs: payload.carbs ?? food.carbs,
                    fat: payload.fat ?? food.fat,
                  })
                }
              />
            ))}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/8 bg-slate-950/25 p-4">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-text">{labels.addFood}</h4>
              <p className="text-xs text-text-secondary">{labels.manualHint}</p>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <input className="input md:col-span-2" placeholder={labels.foodName} value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
              <input className="input" type="number" placeholder="g" value={form.grams} onChange={(event) => setForm((prev) => ({ ...prev, grams: Number(event.target.value) }))} />
              <input className="input" type="number" placeholder="kcal" value={form.calories} onChange={(event) => setForm((prev) => ({ ...prev, calories: Number(event.target.value) }))} />
              <input className="input" type="number" placeholder="P" value={form.protein} onChange={(event) => setForm((prev) => ({ ...prev, protein: Number(event.target.value) }))} />
              <input className="input" type="number" placeholder="C" value={form.carbs} onChange={(event) => setForm((prev) => ({ ...prev, carbs: Number(event.target.value) }))} />
              <input className="input md:col-span-2" type="number" placeholder="F" value={form.fat} onChange={(event) => setForm((prev) => ({ ...prev, fat: Number(event.target.value) }))} />
            </div>
            <button type="button" className="btn-primary mt-3 w-full justify-center" disabled={saving} onClick={handleAdd}>
              <Plus className="h-4 w-4" />
              {labels.addFood}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
