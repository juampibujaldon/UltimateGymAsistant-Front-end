/**
 * Workout Logger – i18n enabled, card-grid exercise picker.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, CheckCircle, Search, X } from "lucide-react";
import {
    getWorkout, updateWorkout, addExerciseToWorkout, removeExerciseFromWorkout,
} from "../api/workouts";
import { getExercises, createExercise } from "../api/exercises";
import { addSet, deleteSet } from "../api/sets";
import { useLanguage } from "../context/LanguageContext";
import { getExerciseMeta, getExerciseDisplayName } from "../data/exerciseMeta";
import RestTimer from "../components/RestTimer";
import type { Exercise, Workout, WorkoutExercise } from "../types";
import type { Language } from "../i18n/translations";

// ─── Set Input Row ────────────────────────────────────────────────────────────
function SetInputRow({ setNum, onAdd }: {
    setNum: number;
    onAdd: (data: { weight: number; reps: number; rir?: number; notes?: string }) => Promise<void>;
}) {
    const { t } = useLanguage();
    const L = t.logger;
    const [weight, setWeight] = useState("");
    const [reps, setReps] = useState("");
    const [rir, setRir] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const weightRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async () => {
        if (!weight || !reps) return;
        setSaving(true);
        try {
            await onAdd({
                weight: parseFloat(weight), reps: parseInt(reps),
                rir: rir !== "" ? parseInt(rir) : undefined,
                notes: notes || undefined,
            });
            setWeight(""); setReps(""); setRir(""); setNotes("");
            weightRef.current?.focus();
        } finally { setSaving(false); }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSubmit(); };

    return (
        <div className="flex items-center gap-1.5 md:gap-2 animate-slide-up">
            <span className="text-text-secondary text-xs sm:text-sm w-10 sm:w-12 shrink-0">{L.set} {setNum}</span>
            <input ref={weightRef} className="input text-center w-14 sm:w-20 px-1 sm:px-3" placeholder={L.setPlaceholderKg}
                type="number" step="0.5" value={weight} onChange={e => setWeight(e.target.value)} onKeyDown={handleKeyDown} />
            <span className="text-text-muted text-sm">×</span>
            <input className="input text-center w-12 sm:w-16 px-1 sm:px-3" placeholder={L.setPlaceholderReps}
                type="number" value={reps} onChange={e => setReps(e.target.value)} onKeyDown={handleKeyDown} />
            <input className="input text-center w-12 sm:w-16 px-1 sm:px-3" placeholder={L.setPlaceholderRir}
                type="number" value={rir} onChange={e => setRir(e.target.value)} onKeyDown={handleKeyDown} />
            <input className="input flex-1 hidden md:block" placeholder={L.setPlaceholderNotes}
                value={notes} onChange={e => setNotes(e.target.value)} onKeyDown={handleKeyDown} />
            <button className="btn-primary py-2 px-2 sm:px-3" onClick={handleSubmit}
                disabled={saving || !weight || !reps} title={`Add set (Enter)`}>
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
}

// ─── Exercise Card ────────────────────────────────────────────────────────────
function ExerciseCard({ we, onRemove, onSetAdded, onSetDeleted }: {
    we: WorkoutExercise;
    onRemove: () => void; onSetAdded: () => void; onSetDeleted: () => void;
}) {
    const { t } = useLanguage();
    const L = t.logger;

    const handleAddSet = async (data: { weight: number; reps: number; rir?: number; notes?: string }) => {
        await addSet(we.id, { set_number: we.sets.length + 1, ...data });
        onSetAdded();
    };

    const epley1RM = (weight: number, reps: number) =>
        reps === 1 ? weight : Math.round(weight * (1 + reps / 30) * 10) / 10;

    const { language } = useLanguage();
    const displayName = getExerciseDisplayName(we.exercise.name, language as Language);

    return (
        <div className="card p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-text">{displayName}</h3>
                    {we.exercise.muscle_group && (
                        <span className="badge bg-brand-600/20 text-brand-400 mt-1">{we.exercise.muscle_group}</span>
                    )}
                </div>
                <button className="btn-danger py-1.5 px-3" onClick={onRemove}>
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2 px-1 mb-2">
                <span className="text-[10px] sm:text-xs text-text-muted w-10 sm:w-12">{L.headerSet}</span>
                <span className="text-[10px] sm:text-xs text-text-muted w-14 sm:w-20 text-center">{L.headerWeight}</span>
                <span className="text-[10px] sm:text-xs text-text-muted w-12 sm:w-16 text-center">{L.headerReps}</span>
                <span className="text-[10px] sm:text-xs text-text-muted w-12 sm:w-16 text-center">{L.headerRir}</span>
                <span className="text-xs text-text-muted flex-1 hidden md:block">{L.headerNotes}</span>
                <span className="text-[10px] sm:text-xs text-text-muted w-12 sm:w-16 text-center">{L.header1RM}</span>
                <span className="w-6 sm:w-8" />
            </div>

            {we.sets.slice().sort((a, b) => a.set_number - b.set_number).map(s => (
                <div key={s.id} className="flex items-center gap-1.5 md:gap-2 px-1 py-1.5 rounded-lg hover:bg-surface-hover/50 group">
                    <span className="text-xs sm:text-sm text-text-secondary w-10 sm:w-12">{L.set} {s.set_number}</span>
                    <span className="text-xs sm:text-sm font-medium text-text-secondary w-14 sm:w-20 text-center">{s.weight}kg</span>
                    <span className="text-xs sm:text-sm font-medium text-text-secondary w-12 sm:w-16 text-center">{s.reps}</span>
                    <span className={`text-xs sm:text-sm w-12 sm:w-16 text-center font-medium ${s.rir === 0 ? "text-red-400" : s.rir === 1 ? "text-amber-400" : "text-emerald-400"
                        }`}>{s.rir !== null ? s.rir : "—"}</span>
                    <span className="text-xs text-text-secondary flex-1 truncate hidden md:block">{s.notes || ""}</span>
                    <span className="text-[10px] sm:text-xs text-text-secondary w-12 sm:w-16 text-center">{epley1RM(s.weight, s.reps)}kg</span>
                    <button className="w-6 sm:w-8 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteSet(s.id).then(onSetDeleted)}>
                        <X className="w-3.5 h-3.5 text-red-400 hover:text-red-300" />
                    </button>
                </div>
            ))}

            <div className="mt-3 pt-3 border-t border-surface-border">
                <SetInputRow setNum={we.sets.length + 1} onAdd={handleAddSet} />
            </div>
        </div>
    );
}

// ─── Exercise Icon Card ────────────────────────────────────────────────────────
function ExerciseIconCard({ exercise, onClick, lang }: {
    exercise: Exercise;
    onClick: () => void;
    lang: Language;
}) {
    const meta = getExerciseMeta(exercise.name);
    const displayName = getExerciseDisplayName(exercise.name, lang);

    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
            title={displayName}
        >
            {/* Icon tile – 80×80px, like a big iPhone app icon */}
            <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${meta.gradient}
                    flex items-center justify-center text-3xl
                    shadow-lg group-hover:scale-105 group-hover:shadow-xl
                    transition-all duration-200 active:scale-95
                    border border-white/10`}
            >
                {meta.emoji}
            </div>
            {/* Name label */}
            <span className="text-xs text-text-secondary text-center leading-tight max-w-[5rem] line-clamp-2 group-hover:text-white transition-colors">
                {displayName}
                {exercise.is_custom && (
                    <span className="block text-brand-400 text-[10px]">✦</span>
                )}
            </span>
        </button>
    );
}

// ─── Exercise Picker (Card Grid) ──────────────────────────────────────────────
function ExercisePicker({ exercises, onSelect, onClose }: {
    exercises: Exercise[]; onSelect: (e: Exercise) => void; onClose: () => void;
}) {
    const { t, language } = useLanguage();
    const L = t.logger;
    const [search, setSearch] = useState("");
    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);

    // Filter against both English name and Spanish translation
    const filtered = exercises.filter(ex => {
        const esName = getExerciseMeta(ex.name).nameEs.toLowerCase();
        const q = search.toLowerCase();
        return ex.name.toLowerCase().includes(q) || esName.includes(q);
    });

    // Group by muscle group
    const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, ex) => {
        const key = ex.muscle_group || L.other;
        if (!acc[key]) acc[key] = [];
        acc[key].push(ex);
        return acc;
    }, {});

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try { const ex = await createExercise(newName.trim()); onSelect(ex); }
        finally { setCreating(false); }
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="card w-full max-w-2xl max-h-[80vh] flex flex-col animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
                    <h2 className="font-bold text-text text-lg">{L.pickerTitle}</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-secondary transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search bar */}
                <div className="px-5 py-3 border-b border-surface-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            className="input pl-9"
                            placeholder={L.searchPlaceholder}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Card grid */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                    {Object.entries(grouped).sort().map(([group, exs]) => (
                        <div key={group}>
                            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                                {group}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {exs.map(ex => (
                                    <ExerciseIconCard
                                        key={ex.id}
                                        exercise={ex}
                                        onClick={() => onSelect(ex)}
                                        lang={language as Language}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && search && (
                        <p className="text-text-secondary text-sm text-center py-8">{L.noExercisesFound}</p>
                    )}
                </div>

                {/* Create custom exercise */}
                <div className="px-5 py-4 border-t border-surface-border">
                    <div className="flex gap-2">
                        <input
                            className="input flex-1"
                            placeholder={L.createCustom}
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleCreate()}
                        />
                        <button
                            className="btn-primary py-2 px-4"
                            onClick={handleCreate}
                            disabled={!newName.trim() || creating}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WorkoutLogger() {
    const { workoutId: paramId } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const L = t.logger;

    const [workout, setWorkout] = useState<Workout | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(true);
    const [finishing, setFinishing] = useState(false);
    const [timerActive, setTimerActive] = useState(false);

    const loadWorkout = useCallback(async () => {
        if (!paramId) return;
        const w = await getWorkout(parseInt(paramId));
        setWorkout(w);
    }, [paramId]);

    useEffect(() => {
        if (!paramId) { navigate("/"); return; }
        Promise.all([getWorkout(parseInt(paramId)), getExercises()])
            .then(([w, exs]) => { setWorkout(w); setExercises(exs); })
            .finally(() => setLoading(false));
    }, [paramId, navigate]);

    const handleAddExercise = async (exercise: Exercise) => {
        if (!workout) return;
        setShowPicker(false);
        const updated = await addExerciseToWorkout(workout.id, exercise.id, workout.workout_exercises.length);
        setWorkout(updated);
    };

    const handleRemoveExercise = async (weId: number) => {
        if (!workout) return;
        const updated = await removeExerciseFromWorkout(workout.id, weId);
        setWorkout(updated);
    };

    const handleFinish = async () => {
        if (!workout) return;
        setFinishing(true);
        try { await updateWorkout(workout.id, { is_finished: true }); navigate("/history"); }
        finally { setFinishing(false); }
    };

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-screen">
            <div className="text-text-secondary animate-pulse">{L.loading}</div>
        </div>
    );
    if (!workout) return null;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6 animate-slide-up">
                <div>
                    <h1 className="text-2xl font-bold text-text">{L.title}</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        {new Date(workout.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                        {workout.is_finished && <span className="ml-2 badge bg-emerald-500/20 text-emerald-400">{L.completed}</span>}
                    </p>
                </div>
                {!workout.is_finished && (
                    <div className="flex gap-3">
                        <button className="btn-secondary" onClick={() => setShowPicker(true)}>
                            <Plus className="w-4 h-4" /> {L.addExercise}
                        </button>
                        <button className="btn-primary" onClick={handleFinish}
                            disabled={finishing || workout.workout_exercises.length === 0}>
                            <CheckCircle className="w-4 h-4" />
                            {finishing ? L.finishing : L.finishWorkout}
                        </button>
                    </div>
                )}
            </div>

            {!workout.is_finished && (
                <div className="mb-5 px-4 py-2.5 rounded-xl bg-brand-600/10 border border-brand-600/20 text-xs text-brand-400">
                    💡 {L.keyboardHint} <kbd className="bg-surface-hover px-1.5 py-0.5 rounded font-mono">Enter</kbd> {L.keyboardHint2}
                </div>
            )}

            <div className="space-y-5">
                {workout.workout_exercises.length === 0 ? (
                    <div className="card p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-8 h-8 text-text-muted" />
                        </div>
                        <p className="text-text-secondary mb-4">{L.noExercises}</p>
                        <button className="btn-primary mx-auto" onClick={() => setShowPicker(true)}>
                            <Plus className="w-4 h-4" /> {L.addExercise}
                        </button>
                    </div>
                ) : (
                    workout.workout_exercises.slice().sort((a, b) => a.order - b.order).map(we => (
                        <ExerciseCard key={we.id} we={we}
                            onRemove={() => handleRemoveExercise(we.id)}
                            onSetAdded={() => {
                                loadWorkout();
                                setTimerActive(true);
                            }} 
                            onSetDeleted={loadWorkout} />
                    ))
                )}
            </div>

            {showPicker && (
                <ExercisePicker exercises={exercises} onSelect={handleAddExercise} onClose={() => setShowPicker(false)} />
            )}
            
            <RestTimer isActive={timerActive} onClose={() => setTimerActive(false)} defaultSeconds={90} />
        </div>
    );
}
