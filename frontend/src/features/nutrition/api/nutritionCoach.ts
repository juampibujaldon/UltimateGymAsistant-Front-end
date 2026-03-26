import apiClient from "../../../api/client";
import type { NutritionProfileInput, NutritionRecommendation } from "../domain/types";

const STORAGE_KEY = "gym_ai_nutrition_profile_v1";

const ACTIVITY_FACTOR = {
  low: 1.35,
  moderate: 1.55,
  high: 1.75,
} as const;

const GOAL_DELTA = {
  lose: {
    gentle: -250,
    standard: -400,
    aggressive: -550,
  },
  maintain: {
    gentle: 0,
    standard: 0,
    aggressive: 0,
  },
  gain: {
    gentle: 180,
    standard: 280,
    aggressive: 380,
  },
} as const;

export function loadNutritionProfile(): NutritionProfileInput | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NutritionProfileInput) : null;
  } catch {
    return null;
  }
}

export function saveNutritionProfile(profile: NutritionProfileInput) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function computeLocalRecommendation(profile: NutritionProfileInput, language: string): NutritionRecommendation {
  const bmr =
    10 * profile.weightKg +
    6.25 * profile.heightCm -
    5 * profile.age +
    (profile.sex === "male" ? 5 : -161);
  const maintenanceCalories = Math.round(bmr * ACTIVITY_FACTOR[profile.activityLevel]);
  const calorieTarget = Math.round(
    maintenanceCalories + GOAL_DELTA[profile.goalDirection][profile.weeklyRate],
  );
  const proteinTarget = Math.round(
    profile.weightKg *
      (profile.goalDirection === "gain" ? 2 : profile.goalDirection === "lose" ? 2.1 : 1.8),
  );
  const fatTarget = Math.round(profile.weightKg * 0.8);
  const carbsTarget = Math.max(
    80,
    Math.round((calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4),
  );

  const isSpanish = language === "es";
  const reasoning = isSpanish
    ? `Calculé tu mantenimiento en ${maintenanceCalories} kcal y ajusté a ${calorieTarget} kcal según tu objetivo de ${profile.goalDirection === "lose" ? "bajar" : profile.goalDirection === "gain" ? "subir" : "mantener"} peso.`
    : `I estimated your maintenance at ${maintenanceCalories} kcal and adjusted to ${calorieTarget} kcal based on your ${profile.goalDirection} goal.`;
  const aiSummary = isSpanish
    ? `Prioriza constancia semanal. Si en 2 semanas tu peso no cambia como esperas, ajusta entre 100 y 150 kcal por día.`
    : `Prioritize weekly consistency. If your weight does not move as expected after 2 weeks, adjust by 100 to 150 kcal per day.`;

  return {
    calorieTarget,
    proteinTarget,
    carbsTarget,
    fatTarget,
    maintenanceCalories,
    reasoning,
    aiSummary,
  };
}

export async function generateNutritionRecommendation(
  profile: NutritionProfileInput,
  language: string,
): Promise<NutritionRecommendation> {
  saveNutritionProfile(profile);
  const localRecommendation = computeLocalRecommendation(profile, language);

  try {
    await apiClient.patch("/auth/me", {
      weight: profile.weightKg,
      height: profile.heightCm,
      goal: profile.objective,
    });

    const { data } = await apiClient.get(`/auth/me/insights?lang=${language}`);

    return {
      ...localRecommendation,
      aiSummary: data.insights || localRecommendation.aiSummary,
    };
  } catch {
    return localRecommendation;
  }
}
