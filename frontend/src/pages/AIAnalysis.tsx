/**
 * AI Analysis – card list of finished workouts, click to analyze.
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { BrainCircuit, Loader2, Zap, ChevronRight, Calendar } from "lucide-react";
import { listWorkouts } from "../api/workouts";
import { analyzeWorkout } from "../api/analysis";
import { useLanguage } from "../context/LanguageContext";
import type { WorkoutSummary } from "../types";

function WorkoutCard({ w, onAnalyze, isSelected, isAnalyzing }: {
    w: WorkoutSummary;
    onAnalyze: (id: number) => void;
    isSelected: boolean;
    isAnalyzing: boolean;
}) {
    const { t } = useLanguage();
    const A = t.analysis;
    const displayName = w.name && w.name.trim()
        ? w.name
        : new Date(w.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

    return (
        <div className={`card px-4 py-4 flex items-center justify-between gap-3 transition-all duration-200
            ${isSelected ? "border-brand-500/50 bg-brand-600/10" : "hover:border-surface-border"}`}>
            <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${isSelected ? "bg-brand-600" : "bg-surface-hover"}`}>
                    <Calendar className={`w-5 h-5 ${isSelected ? "text-white" : "text-text-secondary"}`} />
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-text truncate">{displayName}</p>
                    <p className="text-xs text-text-secondary">
                        {new Date(w.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        {" · "}{w.exercise_count} {A.exercises} · {w.set_count} {A.sets}
                    </p>
                </div>
            </div>
            <button
                onClick={() => onAnalyze(w.id)}
                disabled={isAnalyzing}
                className="btn-primary shrink-0 py-2 px-4 text-sm"
            >
                {isAnalyzing && isSelected
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Zap className="w-4 h-4" />}
                {isAnalyzing && isSelected ? A.analyzing : A.analyzeButton}
            </button>
        </div>
    );
}

export default function AIAnalysis() {
    const [searchParams] = useSearchParams();
    const { t, language } = useLanguage();
    const A = t.analysis;

    const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listWorkouts().then(ws => {
            const finished = ws.filter(w => w.is_finished);
            setWorkouts(finished);
            const preselect = searchParams.get("workout");
            if (preselect) setSelectedId(parseInt(preselect));
        });
    }, [searchParams]);

    const handleAnalyze = async (id: number) => {
        if (analyzing) return;
        setSelectedId(id); setAnalysis(null); setError(null); setAnalyzing(true);
        try {
            const res = await analyzeWorkout(id, language);
            setAnalysis(res.analysis);
        } catch (err) {
            const error = err as { response?: { data?: { detail?: string } } };
            setError(error?.response?.data?.detail || A.errorRetry);
        } finally { setAnalyzing(false); }
    };

    const selected = workouts.find(w => w.id === selectedId);

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="mb-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-brand-600 flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text">{A.title}</h1>
                </div>
                <p className="text-text-secondary mt-1 ml-12">{A.subtitle}</p>
            </div>

            {/* Workout list */}
            <div className="mb-6">
                <h2 className="font-semibold text-text-secondary mb-3">{A.selectWorkout}</h2>
                {workouts.length === 0 ? (
                    <div className="card p-8 text-center text-text-secondary">
                        <ChevronRight className="w-10 h-10 mx-auto mb-2 text-surface-border" />
                        <p>{A.noWorkouts}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {workouts.map(w => (
                            <WorkoutCard
                                key={w.id}
                                w={w}
                                onAnalyze={handleAnalyze}
                                isSelected={selectedId === w.id}
                                isAnalyzing={analyzing}
                            />
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="card p-4 mb-6 border-red-500/30 bg-red-500/10 text-red-400 text-sm animate-fade-in">
                    {error}
                </div>
            )}

            {analyzing && (
                <div className="card p-10 text-center animate-pulse-slow">
                    <BrainCircuit className="w-12 h-12 text-brand-400 mx-auto mb-4" />
                    <p className="text-text-secondary font-medium">{A.loadingMessage}</p>
                    <p className="text-text-secondary text-sm mt-1">{A.loadingSubMessage}</p>
                </div>
            )}

            {analysis && !analyzing && (
                <div className="card p-5 md:p-6 animate-slide-up">
                    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-surface-border">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-brand-600 flex items-center justify-center">
                            <BrainCircuit className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-text">{A.feedbackTitle}</h2>
                            {selected && (
                                <p className="text-xs text-text-secondary">
                                    {selected.name?.trim() || new Date(selected.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="markdown-content"><ReactMarkdown>{analysis}</ReactMarkdown></div>
                </div>
            )}
        </div>
    );
}
