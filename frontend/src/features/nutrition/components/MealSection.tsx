import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, ScanBarcode, Trash2 } from "lucide-react";
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
  const [collapsed, setCollapsed] = useState(false);

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
      <div className="mb-4 flex items-start justify-between gap-3">
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
        >
          <p className="text-xs uppercase tracking-[0.22em] text-text-muted">{labels.mealLabel}</p>
          <div className="mt-1 flex items-center gap-2">
            <h3 className="min-w-0 text-xl font-semibold text-text">{title}</h3>
            {collapsed ? <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" /> : <ChevronUp className="h-4 w-4 shrink-0 text-text-muted" />}
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            {totals.calories.toFixed(0)} kcal · {totals.protein.toFixed(0)}p · {totals.carbs.toFixed(0)}c · {totals.fat.toFixed(0)}f
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className="btn-secondary px-3" onClick={async () => onScanFood(await ensureMeal())} disabled={saving}>
            <ScanBarcode className="h-4 w-4" />
            <span className="hidden sm:inline">{labels.scanShort}</span>
          </button>
          {meal && (
            <button type="button" className="btn-danger px-3 py-3" onClick={() => onDeleteMeal(meal.id)} disabled={saving}>
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary transition hover:bg-white/10 hover:text-text"
            onClick={() => setCollapsed((value) => !value)}
            aria-expanded={!collapsed}
          >
            <span className="hidden sm:inline">{collapsed ? labels.expandMeal : labels.collapseMeal}</span>
            <span className="sm:hidden">{collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}</span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="space-y-3">
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
        </>
      )}
    </section>
  );
}
