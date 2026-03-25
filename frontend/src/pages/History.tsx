/**
 * History page – shows workout names, mobile-friendly cards.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, BrainCircuit, Trash2, Dumbbell } from "lucide-react";
import { listWorkouts, getWorkout, deleteWorkout } from "../api/workouts";
import { useLanguage } from "../context/LanguageContext";
import type { Workout, WorkoutSummary } from "../types";

function workoutDisplayName(w: WorkoutSummary | Workout): string {
    const name = (w as WorkoutSummary).name?.trim();
    return name || new Date((w as WorkoutSummary).date).toLocaleDateString(undefined, {
        weekday: "short", month: "short", day: "numeric",
    });
}

function WorkoutRow({ summary, onDelete }: { summary: WorkoutSummary; onDelete: () => void }) {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const H = t.history;

    const [expanded, setExpanded] = useState(false);
    const [detail, setDetail] = useState<Workout | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const toggle = async () => {
        if (!expanded && !detail) {
            setLoadingDetail(true);
            try { const w = await getWorkout(summary.id); setDetail(w); }
            finally { setLoadingDetail(false); }
        }
        setExpanded(v => !v);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(H.deleteConfirm)) return;
        setDeleting(true);
        try { await deleteWorkout(summary.id); onDelete(); }
        finally { setDeleting(false); }
    };

    const epley1RM = (weight: number, reps: number) =>
        reps === 1 ? weight : Math.round(weight * (1 + reps / 30) * 10) / 10;

    return (
        <div className="card overflow-hidden animate-fade-in">
            {/* Header row */}
            <div
                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-hover/30 transition-colors gap-3"
                onClick={toggle}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-surface-hover flex flex-col items-center justify-center text-center shrink-0">
                        <span className="text-xs font-bold text-text leading-none">{new Date(summary.date).getDate()}</span>
                        <span className="text-[9px] text-text-secondary leading-none">
                            {new Date(summary.date).toLocaleDateString(undefined, { month: "short" })}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-text text-sm truncate">{workoutDisplayName(summary)}</span>
                            {summary.is_finished
                                ? <span className="badge bg-emerald-500/20 text-emerald-400 shrink-0">{H.completed}</span>
                                : <span className="badge bg-amber-500/20 text-amber-400 shrink-0">{H.inProgress}</span>}
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">
                            {summary.exercise_count} {H.exercises} · {summary.set_count} {H.sets}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        className="p-2 rounded-lg text-text-secondary hover:text-brand-400 hover:bg-brand-600/10 transition-colors"
                        onClick={e => { e.stopPropagation(); navigate(`/analysis?workout=${summary.id}`); }}
                        title={H.aiButton}
                    >
                        <BrainCircuit className="w-4 h-4" />
                    </button>
                    {!summary.is_finished && (
                        <button
                            className="p-2 rounded-lg text-text-secondary hover:text-brand-400 hover:bg-brand-600/10 transition-colors"
                            onClick={e => { e.stopPropagation(); navigate(`/log/${summary.id}`); }}
                            title={H.continue}
                        >
                            <Dumbbell className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        className="p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    {expanded ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
                </div>
            </div>

            {/* Expandable details */}
            {expanded && (
                <div className="border-t border-surface-border px-4 py-4">
                    {loadingDetail ? (
                        <p className="text-text-secondary text-sm animate-pulse">{H.loadingDetails}</p>
                    ) : detail ? (
                        <div className="space-y-4">
                            {detail.workout_exercises.map(we => {
                                const bestSet = we.sets.length
                                    ? we.sets.reduce((prev, curr) => epley1RM(curr.weight, curr.reps) > epley1RM(prev.weight, prev.reps) ? curr : prev)
                                    : null;
                                return (
                                    <div key={we.id}>
                                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-text-secondary text-sm">{we.exercise.name}</span>
                                                {we.exercise.muscle_group && (
                                                    <span className="badge bg-brand-600/20 text-brand-400">{we.exercise.muscle_group}</span>
                                                )}
                                            </div>
                                            {bestSet && (
                                                <span className="text-xs text-text-secondary">
                                                    {H.best}: {bestSet.weight}kg×{bestSet.reps} (~{epley1RM(bestSet.weight, bestSet.reps)}kg 1RM)
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1 pl-2">
                                            {we.sets.slice().sort((a, b) => a.set_number - b.set_number).map(s => (
                                                <div key={s.id} className="flex items-center gap-3 text-xs text-text-secondary">
                                                    <span className="text-text-muted w-12 shrink-0">{H.set} {s.set_number}</span>
                                                    <span className="text-text-secondary">{s.weight}kg × {s.reps} {H.reps}</span>
                                                    {s.rir !== null && (
                                                        <span className={s.rir === 0 ? "text-red-400" : s.rir === 1 ? "text-amber-400" : "text-emerald-400"}>
                                                            RIR {s.rir}
                                                        </span>
                                                    )}
                                                    {s.notes && <span className="text-text-muted italic truncate">{s.notes}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}

export default function History() {
    const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();
    const H = t.history;

    const load = () => {
        setLoading(true);
        listWorkouts().then(setWorkouts).finally(() => setLoading(false));
    };
    useEffect(() => {
        // Avoid synchronous setState on mount by not calling load() which sets loading to true
        listWorkouts().then(setWorkouts).finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="mb-6 animate-slide-up">
                <h1 className="text-2xl md:text-3xl font-bold text-text">{H.title}</h1>
                <p className="text-text-secondary mt-1 text-sm">{workouts.length} {H.sessionsLogged}</p>
            </div>
            {loading ? (
                <div className="text-text-secondary text-sm animate-pulse">{H.loading}</div>
            ) : workouts.length === 0 ? (
                <div className="card p-12 text-center">
                    <Dumbbell className="w-10 h-10 text-text-muted mx-auto mb-2" />
                    <p className="text-text-secondary">{H.noWorkouts}</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {workouts.map(w => <WorkoutRow key={w.id} summary={w} onDelete={load} />)}
                </div>
            )}
        </div>
    );
}
