import { useState } from "react";
import { BrainCircuit, Sparkles, Target } from "lucide-react";
import type { NutritionProfileInput, NutritionRecommendation } from "../domain/types";

interface NutritionSetupCardProps {
  initialProfile: NutritionProfileInput;
  recommendation: NutritionRecommendation | null;
  loading: boolean;
  labels: Record<string, string>;
  onGenerate: (profile: NutritionProfileInput) => Promise<void>;
  onApplyRecommendation: () => Promise<void>;
}

export default function NutritionSetupCard({
  initialProfile,
  recommendation,
  loading,
  labels,
  onGenerate,
  onApplyRecommendation,
}: NutritionSetupCardProps) {
  const [profile, setProfile] = useState<NutritionProfileInput>(initialProfile);

  return (
    <section className="glass-panel rounded-[2rem] p-5 md:p-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-brand-500/15 p-3">
              <Target className="h-5 w-5 text-brand-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-text-muted">{labels.setupEyebrow}</p>
              <h2 className="text-xl font-semibold text-text">{labels.setupTitle}</h2>
            </div>
          </div>
          <p className="mb-5 max-w-2xl text-sm leading-7 text-text-secondary">{labels.setupSubtitle}</p>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.age}</span>
              <input className="input" type="number" value={profile.age} onChange={(event) => setProfile((prev) => ({ ...prev, age: Number(event.target.value) }))} />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.sex}</span>
              <select className="input" value={profile.sex} onChange={(event) => setProfile((prev) => ({ ...prev, sex: event.target.value as NutritionProfileInput["sex"] }))}>
                <option value="male">{labels.male}</option>
                <option value="female">{labels.female}</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.weight}</span>
              <input className="input" type="number" value={profile.weightKg} onChange={(event) => setProfile((prev) => ({ ...prev, weightKg: Number(event.target.value) }))} />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.height}</span>
              <input className="input" type="number" value={profile.heightCm} onChange={(event) => setProfile((prev) => ({ ...prev, heightCm: Number(event.target.value) }))} />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.activity}</span>
              <select className="input" value={profile.activityLevel} onChange={(event) => setProfile((prev) => ({ ...prev, activityLevel: event.target.value as NutritionProfileInput["activityLevel"] }))}>
                <option value="low">{labels.lowActivity}</option>
                <option value="moderate">{labels.moderateActivity}</option>
                <option value="high">{labels.highActivity}</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.goalDirection}</span>
              <select className="input" value={profile.goalDirection} onChange={(event) => setProfile((prev) => ({ ...prev, goalDirection: event.target.value as NutritionProfileInput["goalDirection"] }))}>
                <option value="lose">{labels.lose}</option>
                <option value="maintain">{labels.maintain}</option>
                <option value="gain">{labels.gain}</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.rate}</span>
              <select className="input" value={profile.weeklyRate} onChange={(event) => setProfile((prev) => ({ ...prev, weeklyRate: event.target.value as NutritionProfileInput["weeklyRate"] }))}>
                <option value="gentle">{labels.gentle}</option>
                <option value="standard">{labels.standard}</option>
                <option value="aggressive">{labels.aggressive}</option>
              </select>
            </label>
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{labels.objective}</span>
              <input className="input" value={profile.objective} onChange={(event) => setProfile((prev) => ({ ...prev, objective: event.target.value }))} placeholder={labels.objectivePlaceholder} />
            </label>
          </div>

          <button type="button" className="btn-primary mt-5 w-full justify-center" disabled={loading} onClick={() => onGenerate(profile)}>
            <BrainCircuit className="h-4 w-4" />
            {loading ? labels.generating : labels.generatePlan}
          </button>
        </div>

        <div className="rounded-[1.8rem] border border-white/8 bg-slate-950/30 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/15 p-3">
              <Sparkles className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-text-muted">{labels.aiCoach}</p>
              <h3 className="text-lg font-semibold text-text">{labels.recommendationTitle}</h3>
            </div>
          </div>

          {recommendation ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">{labels.maintenance}</p>
                  <p className="mt-1 text-2xl font-bold text-text">{recommendation.maintenanceCalories}</p>
                </div>
                <div className="rounded-[1.2rem] border border-white/8 bg-brand-500/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">{labels.targetCalories}</p>
                  <p className="mt-1 text-2xl font-bold text-text">{recommendation.calorieTarget}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-[1.1rem] bg-emerald-500/10 p-3 text-center">
                  <p className="text-lg font-semibold text-emerald-300">{recommendation.proteinTarget}g</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">P</p>
                </div>
                <div className="rounded-[1.1rem] bg-amber-500/10 p-3 text-center">
                  <p className="text-lg font-semibold text-amber-300">{recommendation.carbsTarget}g</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">C</p>
                </div>
                <div className="rounded-[1.1rem] bg-rose-500/10 p-3 text-center">
                  <p className="text-lg font-semibold text-rose-300">{recommendation.fatTarget}g</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">F</p>
                </div>
              </div>

              <div className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
                <p className="text-sm leading-7 text-text-secondary">{recommendation.reasoning}</p>
              </div>
              <div className="rounded-[1.2rem] border border-brand-500/20 bg-brand-500/8 p-4">
                <p className="text-sm leading-7 text-text-secondary">{recommendation.aiSummary}</p>
              </div>
              <button type="button" className="btn-secondary w-full justify-center" onClick={onApplyRecommendation}>
                {labels.applyPlan}
              </button>
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-sm leading-7 text-text-secondary">
              {labels.recommendationEmpty}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
