import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Flame, ScanBarcode, Sparkles, Target } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  addMealFood,
  createMealEntry,
  deleteMealEntry,
  deleteMealFood,
  getDailyNutritionInsight,
  getNutritionDay,
  getNutritionHistory,
  getWeeklyNutritionInsight,
  lookupFoodBarcode,
  updateNutritionGoals,
} from "../api";
import BarcodeScannerModal from "../components/BarcodeScannerModal";
import GoalEditor from "../components/GoalEditor";
import MacroProgress from "../components/MacroProgress";
import MealSection from "../components/MealSection";
import type { NutritionDaySummary, NutritionMealEntry } from "../../../types";
import { useLanguage } from "../../../context/LanguageContext";

const mealOrder = ["breakfast", "lunch", "dinner", "snack"];

export default function NutritionDashboard() {
  const { language } = useLanguage();
  const labels = useMemo(
    () =>
      language === "es"
        ? {
            title: "Nutricion",
            subtitle: "Registra comidas, macros y calorias sin salir de la app.",
            calories: "Calorias",
            protein: "Proteina",
            carbs: "Carbohidratos",
            fat: "Grasas",
            remaining: "Restante",
            consumed: "Consumido",
            goalTitle: "Objetivos nutricionales",
            goalSubtitle: "Calorias y distribucion diaria en gramos.",
            save: "Guardar objetivos",
            saving: "Guardando...",
            breakfast: "Desayuno",
            lunch: "Almuerzo",
            dinner: "Cena",
            snack: "Snacks",
            foodName: "Alimento",
            addFood: "Agregar alimento",
            scanTitle: "Escanear codigo de barras",
            scanHint: "Apunta la camara o pega el codigo manualmente.",
            cameraError: "No pudimos acceder a la camara. Usa el codigo manual.",
            manualCode: "Codigo manual",
            dailyInsight: "Sugerencia IA de hoy",
            weeklyInsight: "Analisis semanal",
            scanningMeal: "Escaneando para",
            loading: "Cargando nutricion...",
            date: "Fecha",
          }
        : {
            title: "Nutrition",
            subtitle: "Track meals, macros and calories without leaving the app.",
            calories: "Calories",
            protein: "Protein",
            carbs: "Carbs",
            fat: "Fat",
            remaining: "Remaining",
            consumed: "Consumed",
            goalTitle: "Nutrition targets",
            goalSubtitle: "Calories and daily macros in grams.",
            save: "Save targets",
            saving: "Saving...",
            breakfast: "Breakfast",
            lunch: "Lunch",
            dinner: "Dinner",
            snack: "Snacks",
            foodName: "Food",
            addFood: "Add food",
            scanTitle: "Scan barcode",
            scanHint: "Point your camera or paste the code manually.",
            cameraError: "Camera access failed. Use manual barcode entry.",
            manualCode: "Manual code",
            dailyInsight: "Today's AI suggestion",
            weeklyInsight: "Weekly analysis",
            scanningMeal: "Scanning for",
            loading: "Loading nutrition...",
            date: "Date",
          },
    [language],
  );

  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState<NutritionDaySummary | null>(null);
  const [history, setHistory] = useState<Array<{ date: string; calories: number; protein: number; carbs: number; fat: number }>>([]);
  const [dailyInsight, setDailyInsight] = useState("");
  const [weeklyInsight, setWeeklyInsight] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingGoals, setSavingGoals] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanMeal, setScanMeal] = useState<NutritionMealEntry | null>(null);

  const refresh = async (targetDay = day) => {
    const [daySummary, dayHistory] = await Promise.all([
      getNutritionDay(targetDay),
      getNutritionHistory(7),
    ]);
    setSummary(daySummary);
    setHistory(dayHistory);

    const [daily, weekly] = await Promise.all([
      getDailyNutritionInsight(targetDay, language),
      getWeeklyNutritionInsight(7, language),
    ]);
    setDailyInsight(daily.summary);
    setWeeklyInsight(weekly.summary);
  };

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [day, language]);

  const mealsByType = useMemo(() => {
    const map = new Map(summary?.meals.map((meal) => [meal.meal_type, meal]) ?? []);
    return map;
  }, [summary?.meals]);

  const ensureMeal = async (mealType: string) => {
    const created = await createMealEntry({ meal_type: mealType, entry_date: day, title: mealType });
    await refresh();
    return created;
  };

  const handleScanDetected = async (barcode: string) => {
    if (!scanMeal) return;
    const product = await lookupFoodBarcode(barcode);
    const grams = product.default_grams || 100;
    await addMealFood(scanMeal.id, {
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
    });
    setScannerOpen(false);
    setScanMeal(null);
    await refresh();
  };

  if (loading || !summary) {
    return <div className="py-12 text-center text-text-secondary">{labels.loading}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="hero-panel rounded-[2rem] p-6 md:p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-text-muted">{labels.title}</p>
            <h1 className="mt-3 text-3xl font-bold text-text md:text-4xl">{labels.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-text-secondary md:text-base">{labels.subtitle}</p>
          </div>
          <div className="glass-panel rounded-[1.5rem] px-4 py-3">
            <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-text-muted">
              <CalendarDays className="h-4 w-4" />
              {labels.date}
            </label>
            <input className="input" type="date" value={day} onChange={(event) => setDay(event.target.value)} />
          </div>
        </div>
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MacroProgress title={labels.calories} consumed={summary.totals.calories} target={summary.goals.calorie_target} unit="kcal" accentClass="bg-brand-500" />
        <MacroProgress title={labels.protein} consumed={summary.totals.protein} target={summary.goals.protein_target} unit="g" accentClass="bg-emerald-500" />
        <MacroProgress title={labels.carbs} consumed={summary.totals.carbs} target={summary.goals.carbs_target} unit="g" accentClass="bg-amber-500" />
        <MacroProgress title={labels.fat} consumed={summary.totals.fat} target={summary.goals.fat_target} unit="g" accentClass="bg-rose-500" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {mealOrder.map((mealType) => (
              <MealSection
                key={mealType}
                title={labels[mealType as keyof typeof labels] as string}
                mealType={mealType}
                meal={mealsByType.get(mealType)}
                labels={labels}
                onCreateMeal={ensureMeal}
                onDeleteMeal={async (mealId) => {
                  await deleteMealEntry(mealId);
                  await refresh();
                }}
                onDeleteFood={async (foodId) => {
                  await deleteMealFood(foodId);
                  await refresh();
                }}
                onAddManualFood={async (mealId, payload) => {
                  await addMealFood(mealId, { ...payload, quantity: 1, unit: "g", source: "manual" });
                  await refresh();
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
            goal={summary.goals}
            saving={savingGoals}
            labels={labels}
            onSave={async (payload) => {
              setSavingGoals(true);
              try {
                await updateNutritionGoals(payload);
                await refresh();
              } finally {
                setSavingGoals(false);
              }
            }}
          />

          <div className="glass-panel rounded-[2rem] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-brand-300" />
              <h3 className="text-lg font-semibold text-text">{labels.remaining}</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-surface-border bg-surface-hover p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{labels.calories}</p>
                <p className="mt-2 text-2xl font-bold text-text">{summary.remaining.calories.toFixed(0)}</p>
              </div>
              <div className="rounded-2xl border border-surface-border bg-surface-hover p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{labels.protein}</p>
                <p className="mt-2 text-2xl font-bold text-text">{summary.remaining.protein.toFixed(0)}g</p>
              </div>
              <div className="rounded-2xl border border-surface-border bg-surface-hover p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{labels.carbs}</p>
                <p className="mt-2 text-2xl font-bold text-text">{summary.remaining.carbs.toFixed(0)}g</p>
              </div>
              <div className="rounded-2xl border border-surface-border bg-surface-hover p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{labels.fat}</p>
                <p className="mt-2 text-2xl font-bold text-text">{summary.remaining.fat.toFixed(0)}g</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Flame className="h-5 w-5 text-accent-400" />
              <h3 className="text-lg font-semibold text-text">{labels.consumed}</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={history}>
                  <CartesianGrid stroke="rgba(130, 161, 199, 0.1)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#8ea4bd", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#8ea4bd", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="calories" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-300" />
              <h3 className="text-lg font-semibold text-text">{labels.dailyInsight}</h3>
            </div>
            <p className="text-sm leading-7 text-text-secondary">{dailyInsight}</p>
          </div>

          <div className="glass-panel rounded-[2rem] p-5">
            <div className="mb-3 flex items-center gap-2">
              <ScanBarcode className="h-5 w-5 text-brand-300" />
              <h3 className="text-lg font-semibold text-text">{labels.weeklyInsight}</h3>
            </div>
            <p className="text-sm leading-7 text-text-secondary">{weeklyInsight}</p>
          </div>
        </div>
      </div>

      <BarcodeScannerModal
        open={scannerOpen}
        onClose={() => {
          setScannerOpen(false);
          setScanMeal(null);
        }}
        onDetected={handleScanDetected}
        labels={labels}
      />
    </div>
  );
}
