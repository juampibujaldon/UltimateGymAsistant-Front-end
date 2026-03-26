import { Sparkles, TrendingUp } from "lucide-react";

interface NutritionInsightsProps {
  dailyInsight: string;
  weeklyInsight: string;
  loading?: boolean;
  labels: Record<string, string>;
}

export default function NutritionInsights({
  dailyInsight,
  weeklyInsight,
  loading = false,
  labels,
}: NutritionInsightsProps) {
  const cards = [
    {
      title: labels.dailyInsight,
      body: dailyInsight,
      icon: Sparkles,
      iconClass: "bg-brand-500/15 text-brand-300",
      empty: labels.emptyDailyInsight,
    },
    {
      title: labels.weeklyInsight,
      body: weeklyInsight,
      icon: TrendingUp,
      iconClass: "bg-emerald-500/15 text-emerald-300",
      empty: labels.emptyWeeklyInsight,
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {cards.map(({ title, body, icon: Icon, iconClass, empty }) => (
        <section key={title} className="glass-panel rounded-[2rem] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className={`rounded-2xl p-3 ${iconClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-text-muted">{labels.coachLabel}</p>
              <h3 className="text-lg font-semibold text-text">{title}</h3>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded-full bg-white/8" />
              <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/8" />
              <div className="h-3 w-3/5 animate-pulse rounded-full bg-white/8" />
            </div>
          ) : (
            <p className="text-sm leading-7 text-text-secondary">{body || empty}</p>
          )}
        </section>
      ))}
    </div>
  );
}
