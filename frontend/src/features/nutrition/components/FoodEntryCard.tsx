import { useState } from "react";
import { PencilLine, Save, Trash2, X } from "lucide-react";
import type { NutritionFoodEntry } from "../../../types";

interface FoodEntryCardProps {
  food: NutritionFoodEntry;
  onUpdate?: (foodId: number, updates: Partial<NutritionFoodEntry>) => Promise<void>;
  onDelete?: (foodId: number) => Promise<void>;
  labels: Record<string, string>;
}

export default function FoodEntryCard({ food, onUpdate, onDelete, labels }: FoodEntryCardProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    grams: food.grams,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
  });

  const handleDelete = async () => {
    if (!onDelete) return;
    setLoading(true);
    try {
      await onDelete(food.id);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    setLoading(true);
    try {
      await onUpdate(food.id, form);
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-text">{food.name}</h4>
          <p className="mt-1 text-xs text-text-secondary">
            {food.brand || labels.manualEntry} · {food.grams.toFixed(0)} g
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onUpdate && (
            <button type="button" className="rounded-xl p-2 text-text-secondary transition hover:bg-white/8 hover:text-text" onClick={() => setEditing((value) => !value)}>
              {editing ? <X className="h-4 w-4" /> : <PencilLine className="h-4 w-4" />}
            </button>
          )}
          {onDelete && (
            <button type="button" className="rounded-xl p-2 text-red-300 transition hover:bg-red-500/10" onClick={handleDelete} disabled={loading}>
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <div className="rounded-2xl bg-brand-500/10 p-2 text-center">
          <p className="text-sm font-semibold text-brand-200">{food.calories.toFixed(0)}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">kcal</p>
        </div>
        <div className="rounded-2xl bg-emerald-500/10 p-2 text-center">
          <p className="text-sm font-semibold text-emerald-300">{food.protein.toFixed(1)}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">P</p>
        </div>
        <div className="rounded-2xl bg-amber-500/10 p-2 text-center">
          <p className="text-sm font-semibold text-amber-300">{food.carbs.toFixed(1)}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">C</p>
        </div>
        <div className="rounded-2xl bg-rose-500/10 p-2 text-center">
          <p className="text-sm font-semibold text-rose-300">{food.fat.toFixed(1)}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">F</p>
        </div>
      </div>

      {editing && (
        <div className="mt-4 space-y-3 rounded-[1.25rem] border border-white/8 bg-slate-950/25 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <input className="input" type="number" value={form.grams} onChange={(event) => setForm((prev) => ({ ...prev, grams: Number(event.target.value) }))} />
            <input className="input" type="number" value={form.calories} onChange={(event) => setForm((prev) => ({ ...prev, calories: Number(event.target.value) }))} />
            <input className="input" type="number" value={form.protein} onChange={(event) => setForm((prev) => ({ ...prev, protein: Number(event.target.value) }))} />
            <input className="input" type="number" value={form.carbs} onChange={(event) => setForm((prev) => ({ ...prev, carbs: Number(event.target.value) }))} />
            <input className="input sm:col-span-2" type="number" value={form.fat} onChange={(event) => setForm((prev) => ({ ...prev, fat: Number(event.target.value) }))} />
          </div>
          <button type="button" className="btn-primary w-full justify-center" onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4" />
            {labels.saveFood}
          </button>
        </div>
      )}
    </article>
  );
}
