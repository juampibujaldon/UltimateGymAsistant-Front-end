import { type ElementType, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Dumbbell,
  Flame,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { generateWorkout, listWorkouts } from "../api/workouts";
import { useLanguage } from "../context/LanguageContext";
import type { WorkoutSummary } from "../types";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: ElementType;
  color: string;
}) {
  return (
    <div className="glass-panel flex items-center gap-3 rounded-3xl p-4 animate-fade-in">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-text">{value}</p>
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
    </div>
  );
}

function workoutDisplayName(workout: WorkoutSummary): string {
  return (
    workout.name?.trim() ||
    new Date(workout.date).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const d = t.dashboard;

  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    listWorkouts()
      .then(setWorkouts)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const activeWorkout = workouts.find(
    (workout) => !workout.is_finished && new Date(workout.date).toDateString() === today,
  );
  const totalSets = workouts.reduce((acc, workout) => acc + workout.set_count, 0);
  const thisWeek = workouts.filter(
    (workout) => (Date.now() - new Date(workout.date).getTime()) / 86400000 <= 7,
  );
  const totalExercises = workouts.reduce((acc, workout) => acc + workout.exercise_count, 0);

  const handleNewWorkout = async () => {
    setCreating(true);
    try {
      navigate("/log");
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateRoutine = async (category?: string) => {
    setShowCategoryModal(false);
    setGenerating(true);
    try {
      const workout = await generateWorkout(category);
      navigate(`/log/${workout.id}`);
    } catch (error) {
      console.error("Failed to generate workout", error);
      alert(
        language === "es"
          ? "No pudimos generar una rutina ahora. Intenta otra vez."
          : "We could not generate a routine right now. Try again.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const categories = [
    { id: "Torso Completo", icon: "Full", label: language === "es" ? "Torso completo" : "Full upper" },
    { id: "Empuje", icon: "Push", label: language === "es" ? "Empuje" : "Push" },
    { id: "Jalon", icon: "Pull", label: language === "es" ? "Jalon" : "Pull" },
    { id: "Piernas", icon: "Legs", label: language === "es" ? "Piernas" : "Legs" },
    { id: "Artes Marciales", icon: "Fight", label: language === "es" ? "Marcial" : "Combat" },
  ];

  return (
    <div className="space-y-6">
      <section className="hero-panel animate-slide-up overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-text-muted">Gym AI Coach</p>
            <h1 className="mt-3 text-3xl font-bold text-text md:text-4xl">{d.readyToTrain}</h1>
            <p className="mt-2 max-w-xl text-sm text-text-secondary md:text-base">{d.startPrompt}</p>
            <p className="mt-4 text-xs text-text-muted">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className="btn-primary min-w-[220px] justify-center"
              onClick={handleNewWorkout}
              disabled={creating || generating}
            >
              <Dumbbell className="h-4 w-4" />
              {creating ? d.creating : d.newWorkout}
            </button>
            <button
              className="btn-secondary min-w-[220px] justify-center border border-brand-500/25 bg-white/6"
              onClick={() => setShowCategoryModal(true)}
              disabled={creating || generating}
            >
              {generating ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-transparent" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {language === "es" ? "Auto-generar" : "Auto-generate"}
            </button>
          </div>
        </div>
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={d.totalWorkouts} value={workouts.length} icon={CalendarDays} color="bg-brand-600" />
        <StatCard label={d.thisWeek} value={thisWeek.length} icon={Flame} color="bg-accent-500" />
        <StatCard label={d.totalSets} value={totalSets} icon={Dumbbell} color="bg-sky-500" />
        <StatCard label={d.exercisesTracked} value={totalExercises} icon={TrendingUp} color="bg-emerald-600" />
      </div>

      <section className="glass-panel animate-slide-up rounded-[2rem] p-5">
        {activeWorkout ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold text-emerald-400">{d.activeSession}</span>
              </div>
              <h2 className="text-lg font-bold text-text">{workoutDisplayName(activeWorkout)}</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {activeWorkout.exercise_count} {d.exercises} · {activeWorkout.set_count} {d.sets}
              </p>
            </div>
            <button
              className="btn-primary w-full justify-center md:w-auto"
              onClick={() => navigate(`/log/${activeWorkout.id}`)}
            >
              <ArrowRight className="h-4 w-4" />
              {d.continueWorkout}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15">
              <Dumbbell className="h-7 w-7 text-brand-300" />
            </div>
            <h2 className="text-lg font-bold text-text">{d.readyToTrain}</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-text-secondary">{d.startPrompt}</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-text">{d.recentWorkouts}</h2>
        {loading ? (
          <div className="text-sm text-text-secondary">{d.loading}</div>
        ) : workouts.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-8 text-center text-text-secondary">
            <p>{d.noWorkouts}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {workouts.slice(0, 6).map((workout) => (
              <div
                key={workout.id}
                className="glass-panel flex cursor-pointer items-center justify-between rounded-[1.5rem] px-4 py-4 transition-colors hover:border-brand-500/35"
                onClick={() => navigate(`/log/${workout.id}`)}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-semibold text-text">{workoutDisplayName(workout)}</span>
                    {workout.is_finished ? (
                      <span className="badge bg-emerald-500/20 text-emerald-400">{d.completed}</span>
                    ) : (
                      <span className="badge bg-amber-500/20 text-amber-400">{d.inProgress}</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {new Date(workout.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    {" · "}
                    {workout.exercise_count} {d.exercises}
                    {" · "}
                    {workout.set_count} {d.sets}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-text-muted" />
              </div>
            ))}
          </div>
        )}
      </section>

      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowCategoryModal(false)}
        >
          <div
            className="glass-panel w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-slide-up"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-text">
                <Sparkles className="h-5 w-5 text-brand-300" />
                {language === "es" ? "Objetivo IA" : "AI focus"}
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-text-secondary transition-colors hover:text-text"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-5 text-sm text-text-secondary">
              {language === "es"
                ? "Elige el foco de la sesion y armamos una rutina que no te haga perder tiempo."
                : "Choose the session focus and we will build a routine that gets you moving fast."}
            </p>

            <div className="flex flex-col gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleGenerateRoutine(category.id)}
                  className="flex items-center justify-between rounded-2xl border border-transparent bg-surface-hover px-4 py-3 text-left transition-all hover:border-brand-500/35 hover:bg-brand-500/10"
                  type="button"
                >
                  <span className="font-semibold text-text">{category.label}</span>
                  <span className="text-xs uppercase tracking-[0.22em] text-text-muted">{category.icon}</span>
                </button>
              ))}

              <button
                onClick={() => handleGenerateRoutine()}
                className="mt-2 py-2 text-center text-sm text-text-secondary transition-colors hover:text-brand-300"
                type="button"
              >
                {language === "es" ? "Sorprendeme" : "Surprise me"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
