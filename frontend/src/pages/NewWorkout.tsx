import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Dumbbell, Zap } from "lucide-react";
import { createWorkout } from "../api/workouts";
import { useLanguage } from "../context/LanguageContext";

const QUICK_NAMES_EN = [
  "Push Day",
  "Pull Day",
  "Leg Day",
  "Upper Body",
  "Lower Body",
  "Full Body",
  "Chest & Triceps",
  "Back & Biceps",
  "Shoulders",
];

const QUICK_NAMES_ES = [
  "Dia de Empuje",
  "Dia de Tiron",
  "Dia de Piernas",
  "Tren Superior",
  "Tren Inferior",
  "Cuerpo Completo",
  "Pecho y Triceps",
  "Espalda y Biceps",
  "Hombros",
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
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="w-full max-w-xl animate-slide-up">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-2xl shadow-brand-500/30">
            <Dumbbell className="h-10 w-10 text-white" />
          </div>
        </div>

        <h1 className="mb-1 text-center text-2xl font-bold text-text">
          {language === "es" ? "Que dia es hoy?" : "What is today's workout?"}
        </h1>
        <p className="mb-8 text-center text-sm text-text-secondary">
          {language === "es"
            ? "Ponle un nombre facil de encontrar y empieza a registrar."
            : "Give it a clear name and start logging fast."}
        </p>

        <div className="glass-panel mb-6 rounded-[2rem] p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-text-muted">
            {language === "es" ? "Plantillas rapidas" : "Quick templates"}
          </p>
          <div className="flex flex-wrap gap-2">
            {quickNames.map((quickName) => (
              <button
                key={quickName}
                onClick={() => handleCreate(quickName)}
                disabled={creating}
                className="rounded-2xl border border-surface-border bg-surface-hover px-3 py-2 text-sm font-medium text-text-secondary transition-all duration-150 hover:border-brand-500 hover:bg-brand-500/12 hover:text-text"
                type="button"
              >
                {quickName}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-5">
          <div className="relative">
            <Zap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              className="input pl-10"
              placeholder={language === "es" ? "Nombre personalizado..." : "Custom name..."}
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>

          <button
            onClick={() => handleCreate()}
            disabled={creating}
            className="btn-primary mt-4 w-full justify-center py-3 text-base"
            type="button"
          >
            <ArrowRight className="h-5 w-5" />
            {creating
              ? language === "es"
                ? "Creando..."
                : "Creating..."
              : language === "es"
                ? "Comenzar sesion"
                : "Start session"}
          </button>
        </div>
      </div>
    </div>
  );
}
