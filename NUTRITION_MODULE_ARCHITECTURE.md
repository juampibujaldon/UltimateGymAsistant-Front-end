# 📱 MÓDULO DE NUTRICIÓN - ARQUITECTURA Y GUÍA COMPLETA

## 🏗️ ARQUITECTURA GENERAL

```
src/features/nutrition/
├── pages/
│   ├── NutritionDashboard.tsx      (Página principal - router)
│   └── MealLog.tsx                 (Registro detallado de comidas)
├── components/
│   ├── MacroProgress.tsx           (Tarjetas de progreso de macros - MEJORADO)
│   ├── MealSection.tsx             (Sección de una comida con foods)
│   ├── GoalEditor.tsx              (Editor de objetivos nutricionales)
│   ├── BarcodeScannerModal.tsx     (Modal con escáner de códigos)
│   ├── FoodEntryCard.tsx           (Tarjeta individual de comida)
│   ├── QuickAddFood.tsx            (Búsqueda y agregar alimento rápido)
│   ├── NutritionInsights.tsx       (Panel de insights IA)
│   └── ChartNutritionHistory.tsx   (Gráficos históricos)
├── hooks/
│   ├── useNutrition.ts             (Hook principal de estado - CREADO)
│   ├── useBarcode.ts               (Hook para manejo de scanner)
│   └── useNutritionCalculations.ts (Hook para cálculos)
├── context/
│   └── NutritionContext.tsx        (Context para compartir datos globales)
├── api.ts                          (Funciones API ya existentes)
├── utils/
│   ├── calculations.ts             (Funciones de cálculo)
│   ├── constants.ts                (Constantes y enum de comidas)
│   └── formatters.ts               (Formateos de datos)
└── types.ts                        (Tipos específicos de nutrición si es necesario)
```

## 🔌 FLUJOS PRINCIPALES

### 1. FLUJO DE ESCANEO DE CÓDIGO DE BARRAS

```
Usuario toca "Escanear" en una comida
    ↓
Abre BarcodeScannerModal
    ↓
Accede a cámara del teléfono
    ↓
BarcodeDetector captura código
    ↓
Envía a backend: POST /nutrition/barcode/{barcode}
    ↓
Backend consulta OpenFoodFacts
    ↓
Retorna: FoodLookupResult (nutrientes por 100g)
    ↓
Frontend calcula macros para cantidad seleccionada
    ↓
Agrega alimento a comida: POST /nutrition/meals/{mealId}/foods
    ↓
Refresh automático del día
```

### 2. FLUJO DE REGISTRO MANUAL

```
Usuario ingresa datos manualmente
    ↓
MealSection captura valores
    ↓
POST /nutrition/meals/{mealId}/foods con datos completos
    ↓
Backend calcula totales de macros
    ↓
Refresh del día y gráficos
```

### 3. FLUJO DE INSIGHTS IA

```
Usuario abre dashboard
    ↓
useNutrition carga resumen del día
    ↓
Dispara: GET /nutrition/insights/daily?day={date}&lang={lang}
    ↓
Backend procesa con Gemini AI
    ↓
Retorna análisis y sugerencias
    ↓
NutritionInsights renderiza el resultado
```

## 🎨 MEJORAS UI/UX IMPLEMENTADAS

### Componente MacroProgress (MEJORADO)
- ✅ Iconos específicos por macro (Flame, Beef, Wheat, Droplet)
- ✅ Estado visual dinámico (Over/Complete/On Track)
- ✅ Colores adaptativos según porcentaje
- ✅ Transiciones suaves
- ✅ Estadísticas de consumo y restante
- ✅ Hover effects

### Dashboard Principal
- ✅ Hero panel con información clara
- ✅ Grid responsive de macros
- ✅ Selector de fecha integrado
- ✅ Seción de comidas en cards
- ✅ Panel de objetivos editables
- ✅ Gráficos de historia (7 últimos días)
- ✅ Insights IA diarios y semanales
- ✅ Indicador visual de "Restante"

### Modal de Escaneo
- ✅ Fallback a entrada manual de código
- ✅ Indicador de error con solución
- ✅ UX clara si no hay cámara

## 📊 MODELOS DE DATOS

### NutritionGoal (ya en DB)
```typescript
{
  id: number
  user_id: number
  calorie_target: number        // ej: 2200
  protein_target: number        // ej: 160g
  carbs_target: number          // ej: 220g
  fat_target: number            // ej: 70g
  created_at: string
  updated_at: string
}
```

### MealEntry (ya en DB)
```typescript
{
  id: number
  user_id: number
  meal_type: "breakfast" | "lunch" | "dinner" | "snack"
  entry_date: string            // YYYY-MM-DD
  title?: string
  notes?: string
  foods: NutritionFoodEntry[]
  created_at: string
  updated_at: string
}
```

### FoodEntry (ya en DB)
```typescript
{
  id: number
  meal_entry_id: number
  name: string                  // "Pollo cocido"
  brand?: string
  barcode?: string              // UPC/EAN
  quantity: number              // 1
  unit: string                  // "g", "oz", "porciones"
  grams: number                 // 150 (peso para calcular)
  calories: number              // 165
  protein: number               // 32g
  carbs: number                 // 0g
  fat: number                   // 3.6g
  fiber?: number
  sugar?: number
  source: "manual" | "openfoodfacts"
  created_at: string
  updated_at: string
}
```

### NutritionDaySummary (response)
```typescript
{
  date: string
  goals: NutritionGoal
  totals: NutritionMacroTotals      // suma del día
  remaining: NutritionMacroTotals   // goal - totals
  meals: NutritionMealEntry[]
}
```

## 🔌 API ENDPOINTS REQUERIDOS (Backend)

### Ya existentes (en nutrition/router.py):
```
GET    /nutrition/goals
PUT    /nutrition/goals
GET    /nutrition/day?day=YYYY-MM-DD
GET    /nutrition/history?days=7
POST   /nutrition/meals
PATCH  /nutrition/meals/{mealId}
DELETE /nutrition/meals/{mealId}
POST   /nutrition/meals/{mealId}/foods
PATCH  /nutrition/foods/{foodId}
DELETE /nutrition/foods/{foodId}
GET    /nutrition/barcode/{barcode}
GET    /nutrition/insights/daily?day=YYYY-MM-DD&lang=en
GET    /nutrition/insights/weekly?days=7&lang=en
```

## 🚀 INSTANCIACIÓN Y USO EN COMPONENTES

### Componente que usa el hook:
```typescript
import { useNutrition } from "../hooks/useNutrition";

export function MyComponent() {
  const { summary, loading, currentDay, setCurrentDay, refresh, addFood } = useNutrition();
  
  return (
    <div>
      {loading && <p>Cargando...</p>}
      {summary && <p>Calorías hoy: {summary.totals.calories}</p>}
    </div>
  );
}
```

### Contexto global (opcional pero recomendado):
```typescript
import { NutritionContext } from "../context/NutritionContext";

// En App.tsx
<NutritionContext.Provider value={useNutrition()}>
  <NutritionDashboard />
</NutritionContext.Provider>

// En componentes
const nutrition = useContext(NutritionContext);
```

## 📋 LISTA DE ARCHIVOS A COMPLETAR/MEJORAR

### ✅ COMPLETADOS:
- [x] useNutrition.ts - Hook principal
- [x] MacroProgress.tsx - Componente mejorado

### 🔄 EN PROGRESO (ver abajo):
- [ ] FoodEntryCard.tsx - Tarjeta individual
- [ ] QuickAddFood.tsx - Búsqueda rápida
- [ ] NutritionInsights.tsx - Panel IA
- [ ] useBarcode.ts - Hook barcode
- [ ] NutritionContext.tsx - Context global

### 📝 PENDIENTES:
- [ ] Mejoras finales a BarcodeScannerModal
- [ ] Mejorar GoalEditor con validación
- [ ] Agregar animaciones
- [ ] Tests unitarios

## 🎯 FEATURE FLAGS

```typescript
// config/features.ts
export const nutritionEnabled = import.meta.env.VITE_ENABLE_NUTRITION !== "false";
```

En `.env`:
```
VITE_ENABLE_NUTRITION=true
```

## 🔐 CONSIDERACIONES DE SEGURIDAD

1. **Autenticación**: Todos los endpoints requieren JWT (ya implementado)
2. **Autorización**: Los usuarios solo ven sus propios datos (user_id)
3. **Validación**: Backend valida todos los inputs
4. **Rate limiting**: Considerar limitar búsquedas de barcode (API externa)

## 🧪 TESTING

Pendiente: Tests para cada hook y componente

## 📱 RESPONSIVE DESIGN

- Mobile First: Diseño primero para móvil
- Tailwind: Grid responsive (md:, lg:, xl:)
- Touch-friendly: Botones amplios en móvil

## 🌍 MULTIIDIOMA

Ya integrado con `useLanguage()` en componentes.

## 📦 NEXT STEPS

1. Completar componentes restantes
2. Mejorar backend con más endpoints
3. Agregar búsqueda de alimentos (autocomplete)
4. Sincronización en tiempo real
5. Notificaciones de objetivos
6. Exportar datos (PDF, CSV)
