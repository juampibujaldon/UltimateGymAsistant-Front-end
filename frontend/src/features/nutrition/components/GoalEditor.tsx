import { useMemo, useState } from "react";
import { Save, Target } from "lucide-react";
import type { NutritionGoal } from "../../../types";

export default function GoalEditor({
  goal,
  onSave,
  saving,
  labels,
}: {
  goal: NutritionGoal;
  onSave: (payload: {
    calorie_target: number;
    protein_target: number;
    carbs_target: number;
    fat_target: number;
  }) => Promise<void>;
  saving: boolean;
  labels: Record<string, string>;
}) {
  const [form, setForm] = useState({
    calorie_target: goal.calorie_target,
    protein_target: goal.protein_target,
    carbs_target: goal.carbs_target,
    fat_target: goal.fat_target,
  });

  const macroCalories = useMemo(
    () => form.protein_target * 4 + form.carbs_target * 4 + form.fat_target * 9,
    [form.carbs_target, form.fat_target, form.protein_target],
  );

  return (
    <section className="glass-panel rounded-[2rem] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-brand-300" />
            <h3 className="text-lg font-semibold text-text">{labels.goalTitle}</h3>
          </div>
          <p className="mt-1 text-sm text-text-secondary">{labels.goalSubtitle}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Macros kcal</p>
          <p className="mt-1 text-base font-semibold text-text">{macroCalories.toFixed(0)}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.calories}</span>
          <input
            className="input"
            type="number"
            value={form.calorie_target}
            onChange={(event) => setForm((prev) => ({ ...prev, calorie_target: Number(event.target.value) }))}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.protein}</span>
          <input
            className="input"
            type="number"
            value={form.protein_target}
            onChange={(event) => setForm((prev) => ({ ...prev, protein_target: Number(event.target.value) }))}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.carbs}</span>
          <input
            className="input"
            type="number"
            value={form.carbs_target}
            onChange={(event) => setForm((prev) => ({ ...prev, carbs_target: Number(event.target.value) }))}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.fat}</span>
          <input
            className="input"
            type="number"
            value={form.fat_target}
            onChange={(event) => setForm((prev) => ({ ...prev, fat_target: Number(event.target.value) }))}
          />
        </label>
      </div>

      <button type="button" className="btn-primary mt-5 w-full justify-center" disabled={saving} onClick={() => onSave(form)}>
        <Save className="h-4 w-4" />
        {saving ? labels.saving : labels.save}
      </button>
    </section>
  );
}
