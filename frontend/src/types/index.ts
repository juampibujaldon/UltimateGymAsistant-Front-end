/**
 * TypeScript type definitions for the Gym AI Coach app.
 */

export interface User {
    id: number;
    email: string;
    full_name: string | null;
    weight?: number | null;
    height?: number | null;
    goal?: string | null;
    is_active: boolean;
    created_at: string;
}

export interface Token {
    access_token: string;
    token_type: string;
}

export interface Exercise {
    id: number;
    name: string;
    muscle_group: string | null;
    is_custom: boolean;
    created_at: string;
}

export interface Set {
    id: number;
    workout_exercise_id: number;
    set_number: number;
    weight: number;
    reps: number;
    rir: number | null;
    notes: string | null;
    created_at: string;
}

export interface WorkoutExercise {
    id: number;
    workout_id: number;
    exercise_id: number;
    order: number;
    exercise: Exercise;
    sets: Set[];
}

export interface Workout {
    id: number;
    name: string | null;
    date: string;
    notes: string | null;
    is_finished: boolean;
    created_at: string;
    workout_exercises: WorkoutExercise[];
    user_id: number;
}

export interface WorkoutSummary {
    id: number;
    name: string | null;
    date: string;
    notes: string | null;
    is_finished: boolean;
    exercise_count: number;
    set_count: number;
}

export interface ProgressData {
    exercise_id: number;
    exercise_name: string;
    one_rm_history: { date: string; estimated_1rm: number; weight: number; reps: number }[];
    volume_history: { date: string; volume: number }[];
    personal_record: { weight: number; reps: number; estimated_1rm: number; date: string } | null;
}

export interface AnalysisResponse {
    workout_id: number;
    analysis: string;
}
