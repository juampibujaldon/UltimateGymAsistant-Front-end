import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle,
  Clipboard,
  Plus,
  Search,
  Sparkles,
  TimerReset,
  Trash2,
  X,
} from "lucide-react";
import {
  addExerciseToWorkout,
  getWorkout,
  removeExerciseFromWorkout,
  updateWorkout,
} from "../api/workouts";
import { createExercise, getExercises } from "../api/exercises";
import { addSet, deleteSet } from "../api/sets";
import { useLanguage } from "../context/LanguageContext";
import { getExerciseDisplayName, getExerciseMeta } from "../data/exerciseMeta";
import RestTimer from "../components/RestTimer";
import type { Exercise, Workout, WorkoutExercise } from "../types";
import type { Language } from "../i18n/translations";

type WorkoutSet = WorkoutExercise["sets"][number];

function SetInputRow({
  setNum,
  lastSet,
  onAdd,
}: {
  setNum: number;
  lastSet?: WorkoutSet;
  onAdd: (data: { weight: number; reps: number; rir?: number; notes?: string }) => Promise<void>;
}) {
  const { t, language } = useLanguage();
  const logger = t.logger;
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rir, setRir] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const weightRef = useRef<HTMLInputElement>(null);

  const applyLastSet = () => {
    if (!lastSet) return;
    setWeight(String(lastSet.weight));
    setReps(String(lastSet.reps));
    setRir(lastSet.rir !== null && lastSet.rir !== undefined ? String(lastSet.rir) : "");
    setNotes(lastSet.notes ?? "");
    weightRef.current?.focus();
  };

  const handleSubmit = async () => {
    if (!weight || !reps) return;
    setSaving(true);
    try {
      await onAdd({
        weight: parseFloat(weight),
        reps: parseInt(reps, 10),
        rir: rir !== "" ? parseInt(rir, 10) : undefined,
        notes: notes || undefined,
      });
      setWeight("");
      setReps("");
      setRir("");
      setNotes("");
      weightRef.current?.focus();
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") handleSubmit();
  };

  return (
    <div className="space-y-2 animate-slide-up">
      {lastSet && (
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-hover px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-brand-500/40 hover:text-text"
          onClick={applyLastSet}
        >
          <Clipboard className="h-3.5 w-3.5" />
          {language === "es" ? "Copiar ultima" : "Repeat last"}: {lastSet.weight}kg x {lastSet.reps}
        </button>
      )}

      <div className="flex items-center gap-1.5 md:gap-2">
        <span className="w-10 shrink-0 text-xs text-text-secondary sm:w-12 sm:text-sm">
          {logger.set} {setNum}
        </span>
        <input
          ref={weightRef}
          className="input w-14 px-1 text-center sm:w-20 sm:px-3"
          placeholder={logger.setPlaceholderKg}
          type="number"
          step="0.5"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <span className="text-sm text-text-muted">x</span>
        <input
          className="input w-12 px-1 text-center sm:w-16 sm:px-3"
          placeholder={logger.setPlaceholderReps}
          type="number"
          value={reps}
          onChange={(event) => setReps(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          className="input w-12 px-1 text-center sm:w-16 sm:px-3"
          placeholder={logger.setPlaceholderRir}
          type="number"
          value={rir}
          onChange={(event) => setRir(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          className="input hidden flex-1 md:block"
          placeholder={logger.setPlaceholderNotes}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="btn-primary px-2 py-2 sm:px-3"
          onClick={handleSubmit}
          disabled={saving || !weight || !reps}
          title="Add set"
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ExerciseCard({
  workoutExercise,
  onRemove,
  onSetAdded,
  onSetDeleted,
}: {
  workoutExercise: WorkoutExercise;
  onRemove: () => void;
  onSetAdded: () => void;
  onSetDeleted: () => void;
}) {
  const { t, language } = useLanguage();
  const logger = t.logger;

  const handleAddSet = async (data: { weight: number; reps: number; rir?: number; notes?: string }) => {
    await addSet(workoutExercise.id, {
      set_number: workoutExercise.sets.length + 1,
      ...data,
    });
    onSetAdded();
  };

  const epley1RM = (weight: number, reps: number) =>
    reps === 1 ? weight : Math.round(weight * (1 + reps / 30) * 10) / 10;

  const displayName = getExerciseDisplayName(workoutExercise.exercise.name, language as Language);
  const lastSet = workoutExercise.sets
    .slice()
    .sort((a, b) => b.set_number - a.set_number)[0];

  return (
    <div className="glass-panel rounded-[2rem] p-5 animate-slide-up">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-text">{displayName}</h3>
          {workoutExercise.exercise.muscle_group && (
            <span className="badge mt-1 bg-brand-500/15 text-brand-300">
              {workoutExercise.exercise.muscle_group}
            </span>
          )}
        </div>
        <button className="btn-danger px-3 py-1.5" onClick={onRemove} type="button">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mb-2 flex items-center gap-1.5 px-1 md:gap-2">
        <span className="w-10 text-[10px] text-text-muted sm:w-12 sm:text-xs">{logger.headerSet}</span>
        <span className="w-14 text-center text-[10px] text-text-muted sm:w-20 sm:text-xs">{logger.headerWeight}</span>
        <span className="w-12 text-center text-[10px] text-text-muted sm:w-16 sm:text-xs">{logger.headerReps}</span>
        <span className="w-12 text-center text-[10px] text-text-muted sm:w-16 sm:text-xs">{logger.headerRir}</span>
        <span className="hidden flex-1 text-xs text-text-muted md:block">{logger.headerNotes}</span>
        <span className="w-12 text-center text-[10px] text-text-muted sm:w-16 sm:text-xs">{logger.header1RM}</span>
        <span className="w-6 sm:w-8" />
      </div>

      {workoutExercise.sets
        .slice()
        .sort((a, b) => a.set_number - b.set_number)
        .map((set) => (
          <div
            key={set.id}
            className="group flex items-center gap-1.5 rounded-lg px-1 py-1.5 hover:bg-surface-hover/60 md:gap-2"
          >
            <span className="w-10 text-xs text-text-secondary sm:w-12 sm:text-sm">
              {logger.set} {set.set_number}
            </span>
            <span className="w-14 text-center text-xs font-medium text-text-secondary sm:w-20 sm:text-sm">
              {set.weight}kg
            </span>
            <span className="w-12 text-center text-xs font-medium text-text-secondary sm:w-16 sm:text-sm">
              {set.reps}
            </span>
            <span
              className={`w-12 text-center text-xs font-medium sm:w-16 sm:text-sm ${
                set.rir === 0
                  ? "text-red-400"
                  : set.rir === 1
                    ? "text-amber-400"
                    : "text-emerald-400"
              }`}
            >
              {set.rir !== null ? set.rir : "-"}
            </span>
            <span className="hidden flex-1 truncate text-xs text-text-secondary md:block">{set.notes || ""}</span>
            <span className="w-12 text-center text-[10px] text-text-secondary sm:w-16 sm:text-xs">
              {epley1RM(set.weight, set.reps)}kg
            </span>
            <button
              className="flex w-6 items-center justify-center transition-opacity sm:w-8 sm:opacity-0 sm:group-hover:opacity-100"
              onClick={() => deleteSet(set.id).then(onSetDeleted)}
              type="button"
            >
              <X className="h-3.5 w-3.5 text-red-400 hover:text-red-300" />
            </button>
          </div>
        ))}

      <div className="mt-3 border-t border-surface-border pt-3">
        <SetInputRow setNum={workoutExercise.sets.length + 1} lastSet={lastSet} onAdd={handleAddSet} />
      </div>
    </div>
  );
}

function ExerciseIconCard({
  exercise,
  onClick,
  language,
}: {
  exercise: Exercise;
  onClick: () => void;
  language: Language;
}) {
  const meta = getExerciseMeta(exercise.name);
  const displayName = getExerciseDisplayName(exercise.name, language);

  return (
    <button
      onClick={onClick}
      className="group flex cursor-pointer flex-col items-center gap-1.5"
      title={displayName}
      type="button"
    >
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br text-3xl shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl active:scale-95 ${meta.gradient}`}
      >
        {meta.emoji}
      </div>
      <span className="max-w-[5rem] text-center text-xs leading-tight text-text-secondary transition-colors group-hover:text-white">
        {displayName}
        {exercise.is_custom && <span className="block text-[10px] text-brand-300">custom</span>}
      </span>
    </button>
  );
}

function ExercisePicker({
  exercises,
  onSelect,
  onClose,
}: {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}) {
  const { t, language } = useLanguage();
  const logger = t.logger;
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = exercises.filter((exercise) => {
    const spanishName = getExerciseMeta(exercise.name).nameEs.toLowerCase();
    const query = search.toLowerCase();
    return exercise.name.toLowerCase().includes(query) || spanishName.includes(query);
  });

  const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, exercise) => {
    const key = exercise.muscle_group || logger.other;
    if (!acc[key]) acc[key] = [];
    acc[key].push(exercise);
    return acc;
  }, {});

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const exercise = await createExercise(newName.trim());
      onSelect(exercise);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-panel flex max-h-[80vh] w-full max-w-2xl flex-col rounded-[2rem] animate-slide-up"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <h2 className="text-lg font-bold text-text">{logger.pickerTitle}</h2>
          <button onClick={onClose} className="text-text-secondary transition-colors hover:text-text" type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-surface-border px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              className="input pl-9"
              placeholder={logger.searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {Object.entries(grouped)
            .sort()
            .map(([group, groupedExercises]) => (
              <div key={group}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">{group}</p>
                <div className="flex flex-wrap gap-4">
                  {groupedExercises.map((exercise) => (
                    <ExerciseIconCard
                      key={exercise.id}
                      exercise={exercise}
                      onClick={() => onSelect(exercise)}
                      language={language as Language}
                    />
                  ))}
                </div>
              </div>
            ))}
          {filtered.length === 0 && search && (
            <p className="py-8 text-center text-sm text-text-secondary">{logger.noExercisesFound}</p>
          )}
        </div>

        <div className="border-t border-surface-border px-5 py-4">
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder={logger.createCustom}
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleCreate()}
            />
            <button
              className="btn-primary px-4 py-2"
              onClick={handleCreate}
              disabled={!newName.trim() || creating}
              type="button"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkoutLogger() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const logger = t.logger;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  const loadWorkout = useCallback(async () => {
    if (!workoutId) return;
    const nextWorkout = await getWorkout(parseInt(workoutId, 10));
    setWorkout(nextWorkout);
  }, [workoutId]);

  useEffect(() => {
    if (!workoutId) {
      navigate("/");
      return;
    }

    Promise.all([getWorkout(parseInt(workoutId, 10)), getExercises()])
      .then(([nextWorkout, nextExercises]) => {
        setWorkout(nextWorkout);
        setExercises(nextExercises);
      })
      .finally(() => setLoading(false));
  }, [workoutId, navigate]);

  const handleAddExercise = async (exercise: Exercise) => {
    if (!workout) return;
    setShowPicker(false);
    const updated = await addExerciseToWorkout(workout.id, exercise.id, workout.workout_exercises.length);
    setWorkout(updated);
  };

  const handleRemoveExercise = async (workoutExerciseId: number) => {
    if (!workout) return;
    const updated = await removeExerciseFromWorkout(workout.id, workoutExerciseId);
    setWorkout(updated);
  };

  const handleFinish = async () => {
    if (!workout) return;
    setFinishing(true);
    try {
      await updateWorkout(workout.id, { is_finished: true });
      navigate("/history");
    } finally {
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="animate-pulse text-text-secondary">{logger.loading}</div>
      </div>
    );
  }

  if (!workout) return null;

  const totalSets = workout.workout_exercises.reduce((acc, exercise) => acc + exercise.sets.length, 0);

  return (
    <div className="space-y-6">
      <section className="hero-panel rounded-[2rem] p-5 md:p-6 animate-slide-up">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-text-muted">{logger.title}</p>
            <h1 className="text-2xl font-bold text-text">{workout.name || logger.title}</h1>
            <p className="mt-1 text-sm text-text-secondary">
              {new Date(workout.date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              {workout.is_finished && (
                <span className="badge ml-2 bg-emerald-500/20 text-emerald-400">{logger.completed}</span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 md:min-w-[320px]">
            <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-center">
              <p className="text-xs text-text-muted">{logger.headerSet}</p>
              <p className="mt-1 text-lg font-semibold text-text">{totalSets}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-center">
              <p className="text-xs text-text-muted">{t.dashboard.exercises}</p>
              <p className="mt-1 text-lg font-semibold text-text">{workout.workout_exercises.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-center">
              <p className="text-xs text-text-muted">Rest</p>
              <p className="mt-1 text-lg font-semibold text-text">{timerActive ? "On" : "Off"}</p>
            </div>
          </div>
        </div>
      </section>

      {!workout.is_finished && (
        <div className="glass-panel flex flex-wrap items-center gap-3 rounded-[1.5rem] px-4 py-3 text-xs text-brand-300">
          <Sparkles className="h-4 w-4 text-brand-300" />
          <span>
            {logger.keyboardHint} <kbd className="rounded bg-surface-hover px-1.5 py-0.5 font-mono">Enter</kbd>{" "}
            {logger.keyboardHint2}
          </span>
          <span className="inline-flex items-center gap-1 text-text-secondary">
            <TimerReset className="h-3.5 w-3.5" />
            {language === "es" ? "El timer arranca despues de cada serie" : "Timer starts after each set"}
          </span>
        </div>
      )}

      {!workout.is_finished && (
        <div className="hidden justify-end gap-3 sm:flex">
          <button className="btn-secondary" onClick={() => setShowPicker(true)} type="button">
            <Plus className="h-4 w-4" /> {logger.addExercise}
          </button>
          <button
            className="btn-primary"
            onClick={handleFinish}
            disabled={finishing || workout.workout_exercises.length === 0}
            type="button"
          >
            <CheckCircle className="h-4 w-4" />
            {finishing ? logger.finishing : logger.finishWorkout}
          </button>
        </div>
      )}

      <div className="space-y-5">
        {workout.workout_exercises.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-hover">
              <Plus className="h-8 w-8 text-text-muted" />
            </div>
            <p className="mb-4 text-text-secondary">{logger.noExercises}</p>
            <button className="btn-primary mx-auto" onClick={() => setShowPicker(true)} type="button">
              <Plus className="h-4 w-4" /> {logger.addExercise}
            </button>
          </div>
        ) : (
          workout.workout_exercises
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((workoutExercise) => (
              <ExerciseCard
                key={workoutExercise.id}
                workoutExercise={workoutExercise}
                onRemove={() => handleRemoveExercise(workoutExercise.id)}
                onSetAdded={() => {
                  loadWorkout();
                  setTimerActive(true);
                }}
                onSetDeleted={loadWorkout}
              />
            ))
        )}
      </div>

      {showPicker && (
        <ExercisePicker
          exercises={exercises}
          onSelect={handleAddExercise}
          onClose={() => setShowPicker(false)}
        />
      )}

      {!workout.is_finished && (
        <div className="fixed inset-x-0 bottom-[5.25rem] z-40 px-4 sm:hidden">
          <div className="glass-panel flex items-center gap-3 rounded-2xl p-3">
            <button className="btn-secondary flex-1 justify-center" onClick={() => setShowPicker(true)} type="button">
              <Plus className="h-4 w-4" /> {logger.addExercise}
            </button>
            <button
              className="btn-primary flex-1 justify-center"
              onClick={handleFinish}
              disabled={finishing || workout.workout_exercises.length === 0}
              type="button"
            >
              <CheckCircle className="h-4 w-4" />
              {finishing ? logger.finishing : logger.finishWorkout}
            </button>
          </div>
        </div>
      )}

      <RestTimer isActive={timerActive} onClose={() => setTimerActive(false)} defaultSeconds={90} />
    </div>
  );
}
