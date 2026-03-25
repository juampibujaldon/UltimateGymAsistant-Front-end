/**
 * Exercise metadata: icons, gradient colors, and bilingual names.
 * The key is the canonical English name (as stored in the DB).
 */

export interface ExerciseMeta {
    emoji: string;            // Visual emoji icon shown on the card
    gradient: string;         // Tailwind-compatible CSS gradient for card background
    nameEs: string;           // Spanish translation of the exercise name
}

// Maps English DB name → visual meta + Spanish name
export const EXERCISE_META: Record<string, ExerciseMeta> = {
    // ── Chest ──────────────────────────────────────────────────────────────────
    "Bench Press": { emoji: "🏋️", gradient: "from-blue-700 to-blue-900", nameEs: "Press de Banca" },
    "Incline Bench Press": { emoji: "📐", gradient: "from-indigo-700 to-indigo-900", nameEs: "Press Inclinado" },
    "Dumbbell Fly": { emoji: "🦅", gradient: "from-cyan-700 to-cyan-900", nameEs: "Apertura con Mancuernas" },
    // ── Legs ───────────────────────────────────────────────────────────────────
    "Squat": { emoji: "🦵", gradient: "from-emerald-700 to-emerald-900", nameEs: "Sentadilla" },
    "Front Squat": { emoji: "⬇️", gradient: "from-green-700 to-green-900", nameEs: "Sentadilla Frontal" },
    "Leg Press": { emoji: "🦿", gradient: "from-teal-700 to-teal-900", nameEs: "Prensa de Piernas" },
    "Romanian Deadlift": { emoji: "🔻", gradient: "from-lime-700 to-lime-900", nameEs: "Peso Muerto Rumano" },
    "Calf Raises": { emoji: "🦶", gradient: "from-green-600 to-emerald-800", nameEs: "Elevaciones de Talones" },
    // ── Back ───────────────────────────────────────────────────────────────────
    "Deadlift": { emoji: "💪", gradient: "from-rose-700 to-rose-900", nameEs: "Peso Muerto" },
    "Pull Ups": { emoji: "🙌", gradient: "from-red-700 to-red-900", nameEs: "Dominadas" },
    "Barbell Rows": { emoji: "🚣", gradient: "from-pink-700 to-pink-900", nameEs: "Remo con Barra" },
    "Cable Rows": { emoji: "〰️", gradient: "from-fuchsia-700 to-fuchsia-900", nameEs: "Remo en Polea" },
    "Lat Pulldown": { emoji: "⬇️", gradient: "from-purple-700 to-purple-900", nameEs: "Jalón al Pecho" },
    // ── Shoulders ──────────────────────────────────────────────────────────────
    "Overhead Press": { emoji: "🔝", gradient: "from-amber-600 to-amber-900", nameEs: "Press Militar" },
    "Lateral Raises": { emoji: "↔️", gradient: "from-yellow-600 to-yellow-900", nameEs: "Elevaciones Laterales" },
    "Face Pulls": { emoji: "🎯", gradient: "from-orange-600 to-orange-900", nameEs: "Face Pulls" },
    // ── Biceps ─────────────────────────────────────────────────────────────────
    "Barbell Curl": { emoji: "💪", gradient: "from-sky-600 to-sky-900", nameEs: "Curl con Barra" },
    "Hammer Curl": { emoji: "🔨", gradient: "from-blue-600 to-blue-800", nameEs: "Curl Martillo" },
    // ── Triceps ────────────────────────────────────────────────────────────────
    "Tricep Pushdown": { emoji: "👇", gradient: "from-violet-600 to-violet-900", nameEs: "Extensión de Tríceps" },
    "Close Grip Bench Press": { emoji: "🤏", gradient: "from-purple-600 to-purple-900", nameEs: "Press Agarre Cerrado" },
    // ── Glutes / Core ──────────────────────────────────────────────────────────
    "Hip Thrust": { emoji: "🍑", gradient: "from-pink-600 to-pink-900", nameEs: "Hip Thrust" },
    "Plank": { emoji: "🧱", gradient: "from-slate-600 to-slate-900", nameEs: "Plancha" },
};

/** Fallback for exercises not in the map (custom or new). */
export const DEFAULT_META: ExerciseMeta = {
    emoji: "⭐",
    gradient: "from-brand-600 to-brand-900",
    nameEs: "",
};

/** Return the display name in the given language. */
export function getExerciseDisplayName(englishName: string, lang: "en" | "es"): string {
    if (lang === "en") return englishName;
    const meta = EXERCISE_META[englishName];
    return meta?.nameEs || englishName; // Fall back to English if no ES translation
}

/** Return the visual meta for an exercise. */
export function getExerciseMeta(englishName: string): ExerciseMeta {
    return EXERCISE_META[englishName] ?? DEFAULT_META;
}
