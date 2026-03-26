import { Beef, Droplets, Flame, Wheat } from "lucide-react";

const ICONS = {
  calories: Flame,
  protein: Beef,
  carbs: Wheat,
  fat: Droplets,
} as const;

export default function MacroProgress({
  title,
  consumed,
  target,
  unit,
  accentClass,
  iconKey,
}: {
  title: string;
  consumed: number;
  target: number;
  unit: string;
  accentClass: string;
  iconKey: keyof typeof ICONS;
}) {
  const Icon = ICONS[iconKey];
  const percentage = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const remaining = Math.max(0, target - consumed);
  const isOver = consumed > target;

  return (
    <article className="glass-panel rounded-[1.75rem] p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-2xl p-3 ${accentClass}/15`}>
            <Icon className={`h-5 w-5 ${accentClass.replace("bg-", "text-")}`} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-text-muted">{title}</p>
            <p className="mt-1 text-2xl font-bold text-text">
              {consumed.toFixed(0)}
              <span className="ml-1 text-sm font-medium text-text-muted">{unit}</span>
            </p>
          </div>
        </div>
        <div className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isOver ? "bg-red-500/15 text-red-300" : "bg-emerald-500/15 text-emerald-300"}`}>
          {isOver ? "Over" : `${Math.round(percentage)}%`}
        </div>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-white/6">
        <div className={`h-full rounded-full ${isOver ? "bg-red-500" : accentClass}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[1.15rem] border border-white/6 bg-white/4 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Target</p>
          <p className="mt-1 text-base font-semibold text-text">{target.toFixed(0)} {unit}</p>
        </div>
        <div className="rounded-[1.15rem] border border-white/6 bg-white/4 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Remaining</p>
          <p className="mt-1 text-base font-semibold text-text">{remaining.toFixed(0)} {unit}</p>
        </div>
      </div>
    </article>
  );
}
