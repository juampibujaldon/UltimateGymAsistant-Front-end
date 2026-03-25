/**
 * Progress – PR overview grid + expandable exercise charts.
 */

import { useEffect, useState } from "react";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { getExercises } from "../api/exercises";
import { getProgress } from "../api/analysis";
import { getExerciseDisplayName, getExerciseMeta } from "../data/exerciseMeta";
import { useLanguage } from "../context/LanguageContext";
import type { Exercise, ProgressData } from "../types";
import type { Language } from "../i18n/translations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface border border-surface-border rounded-xl px-3 py-2 text-sm shadow-xl">
                <p className="text-text-secondary mb-1">{label}</p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {payload.map((p: any) => (
                    <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
                        {p.name}: {p.value.toFixed(1)} kg
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// ─── Exercise Chart Expanded ───────────────────────────────────────────────────
function ExerciseCharts({ exercise, lang }: { exercise: Exercise; lang: Language }) {
    const { t } = useLanguage();
    const P = t.progress;
    const [data, setData] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProgress(exercise.id).then(setData).finally(() => setLoading(false));
    }, [exercise.id]);

    const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const displayName = getExerciseDisplayName(exercise.name, lang);

    if (loading) return <div className="py-4 text-center text-text-secondary text-sm animate-pulse">{P.loading}</div>;
    if (!data) return null;

    const pr = data.personal_record;
    const oneRMData = data.one_rm_history.map(p => ({ date: fmt(p.date), [P.est1rm]: p.estimated_1rm }));
    const volData = data.volume_history.map(p => ({ date: fmt(p.date), [P.volume]: p.volume }));

    return (
        <div className="card p-4 md:p-5 animate-slide-up space-y-5">
            {/* PR banner */}
            {pr ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                        <p className="text-xs text-amber-400 font-semibold">{P.prTitle}</p>
                        <p className="text-text font-bold">{pr.weight}kg × {pr.reps} reps</p>
                        <p className="text-xs text-text-secondary">{P.prLabel} <span className="text-amber-300 font-semibold">{pr.estimated_1rm}kg</span></p>
                    </div>
                </div>
            ) : (
                <p className="text-text-secondary text-sm">{P.noData} {displayName} {P.noDataSuffix}</p>
            )}

            {/* 1RM chart */}
            {oneRMData.length >= 2 && (
                <div>
                    <p className="text-sm font-semibold text-text-secondary mb-1">{P.oneRmTitle}</p>
                    <p className="text-xs text-text-secondary mb-3">{P.oneRmSubtitle}</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={oneRMData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} unit="kg" width={45} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey={P.est1rm} stroke="#0ea5e9" strokeWidth={2.5}
                                dot={{ fill: "#0ea5e9", r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Volume chart */}
            {volData.length >= 1 && (
                <div>
                    <p className="text-sm font-semibold text-text-secondary mb-1">{P.volumeTitle}</p>
                    <p className="text-xs text-text-secondary mb-3">{P.volumeSubtitle}</p>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={volData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} unit="kg" width={45} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey={P.volume} fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {oneRMData.length < 2 && volData.length < 1 && (
                <p className="text-text-secondary text-sm">{P.noChartData} {displayName} {P.noChartDataSuffix}</p>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Progress() {
    const { t, language } = useLanguage();
    const P = t.progress;

    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [openId, setOpenId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getExercises().then(setExercises).finally(() => setLoading(false));
    }, []);

    const toggle = (id: number) => setOpenId(prev => prev === id ? null : id);

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <div className="mb-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-brand-600 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text">{P.title}</h1>
                </div>
                <p className="text-text-secondary mt-1 ml-12">{P.subtitle}</p>
            </div>

            {loading ? (
                <div className="text-text-secondary text-sm animate-pulse py-8 text-center">{P.loading}</div>
            ) : (
                <div className="space-y-3">
                    {exercises.map(ex => (
                        <div key={ex.id}>
                            {/* Collapsed exercise row */}
                            <button
                                onClick={() => toggle(ex.id)}
                                className={`w-full card px-4 py-3 flex items-center gap-3 justify-between transition-all duration-200
                                    ${openId === ex.id ? "border-brand-500/40 rounded-b-none" : "hover:border-surface-border"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getExerciseMeta(ex.name).gradient} flex items-center justify-center text-lg`}>
                                        {getExerciseMeta(ex.name).emoji}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-text text-sm">
                                            {getExerciseDisplayName(ex.name, language as Language)}
                                        </p>
                                        {ex.muscle_group && (
                                            <p className="text-xs text-text-secondary">{ex.muscle_group}</p>
                                        )}
                                    </div>
                                </div>
                                {openId === ex.id
                                    ? <ChevronUp className="w-4 h-4 text-text-secondary" />
                                    : <ChevronDown className="w-4 h-4 text-text-secondary" />}
                            </button>

                            {/* Expanded charts */}
                            {openId === ex.id && (
                                <div className="rounded-b-xl overflow-hidden border border-t-0 border-brand-500/40">
                                    <ExerciseCharts exercise={ex} lang={language as Language} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
