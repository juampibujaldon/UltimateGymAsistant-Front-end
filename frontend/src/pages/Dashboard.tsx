/**
 * Dashboard page – shows workout names, mobile-friendly layout.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Flame, CalendarDays, Dumbbell, TrendingUp, X } from "lucide-react";
import { listWorkouts, generateWorkout } from "../api/workouts";
import { useLanguage } from "../context/LanguageContext";
import type { WorkoutSummary } from "../types";

function StatCard({ label, value, icon: Icon, color }: {
    label: string; value: string | number; icon: React.ElementType; color: string;
}) {
    return (
        <div className="card p-4 flex items-center gap-3 animate-fade-in">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-xl font-bold text-text">{value}</p>
                <p className="text-xs text-text-secondary">{label}</p>
            </div>
        </div>
    );
}

function workoutDisplayName(w: WorkoutSummary): string {
    return w.name?.trim() || new Date(w.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const d = t.dashboard;

    const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    useEffect(() => { listWorkouts().then(setWorkouts).finally(() => setLoading(false)); }, []);

    const today = new Date().toDateString();
    const activeWorkout = workouts.find(w => !w.is_finished && new Date(w.date).toDateString() === today);
    const totalSets = workouts.reduce((acc, w) => acc + w.set_count, 0);
    const thisWeek = workouts.filter(w => (Date.now() - new Date(w.date).getTime()) / 86400000 <= 7);
    const totalExercises = workouts.reduce((a, w) => a + w.exercise_count, 0);

    const handleNewWorkout = async () => {
        setCreating(true);
        try {
            // Navigate to the new-workout naming screen
            navigate("/log");
        } finally {
            setCreating(false);
        }
    };

    const handleGenerateRoutine = async (category?: string) => {
        setShowCategoryModal(false);
        setGenerating(true);
        try {
            const w = await generateWorkout(category);
            navigate(`/log/${w.id}`);
        } catch (e) {
            console.error("Failed to generate", e);
            alert("Oops! The AI couldn't generate a routine right now. Try again.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <div className="mb-6 animate-slide-up">
                <h1 className="text-2xl md:text-3xl font-bold text-text">{d.title}</h1>
                <p className="text-text-secondary mt-1 text-sm">
                    {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                </p>
            </div>

            {/* Stats grid – 2 cols on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StatCard label={d.totalWorkouts} value={workouts.length} icon={CalendarDays} color="bg-brand-600" />
                <StatCard label={d.thisWeek} value={thisWeek.length} icon={Flame} color="bg-accent-500" />
                <StatCard label={d.totalSets} value={totalSets} icon={Dumbbell} color="bg-purple-600" />
                <StatCard label={d.exercisesTracked} value={totalExercises} icon={TrendingUp} color="bg-emerald-600" />
            </div>

            {/* Active / Start card */}
            <div className="card p-5 mb-6 animate-slide-up">
                {activeWorkout ? (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-emerald-400 text-sm font-semibold">{d.activeSession}</span>
                        </div>
                        <h2 className="text-lg font-bold text-text mb-0.5">{workoutDisplayName(activeWorkout)}</h2>
                        <p className="text-text-secondary text-sm mb-4">
                            {activeWorkout.exercise_count} {d.exercises} · {activeWorkout.set_count} {d.sets}
                        </p>
                        <button className="btn-primary w-full md:w-auto justify-center" onClick={() => navigate(`/log/${activeWorkout.id}`)}>
                            <Dumbbell className="w-4 h-4" /> {d.continueWorkout}
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <div className="w-14 h-14 rounded-2xl bg-brand-600/20 flex items-center justify-center mx-auto mb-3">
                            <Dumbbell className="w-7 h-7 text-brand-400" />
                        </div>
                        <h2 className="text-lg font-bold text-text mb-1">{d.readyToTrain}</h2>
                        <p className="text-text-secondary text-sm mb-4">{d.startPrompt}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                            <button className="btn-primary w-full justify-center" onClick={handleNewWorkout} disabled={creating || generating}>
                                <Plus className="w-4 h-4" />
                                {creating ? d.creating : d.newWorkout}
                            </button>
                            <button 
                                className="btn-secondary w-full justify-center bg-gradient-to-r from-purple-500/10 to-brand-500/10 border-brand-500/30 hover:border-brand-500/60 transition-colors" 
                                onClick={() => setShowCategoryModal(true)} 
                                disabled={creating || generating}
                            >
                                {generating ? <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" /> : <span>✨</span>}
                                {generating ? "Generando..." : "Auto-Generar"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Recent workouts */}
            <div>
                <h2 className="text-base font-bold text-text mb-3">{d.recentWorkouts}</h2>
                {loading ? (
                    <div className="text-text-secondary text-sm">{d.loading}</div>
                ) : workouts.length === 0 ? (
                    <div className="card p-8 text-center text-text-secondary"><p>{d.noWorkouts}</p></div>
                ) : (
                    <div className="space-y-2">
                        {workouts.slice(0, 6).map(w => (
                            <div
                                key={w.id}
                                className="card px-4 py-3 flex items-center justify-between cursor-pointer hover:border-brand-600/40 transition-colors animate-fade-in"
                                onClick={() => navigate(`/log/${w.id}`)}
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-text-secondary truncate">{workoutDisplayName(w)}</span>
                                        {w.is_finished
                                            ? <span className="badge bg-emerald-500/20 text-emerald-400 shrink-0">{d.completed}</span>
                                            : <span className="badge bg-amber-500/20 text-amber-400 shrink-0">{d.inProgress}</span>}
                                    </div>
                                    <p className="text-xs text-text-secondary mt-0.5">
                                        {new Date(w.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                        {" · "}{w.exercise_count} {d.exercises} · {w.set_count} {d.sets}
                                    </p>
                                </div>
                                <div className="text-text-muted shrink-0">›</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Category Selection Modal */}
            {showCategoryModal && (
                <div 
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setShowCategoryModal(false)}
                >
                    <div 
                        className="bg-surface border border-surface-border rounded-2xl w-full max-w-sm p-6 animate-slide-up shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-text flex items-center gap-2">
                                <span>✨</span> Objetivo de IA
                            </h2>
                            <button onClick={() => setShowCategoryModal(false)} className="text-text-secondary hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <p className="text-sm text-text-secondary mb-5">
                            ¿En qué querés enfocarte hoy? La Inteligencia Artificial va a elegir los mejores ejercicios para este objetivo.
                        </p>

                        <div className="flex flex-col gap-3">
                            {[
                                { id: "Torso Completo", icon: "🔥", label: "Torso Completo" },
                                { id: "Empuje", icon: "🏋️", label: "Empuje (Pecho, Hombros, Tríceps)" },
                                { id: "Jalón", icon: "💪", label: "Jalón (Espalda, Bíceps)" },
                                { id: "Piernas", icon: "🦵", label: "Piernas Completas" },
                                { id: "Artes Marciales", icon: "🥋", label: "Acondicionamiento Marcial" }
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleGenerateRoutine(cat.id)}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover hover:bg-brand-600/20 hover:border-brand-500/40 border border-transparent transition-all text-left"
                                >
                                    <span className="text-2xl">{cat.icon}</span>
                                    <span className="font-semibold text-text-secondary">{cat.label}</span>
                                </button>
                            ))}
                            
                            <button
                                onClick={() => handleGenerateRoutine()}
                                className="mt-2 text-sm text-text-secondary hover:text-brand-400 transition-colors text-center py-2"
                            >
                                Opciones avanzadas (Sorpréndeme) 🤔
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
