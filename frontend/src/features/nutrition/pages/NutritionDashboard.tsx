import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Flame, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLanguage } from "../../../context/LanguageContext";
import type { NutritionMealEntry } from "../../../types";
import { generateNutritionRecommendation, loadNutritionProfile } from "../api/nutritionCoach";
import BarcodeScannerModal from "../components/BarcodeScannerModal";
import GoalEditor from "../components/GoalEditor";
import MacroProgress from "../components/MacroProgress";
import MealSection from "../components/MealSection";
import NutritionInsights from "../components/NutritionInsights";
import NutritionSetupCard from "../components/NutritionSetupCard";
import { MEAL_TYPES } from "../domain/constants";
import type { MealType, NutritionProfileInput, NutritionRecommendation } from "../domain/types";
import { useNutrition } from "../hooks";

function getDefaultProfile(language: string): NutritionProfileInput {
  return {
    age: 28,
    sex: "male",
    weightKg: 78,
    heightCm: 178,
    activityLevel: "moderate",
    goalDirection: "maintain",
    weeklyRate: "standard",
    objective: language === "es" ? "Mejorar composición corporal y sostener energía" : "Improve body composition and keep energy stable",
  };
}

export default function NutritionDashboard() {
  const { language } = useLanguage();
  const {
    summary,
    history,
    dailyInsight,
    weeklyInsight,
    loading,
    saving,
    error,
    currentDay,
    setCurrentDay,
    refresh,
    createMeal,
    deleteMeal,
    addFood,
    deleteFood,
    updateFood,
    updateGoals,
    lookupBarcode,
  } = useNutrition();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanMeal, setScanMeal] = useState<NutritionMealEntry | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [recommendation, setRecommendation] = useState<NutritionRecommendation | null>(null);
  const [profile, setProfile] = useState<NutritionProfileInput>(() => loadNutritionProfile() ?? getDefaultProfile("es"));

  const labels = useMemo(
    () =>
      language === "es"
        ? {
            title: "Nutrición",
            subtitle: "Primero define tu objetivo. Después registra comida de forma rápida y mira si vas arriba o abajo de tus calorías.",
            calories: "Calorías",
            protein: "Proteína",
            carbs: "Carbohidratos",
            fat: "Grasas",
            remaining: "Restante",
            goalTitle: "Ajuste manual de metas",
            goalSubtitle: "Puedes afinar las calorías y macros recomendadas antes de empezar a registrar.",
            save: "Guardar objetivos",
            saving: "Guardando...",
            breakfast: "Desayuno",
            lunch: "Almuerzo",
            dinner: "Cena",
            snack: "Snacks",
            foodName: "Alimento",
            addFood: "Agregar alimento",
            saveFood: "Guardar alimento",
            manualHint: "Carga rápida por alimento, gramos y macros.",
            manualEntry: "Manual",
            scanTitle: "Escanear código de barras",
            scanHint: "Escanea un producto o pega el código para autocompletar macros.",
            cameraError: "No pudimos acceder a la cámara. Usa el código manual.",
            manualCode: "Código manual",
            dailyInsight: "Qué te conviene hoy",
            weeklyInsight: "Lectura semanal",
            emptyDailyInsight: "Empieza cargando comidas para recibir una recomendación diaria.",
            emptyWeeklyInsight: "Cuando registres varios días vas a ver una lectura semanal más útil.",
            loading: "Cargando nutrición...",
            date: "Fecha",
            mealLabel: "Comida",
            coachLabel: "Coach",
            scanShort: "Escanear",
            emptyMeal: "Todavía no cargaste nada aquí.",
            summaryCardTitle: "Resumen del día",
            summaryCardBody: "Revisa rápido si estás cerca de tus calorías y si necesitas ajustar proteína o carbohidratos.",
            quickStats: "Hoy",
            trackedMeals: "Comidas con carga",
            expandMeal: "Expandir",
            collapseMeal: "Minimizar",
            setupEyebrow: "Paso 1",
            setupTitle: "Define tus datos y objetivo",
            setupSubtitle: "Primero configurás tu perfil, después recibís una meta diaria clara para empezar a registrar.",
            age: "Edad",
            sex: "Sexo",
            male: "Hombre",
            female: "Mujer",
            weight: "Peso (kg)",
            height: "Altura (cm)",
            activity: "Actividad",
            lowActivity: "Baja",
            moderateActivity: "Media",
            highActivity: "Alta",
            goalDirection: "Objetivo",
            lose: "Bajar grasa",
            maintain: "Mantener",
            gain: "Subir masa",
            rate: "Ritmo",
            gentle: "Suave",
            standard: "Estándar",
            aggressive: "Agresivo",
            objective: "Meta concreta",
            objectivePlaceholder: "Ej: perder grasa sin perder rendimiento",
            generatePlan: "Generar plan con IA",
            generating: "Generando plan...",
            aiCoach: "IA / Gemini",
            recommendationTitle: "Plan recomendado",
            recommendationEmpty: "Completa tus datos y genera una recomendación para fijar calorías y macros diarios.",
            maintenance: "Mantenimiento",
            targetCalories: "Meta diaria",
            applyPlan: "Usar estas metas",
            progressTitle: "Tendencia semanal",
            progressSubtitle: "Si el promedio queda muy alto o muy bajo frente a tu meta, ajusta 100 a 150 kcal.",
            aboveTarget: "Encima de tu meta",
            belowTarget: "Debajo de tu meta",
            onTarget: "Muy cerca del objetivo",
          }
        : {
            title: "Nutrition",
            subtitle: "Set your goal first. Then log food quickly and check whether you are above or below your calorie target.",
            calories: "Calories",
            protein: "Protein",
            carbs: "Carbs",
            fat: "Fat",
            remaining: "Remaining",
            goalTitle: "Manual target adjustment",
            goalSubtitle: "You can fine tune the recommended calories and macros before logging food.",
            save: "Save targets",
            saving: "Saving...",
            breakfast: "Breakfast",
            lunch: "Lunch",
            dinner: "Dinner",
            snack: "Snacks",
            foodName: "Food",
            addFood: "Add food",
            saveFood: "Save food",
            manualHint: "Quick entry by food, grams and macros.",
            manualEntry: "Manual",
            scanTitle: "Scan barcode",
            scanHint: "Scan a product or paste the code to autofill macros.",
            cameraError: "Camera access failed. Use manual code entry.",
            manualCode: "Manual code",
            dailyInsight: "Best move for today",
            weeklyInsight: "Weekly read",
            emptyDailyInsight: "Start logging meals to receive a daily recommendation.",
            emptyWeeklyInsight: "Once you log several days, the weekly read becomes more useful.",
            loading: "Loading nutrition...",
            date: "Date",
            mealLabel: "Meal",
            coachLabel: "Coach",
            scanShort: "Scan",
            emptyMeal: "Nothing logged here yet.",
            summaryCardTitle: "Daily summary",
            summaryCardBody: "Quickly check whether you are near calories and whether protein or carbs need a small correction.",
            quickStats: "Today",
            trackedMeals: "Meals logged",
            expandMeal: "Expand",
            collapseMeal: "Collapse",
            setupEyebrow: "Step 1",
            setupTitle: "Set your body data and goal",
            setupSubtitle: "Set your profile first, then get a clear daily target before you start logging.",
            age: "Age",
            sex: "Sex",
            male: "Male",
            female: "Female",
            weight: "Weight (kg)",
            height: "Height (cm)",
            activity: "Activity",
            lowActivity: "Low",
            moderateActivity: "Moderate",
            highActivity: "High",
            goalDirection: "Goal",
            lose: "Lose fat",
            maintain: "Maintain",
            gain: "Gain muscle",
            rate: "Rate",
            gentle: "Gentle",
            standard: "Standard",
            aggressive: "Aggressive",
            objective: "Specific outcome",
            objectivePlaceholder: "Ex: lose fat while keeping training performance",
            generatePlan: "Generate plan with AI",
            generating: "Generating plan...",
            aiCoach: "AI / Gemini",
            recommendationTitle: "Recommended plan",
            recommendationEmpty: "Complete your data and generate a recommendation to set daily calories and macros.",
            maintenance: "Maintenance",
            targetCalories: "Daily target",
            applyPlan: "Use these targets",
            progressTitle: "Weekly trend",
            progressSubtitle: "If your average is far above or below target, adjust by 100 to 150 kcal.",
            aboveTarget: "Above target",
            belowTarget: "Below target",
            onTarget: "Very close to target",
          },
    [language],
  );

  useEffect(() => {
    setProfile(loadNutritionProfile() ?? getDefaultProfile(language));
  }, [language]);

  useEffect(() => {
    void refresh(currentDay, language);
  }, [currentDay, language, refresh]);

  const mealsByType = useMemo(() => new Map(summary?.meals.map((meal) => [meal.meal_type, meal]) ?? []), [summary?.meals]);

  const trackedMealsCount = summary?.meals.filter((meal) => meal.foods.length > 0).length ?? 0;
  const weeklyAverage = history.reduce((acc, point) => acc + point.calories, 0) / Math.max(1, history.length);
  const weeklyDelta = summary ? weeklyAverage - summary.goals.calorie_target : 0;
  const weeklyStatus =
    Math.abs(weeklyDelta) <= 120 ? labels.onTarget : weeklyDelta > 0 ? labels.aboveTarget : labels.belowTarget;

  const handleEnsureMeal = async (mealType: MealType) => {
    const existingMeal = mealsByType.get(mealType);
    if (existingMeal) return existingMeal;
    return createMeal(mealType, currentDay, language);
  };

  const handleScanDetected = async (barcode: string) => {
    if (!scanMeal) return;
    const product = await lookupBarcode(barcode);
    const grams = product.default_grams || 100;

    await addFood(
      scanMeal.id,
      {
        name: product.name,
        brand: product.brand,
        barcode: product.barcode,
        grams,
        quantity: 1,
        unit: "g",
        calories: (product.calories_per_100g * grams) / 100,
        protein: (product.protein_per_100g * grams) / 100,
        carbs: (product.carbs_per_100g * grams) / 100,
        fat: (product.fat_per_100g * grams) / 100,
        fiber: product.fiber_per_100g ? (product.fiber_per_100g * grams) / 100 : null,
        sugar: product.sugar_per_100g ? (product.sugar_per_100g * grams) / 100 : null,
        source: product.source,
      },
      language,
    );

    setScannerOpen(false);
    setScanMeal(null);
  };

  if (loading && !summary) {
    return <div className="py-12 text-center text-text-secondary">{labels.loading}</div>;
  }

  if (!summary) {
    return <div className="py-12 text-center text-red-300">{error || labels.loading}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="hero-panel overflow-hidden rounded-[2.25rem] p-6 md:p-8">
        <div className="relative z-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-text-muted">{labels.quickStats}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-text md:text-5xl">{labels.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary md:text-base">{labels.subtitle}</p>
          </div>

          <div className="grid gap-3">
            <div className="glass-panel rounded-[1.7rem] p-4">
              <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-text-muted">
                <CalendarDays className="h-4 w-4" />
                {labels.date}
              </label>
              <input className="input" type="date" value={currentDay} onChange={(event) => setCurrentDay(event.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1.3rem] border border-white/8 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">{labels.calories}</p>
                <p className="mt-2 text-2xl font-bold text-text">{summary.totals.calories.toFixed(0)}</p>
              </div>
              <div className="rounded-[1.3rem] border border-white/8 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">{labels.trackedMeals}</p>
                <p className="mt-2 text-2xl font-bold text-text">{trackedMealsCount}/4</p>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />
      </section>

      <NutritionSetupCard
        initialProfile={profile}
        recommendation={recommendation}
        loading={generatingPlan}
        labels={labels}
        onGenerate={async (nextProfile) => {
          setGeneratingPlan(true);
          setProfile(nextProfile);
          try {
            const result = await generateNutritionRecommendation(nextProfile, language);
            setRecommendation(result);
          } finally {
            setGeneratingPlan(false);
          }
        }}
        onApplyRecommendation={async () => {
          if (!recommendation) return;
          await updateGoals(
            {
              calorie_target: recommendation.calorieTarget,
              protein_target: recommendation.proteinTarget,
              carbs_target: recommendation.carbsTarget,
              fat_target: recommendation.fatTarget,
            },
            language,
          );
        }}
      />

      {error && <div className="rounded-[1.4rem] border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-200">{error}</div>}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MacroProgress title={labels.calories} consumed={summary.totals.calories} target={summary.goals.calorie_target} unit="kcal" accentClass="bg-brand-500" iconKey="calories" />
        <MacroProgress title={labels.protein} consumed={summary.totals.protein} target={summary.goals.protein_target} unit="g" accentClass="bg-emerald-500" iconKey="protein" />
        <MacroProgress title={labels.carbs} consumed={summary.totals.carbs} target={summary.goals.carbs_target} unit="g" accentClass="bg-amber-500" iconKey="carbs" />
        <MacroProgress title={labels.fat} consumed={summary.totals.fat} target={summary.goals.fat_target} unit="g" accentClass="bg-rose-500" iconKey="fat" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="glass-panel rounded-[2rem] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-brand-500/15 p-3">
                <Flame className="h-5 w-5 text-brand-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-text-muted">{labels.quickStats}</p>
                <h3 className="text-lg font-semibold text-text">{labels.summaryCardTitle}</h3>
              </div>
            </div>
            <p className="text-sm leading-7 text-text-secondary">{labels.summaryCardBody}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">{labels.remaining}</p>
                <p className="mt-2 text-2xl font-bold text-text">{summary.remaining.calories.toFixed(0)}</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">{labels.protein}</p>
                <p className="mt-2 text-2xl font-bold text-text">{summary.remaining.protein.toFixed(0)}g</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">{labels.quickStats}</p>
                <p className="mt-2 text-lg font-semibold text-text">{weeklyStatus}</p>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {MEAL_TYPES.map((mealType) => (
              <MealSection
                key={mealType}
                title={labels[mealType]}
                mealType={mealType}
                meal={mealsByType.get(mealType)}
                labels={labels}
                saving={saving}
                onCreateMeal={async (targetMealType) => handleEnsureMeal(targetMealType)}
                onDeleteMeal={async (mealId) => deleteMeal(mealId, language)}
                onDeleteFood={async (foodId) => deleteFood(foodId, language)}
                onUpdateFood={async (foodId, payload) => updateFood(foodId, payload, language).then(() => undefined)}
                onAddManualFood={async (mealId, payload) => {
                  await addFood(mealId, { ...payload, quantity: 1, unit: "g", source: "manual" }, language);
                }}
                onScanFood={(meal) => {
                  setScanMeal(meal);
                  setScannerOpen(true);
                }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <GoalEditor
            key={summary.goals.updated_at}
            goal={summary.goals}
            saving={saving}
            labels={labels}
            onSave={async (payload) => {
              await updateGoals(payload, language);
            }}
          />

          <NutritionInsights dailyInsight={dailyInsight} weeklyInsight={weeklyInsight} loading={loading} labels={labels} />

          <section className="glass-panel rounded-[2rem] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/15 p-3">
                <TrendingUp className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-text-muted">{labels.progressTitle}</p>
                <h3 className="text-lg font-semibold text-text">{labels.progressSubtitle}</h3>
              </div>
            </div>
            <div className="mb-3 rounded-[1.2rem] border border-white/8 bg-white/4 px-4 py-3 text-sm text-text-secondary">
              {labels.calories}: {weeklyAverage.toFixed(0)} kcal promedio semanal
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="nutritionCalories" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.42} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#8fa3bf", fontSize: 12 }} tickFormatter={(value) => value.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#8fa3bf", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(7, 16, 25, 0.96)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      color: "#fff",
                    }}
                  />
                  <Area type="monotone" dataKey="calories" stroke="#60a5fa" fill="url(#nutritionCalories)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>

      <BarcodeScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} onDetected={handleScanDetected} labels={labels} />
    </div>
  );
}
