import { useEffect, useState } from "react";
import { Save } from "lucide-react";
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

  useEffect(() => {
    setForm({
      calorie_target: goal.calorie_target,
      protein_target: goal.protein_target,
      carbs_target: goal.carbs_target,
      fat_target: goal.fat_target,
    });
  }, [goal]);

  return (
    <div className="glass-panel rounded-[2rem] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text">{labels.goalTitle}</h3>
          <p className="text-sm text-text-secondary">{labels.goalSubtitle}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.calories}</span>
          <input
            className="input"
            type="number"
            value={form.calorie_target}
            onChange={(event) => setForm((prev) => ({ ...prev, calorie_target: Number(event.target.value) }))}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.protein}</span>
          <input
            className="input"
            type="number"
            value={form.protein_target}
            onChange={(event) => setForm((prev) => ({ ...prev, protein_target: Number(event.target.value) }))}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.carbs}</span>
          <input
            className="input"
            type="number"
            value={form.carbs_target}
            onChange={(event) => setForm((prev) => ({ ...prev, carbs_target: Number(event.target.value) }))}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.fat}</span>
          <input
            className="input"
            type="number"
            value={form.fat_target}
            onChange={(event) => setForm((prev) => ({ ...prev, fat_target: Number(event.target.value) }))}
          />
        </label>
      </div>

      <button
        type="button"
        className="btn-primary mt-4 justify-center"
        disabled={saving}
        onClick={() => onSave(form)}
      >
        <Save className="h-4 w-4" />
        {saving ? labels.saving : labels.save}
      </button>
    </div>
  );
}
