/**
 * New Workout – name your routine then start the session.
 * Replaces the old /log redirect-to-home behavior.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, ArrowRight, Zap } from "lucide-react";
import { createWorkout } from "../api/workouts";
import { useLanguage } from "../context/LanguageContext";

const QUICK_NAMES_EN = [
    "Push Day", "Pull Day", "Leg Day",
    "Upper Body", "Lower Body", "Full Body",
    "Chest & Triceps", "Back & Biceps", "Shoulders",
];

const QUICK_NAMES_ES = [
    "Día de Empuje", "Día de Tirón", "Día de Piernas",
    "Tren Superior", "Tren Inferior", "Cuerpo Completo",
    "Pecho y Tríceps", "Espalda y Bíceps", "Hombros",
];

export default function NewWorkout() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [name, setName] = useState("");
    const [creating, setCreating] = useState(false);

    const quickNames = language === "es" ? QUICK_NAMES_ES : QUICK_NAMES_EN;

    const handleCreate = async (overrideName?: string) => {
        if (creating) return;
        setCreating(true);
        try {
            const workout = await createWorkout(overrideName ?? name.trim());
            navigate(`/log/${workout.id}`);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-md animate-slide-up">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-2xl shadow-brand-500/30">
                        <Dumbbell className="w-10 h-10 text-white" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-text text-center mb-1">
                    {language === "es" ? "¿Qué día es hoy?" : "What's today's workout?"}
                </h1>
                <p className="text-text-secondary text-sm text-center mb-8">
                    {language === "es"
                        ? "Nombrá tu rutina para encontrarla fácil después"
                        : "Name your routine to find it easily later"}
                </p>

                {/* Quick-select chips */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {quickNames.map((n) => (
                        <button
                            key={n}
                            onClick={() => handleCreate(n)}
                            disabled={creating}
                            className="px-3 py-1.5 rounded-xl text-sm font-medium bg-surface-hover border border-surface-border
                                       text-text-secondary hover:bg-brand-600/30 hover:border-brand-500 hover:text-brand-300
                                       transition-all duration-150 active:scale-95"
                        >
                            {n}
                        </button>
                    ))}
                </div>

                {/* Custom name input */}
                <div className="card p-5 space-y-4">
                    <div className="relative">
                        <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            className="input pl-10"
                            placeholder={language === "es" ? "Nombre personalizado..." : "Custom name..."}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                            autoFocus
                        />
                    </div>

                    <button
                        onClick={() => handleCreate()}
                        disabled={creating}
                        className="btn-primary w-full justify-center py-3 text-base"
                    >
                        <ArrowRight className="w-5 h-5" />
                        {creating
                            ? (language === "es" ? "Creando..." : "Creating...")
                            : (language === "es" ? "Comenzar sesión" : "Start Session")}
                    </button>
                </div>
            </div>
        </div>
    );
}
