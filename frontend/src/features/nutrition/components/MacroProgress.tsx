export default function MacroProgress({
  title,
  consumed,
  target,
  unit,
  accentClass,
}: {
  title: string;
  consumed: number;
  target: number;
  unit: string;
  accentClass: string;
}) {
  const percentage = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;

  return (
    <div className="glass-panel rounded-[1.5rem] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text">{title}</p>
          <p className="text-xs text-text-secondary">
            {consumed.toFixed(0)} / {target.toFixed(0)} {unit}
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{percentage.toFixed(0)}%</p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-surface-hover">
        <div className={`h-2 rounded-full ${accentClass}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
