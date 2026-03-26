/**
 * Backend - nutrition/router.py
 * ENDPOINTS COMPLETOS para el módulo de nutrición
 * 
 * Este archivo contiene todos los endpoints necesarios para que el
 * módulo de nutrición funcione correctamente
 */

# ============================================================================
# ENDPOINTS REQUERIDOS (agregar a nutrition/router.py)
# ============================================================================

# Endpoints que FALTA COMPLETAR:
# 1. GET    /nutrition/barcode/{barcode}        -> lookupFoodBarcode
# 2. GET    /nutrition/insights/daily           -> getDailyNutritionInsight
# 3. GET    /nutrition/insights/weekly          -> getWeeklyNutritionInsight

# ============================================================================
# CÓDIGO A AGREGAR EN nutrition/router.py (al final del archivo)
# ============================================================================

from fastapi import Query
from datetime import date, timedelta

@router.get("/barcode/{barcode}")
def lookup_food_barcode(
    barcode: str,
    db: Session = Depends(get_db),
) -> FoodLookupResult:
    """
    Buscar producto por código de barras.
    Consulta OpenFoodFacts y retorna nutrientes por 100g.
    """
    service = OpenFoodFactsService()
    try:
        result = service.lookup_barcode(barcode)
        return result
    except HTTPException:
        raise HTTPException(status_code=404, detail="Product not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/insights/daily")
def get_daily_insight(
    day: date = Query(...),
    lang: str = Query("en"),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
) -> NutritionInsightResponse:
    """
    Obtener insight IA para un día específico.
    Retorna análisis y sugerencias basadas en Gemini AI.
    """
    summary = _get_day_summary(db, user.id, day)
    
    ai_service = NutritionAIService()
    insight_text = ai_service.day_insight(summary, lang=lang)
    
    return NutritionInsightResponse(
        period="day",
        summary=insight_text,
    )


@router.get("/insights/weekly")
def get_weekly_insight(
    days: int = Query(7, ge=1, le=30),
    lang: str = Query("en"),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
) -> NutritionInsightResponse:
    """
    Obtener insight IA para la semana.
    Retorna análisis de tendencias y recomendaciones.
    """
    history = _get_history(db, user.id, days)
    
    ai_service = NutritionAIService()
    insight_text = ai_service.weekly_insight(history, lang=lang)
    
    return NutritionInsightResponse(
        period="week",
        summary=insight_text,
    )


# ============================================================================
# COMPONENTES MEJORADOS - Frontend
# ============================================================================

# ARCHIVO: src/features/nutrition/components/QuickAddFood.tsx
/**
 * Quick Add Food Modal - Búsqueda y agregar alimento rápidamente
 * Con autocomplete y presets comunes
 */

import { useState, useMemo } from "react";
import { Plus, Search, X } from "lucide-react";
import type { NutritionMealEntry } from "../../../types";

const COMMON_FOODS = [
  { name: "Pollo cocido", calories: 165, protein: 32, carbs: 0, fat: 3.6, unit: "100g" },
  { name: "Arroz cocido", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, unit: "100g" },
  { name: "Huevo", calories: 155, protein: 13, carbs: 1.1, fat: 11, unit: "1 unidad" },
  { name: "Manzana", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, unit: "1 media" },
  { name: "Pechuga de pollo", calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: "100g" },
  { name: "Salmon", calories: 208, protein: 20, carbs: 0, fat: 13, unit: "100g" },
  { name: "Brócoli", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, unit: "100g" },
  { name: "Batata", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, unit: "100g" },
];

interface QuickAddFoodProps {
  open: boolean;
  onClose: () => void;
  onAdd: (food: any) => Promise<void>;
  meal: NutritionMealEntry;
}

export default function QuickAddFood({ open, onClose, onAdd, meal }: QuickAddFoodProps) {
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(
    () => COMMON_FOODS.filter((food) => food.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const handleAdd = async (food: typeof COMMON_FOODS[0]) => {
    setLoading(true);
    try {
      const multiplier = quantity;
      await onAdd({
        name: food.name,
        quantity: quantity,
        unit: food.unit,
        grams: 100 * quantity, // Aproximado
        calories: food.calories * multiplier,
        protein: food.protein * multiplier,
        carbs: food.carbs * multiplier,
        fat: food.fat * multiplier,
        source: "manual",
      });
      setSearch("");
      setQuantity(1);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-panel w-full max-w-md rounded-[2rem] p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">Agregar alimento rápido</h3>
          <button type="button" onClick={onClose} className="text-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar alimento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((food) => (
                <button
                  key={food.name}
                  type="button"
                  onClick={() => handleAdd(food)}
                  disabled={loading}
                  className="w-full text-left rounded-lg border border-surface-border bg-surface-hover/50 p-3 transition-all hover:bg-surface-hover hover:border-brand-500/50 disabled:opacity-50"
                >
                  <p className="font-medium text-text">{food.name}</p>
                  <p className="text-xs text-text-muted">
                    {food.calories.toFixed(0)}kcal · {food.protein.toFixed(0)}p · {food.carbs.toFixed(0)}c · {food.fat.toFixed(1)}f · {food.unit}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-center text-sm text-text-muted">No encontrado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
# ARCHIVO: src/features/nutrition/utils/calculations.ts
# Funciones útiles de cálculo
# ============================================================================

/**
 * Calcula macros basado en peso
 */
export function calculateMacros(per100g: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}, grams: number) {
  const multiplier = grams / 100;
  return {
    calories: per100g.calories * multiplier,
    protein: per100g.protein * multiplier,
    carbs: per100g.carbs * multiplier,
    fat: per100g.fat * multiplier,
  };
}

/**
 * Calcula porcentaje de macro
 */
export function getMacroPercentage(macro: number, total: number, perGram: number = 1) {
  return (macro * perGram) / (total * 4) * 100; // Proteína: 4kcal/g, Carbs: 4, Fat: 9
}

/**
 * Obtiene estado visual de meta
 */
export function getGoalStatus(consumed: number, target: number) {
  const percentage = (consumed / target) * 100;
  if (consumed > target) return { status: "over", color: "red" };
  if (percentage >= 95) return { status: "complete", color: "green" };
  if (percentage >= 75) return { status: "on-track", color: "yellow" };
  return { status: "low", color: "blue" };
}

# ============================================================================
# ARCHIVO: src/features/nutrition/utils/constants.ts
# Constantes y enums
# ============================================================================

export const MEAL_TYPES = {
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
  snack: "snack",
} as const;

export const MEAL_NAMES_ES = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  dinner: "Cena",
  snack: "Snacks",
} as const;

export const MEAL_NAMES_EN = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
} as const;

export const MACRO_UNITS = {
  calories: "kcal",
  protein: "g",
  carbs: "g",
  fat: "g",
} as const;

# ============================================================================
# TESTS UNITARIOS RECOMENDADOS
# ============================================================================

// src/features/nutrition/__tests__/useNutrition.test.ts
import { renderHook, act } from "@testing-library/react";
import { useNutrition } from "../hooks/useNutrition";

describe("useNutrition", () => {
  it("should load nutrition data on mount", async () => {
    const { result } = renderHook(() => useNutrition());
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      // wait for data
    });
    
    expect(result.current.summary).toBeDefined();
    expect(result.current.loading).toBe(false);
  });
  
  it("should add food to meal", async () => {
    const { result } = renderHook(() => useNutrition());
    
    await act(async () => {
      await result.current.addFood(1, {
        name: "Test food",
        grams: 100,
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
      });
    });
    
    expect(result.current.summary?.totals.calories).toBeGreaterThan(0);
  });
});
