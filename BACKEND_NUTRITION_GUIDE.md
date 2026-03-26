# 🔌 BACKEND - GUÍA COMPLETA PARA PYTHON/FASTAPI

## 📋 CHECKLIST DE ENDPOINTS BACKEND

### ✅ YA IMPLEMENTADOS:
- [x] GET `/nutrition/goals` - Obtener objetivos del usuario
- [x] PUT `/nutrition/goals` - Actualizar objetivos
- [x] GET `/nutrition/day` - Resumen del día
- [x] GET `/nutrition/history` - Historial últimos N días
- [x] POST `/nutrition/meals` - Crear comida
- [x] PATCH `/nutrition/meals/{mealId}` - Actualizar comida
- [x] DELETE `/nutrition/meals/{mealId}` - Eliminar comida
- [x] POST `/nutrition/meals/{mealId}/foods` - Agregar alimento
- [x] PATCH `/nutrition/foods/{foodId}` - Actualizar alimento
- [x] DELETE `/nutrition/foods/{foodId}` - Eliminar alimento

### ⚠️ PENDIENTES (3 endpoints críticos):
- [ ] GET `/nutrition/barcode/{barcode}` - Buscar por código
- [ ] GET `/nutrition/insights/daily` - Análisis IA diario
- [ ] GET `/nutrition/insights/weekly` - Análisis IA semanal

---

## 🔧 IMPLEMENTACIÓN DE ENDPOINTS PENDIENTES

### ENDPOINT 1: Búsqueda de Código de Barras

**Archivo:** `backend/nutrition/router.py`

**Agregar al final del archivo (antes de la última línea):**

```python
from fastapi import Query, Path

@router.get("/barcode/{barcode}", response_model=FoodLookupResult)
async def lookup_food_barcode(
    barcode: str = Path(..., min_length=5, max_length=20),
) -> FoodLookupResult:
    """
    Buscar producto por código de barras en OpenFoodFacts.
    
    **Parámetros:**
    - barcode: Código UPC/EAN del producto
    
    **Respuesta:**
    - name: Nombre del producto
    - brand: Marca
    - calories_per_100g: Calorías por 100g
    - protein_per_100g: Proteína por 100g
    - carbs_per_100g: Carbohidratos por 100g
    - fat_per_100g: Grasas por 100g
    - fiber_per_100g: Fibra por 100g (opcional)
    - sugar_per_100g: Azúcar por 100g (opcional)
    
    **Ejemplos:**
    - GET /nutrition/barcode/8714100050047
    - GET /nutrition/barcode/5900123002123
    """
    service = OpenFoodFactsService()
    try:
        result = service.lookup_barcode(barcode)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error looking up barcode: {str(e)}")
```

### ENDPOINT 2: Insight IA Diario

**Archivo:** `backend/nutrition/router.py`

```python
from datetime import date as date_type

@router.get("/insights/daily", response_model=NutritionInsightResponse)
async def get_daily_insight(
    day: date_type = Query(..., description="Fecha en formato YYYY-MM-DD"),
    lang: str = Query("en", regex="^(en|es)$"),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
) -> NutritionInsightResponse:
    """
    Obtener análisis IA para un día específico.
    
    Utiliza Gemini AI para analizar:
    - Cumplimiento de objetivos
    - Macros consumidas vs objetivo
    - Comidas registradas
    - Sugerencias personalizadas
    
    **Parámetros:**
    - day: Fecha del análisis (YYYY-MM-DD)
    - lang: Idioma del análisis (en/es)
    
    **Respuesta:**
    - period: "day"
    - summary: Análisis en texto natural
    
    **Ejemplo de respuesta:**
    {
        "period": "day",
        "summary": "Excelente consumo de proteína hoy (150g). 
                    Te faltan 30g de carbohidratos. 
                    Sugiero agregar una banana o avena."
    }
    """
    # 1. Obtener resumen del día
    goal = _get_or_create_goal(db, user.id)
    meals = (
        db.query(MealEntry)
        .filter(MealEntry.user_id == user.id, MealEntry.entry_date == day)
        .options(selectinload(MealEntry.foods))
        .all()
    )
    
    # 2. Calcular totales
    totals = _sum_meals(meals)
    remaining = MacroTotals(
        calories=max(0, goal.calorie_target - totals.calories),
        protein=max(0, goal.protein_target - totals.protein),
        carbs=max(0, goal.carbs_target - totals.carbs),
        fat=max(0, goal.fat_target - totals.fat),
        fiber=0,
        sugar=0,
    )
    
    # 3. Crear resumen
    summary = NutritionDaySummary(
        date=day,
        goals=goal,
        totals=totals,
        remaining=remaining,
        meals=meals,
    )
    
    # 4. Generar insight con IA
    ai_service = NutritionAIService()
    insight_text = ai_service.day_insight(summary, lang=lang)
    
    return NutritionInsightResponse(
        period="day",
        summary=insight_text,
    )
```

### ENDPOINT 3: Insight IA Semanal

**Archivo:** `backend/nutrition/router.py`

```python
from datetime import timedelta

@router.get("/insights/weekly", response_model=NutritionInsightResponse)
async def get_weekly_insight(
    days: int = Query(7, ge=1, le=30, description="Número de días a analizar"),
    lang: str = Query("en", regex="^(en|es)$"),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
) -> NutritionInsightResponse:
    """
    Obtener análisis IA de la semana.
    
    Analiza:
    - Tendencias de calorías
    - Consistencia en macros
    - Patrones de comidas
    - Recomendaciones para la próxima semana
    
    **Parámetros:**
    - days: Número de días (1-30, default: 7)
    - lang: Idioma (en/es)
    
    **Respuesta:**
    {
        "period": "week",
        "summary": "Tendencia semanal muy consistente. 
                    Promedio: 2100 kcal/día y 155g proteína. 
                    Mantén este ritmo..."
    }
    """
    today = date_type.today()
    start_date = today - timedelta(days=days - 1)
    
    # 1. Obtener todos los alimentos en el período
    meals = (
        db.query(MealEntry)
        .filter(
            MealEntry.user_id == user.id,
            MealEntry.entry_date >= start_date,
            MealEntry.entry_date <= today,
        )
        .options(selectinload(MealEntry.foods))
        .all()
    )
    
    # 2. Agrupar por fecha
    history_points = []
    daily_map = {}
    
    for meal in meals:
        key = meal.entry_date
        if key not in daily_map:
            daily_map[key] = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
        
        for food in meal.foods:
            daily_map[key]["calories"] += food.calories
            daily_map[key]["protein"] += food.protein
            daily_map[key]["carbs"] += food.carbs
            daily_map[key]["fat"] += food.fat
    
    # 3. Crear puntos de historial
    for day_key in sorted(daily_map.keys()):
        data = daily_map[day_key]
        history_points.append(
            NutritionHistoryPoint(
                date=day_key,
                calories=data["calories"],
                protein=data["protein"],
                carbs=data["carbs"],
                fat=data["fat"],
            )
        )
    
    # 4. Generar insight semanal
    ai_service = NutritionAIService()
    insight_text = ai_service.weekly_insight(history_points, lang=lang)
    
    return NutritionInsightResponse(
        period="week",
        summary=insight_text,
    )
```

---

## 🧠 MEJORAS EN ai_service.py

**Archivo:** `backend/nutrition/ai_service.py`

**Verificar que existan estas métodos (si no, agregar):**

```python
def weekly_insight(self, points: Iterable[NutritionHistoryPoint], lang: str = "en") -> str:
    """
    Genera análisis semanal basado en historial de 7 días
    """
    points_list = list(points)
    if not points_list:
        return "No nutrition history yet."

    if not self.api_key:
        # Fallback si no hay API key
        avg_calories = sum(p.calories for p in points_list) / len(points_list)
        avg_protein = sum(p.protein for p in points_list) / len(points_list)
        return (
            f"Last {len(points_list)} days average: {avg_calories:.0f} kcal, "
            f"{avg_protein:.0f}g protein. Aim for consistency."
        )

    # Llamar a Gemini AI
    client = genai.Client(api_key=self.api_key)
    
    # Construir datos para el prompt
    data_lines = []
    for point in sorted(points_list, key=lambda p: p.date):
        data_lines.append(
            f"- {point.date.isoformat()}: {point.calories:.0f}kcal, "
            f"{point.protein:.0f}p, {point.carbs:.0f}c, {point.fat:.0f}f"
        )
    
    prompt = f"""
You are a professional sports nutrition coach.
Analyze this weekly nutrition data and provide constructive feedback in {lang}.

Data ({len(points_list)} days):
{chr(10).join(data_lines)}

Calculate and comment on:
1. Average calories and macros
2. Consistency pattern
3. Main strengths
4. One recommendation for next week

Keep response short (2-3 sentences) and actionable.
"""
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    return response.text
```

---

## 🔐 VALIDACIONES Y ERRORES

### Validar entrada de barcode

```python
def validate_barcode(barcode: str) -> bool:
    """
    Valida formato de código de barras
    """
    # EAN-13, EAN-8, UPC-A, UPC-E
    valid_lengths = [8, 12, 13, 14]
    if len(barcode) not in valid_lengths:
        return False
    
    if not barcode.isdigit():
        return False
    
    return True
```

### Manejo de excepciones

```python
from fastapi import HTTPException

# En los endpoints:
try:
    result = service.lookup_barcode(barcode)
except ValueError:
    raise HTTPException(status_code=400, detail="Invalid barcode format")
except ConnectionError:
    raise HTTPException(status_code=503, detail="Service temporarily unavailable")
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
```

---

## 🧪 TESTING DE ENDPOINTS

### Test con pytest

**Archivo:** `backend/nutrition/test_router.py`

```python
import pytest
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal

client = TestClient(app)

class TestNutritionBarcode:
    """Tests para endpoint /barcode"""
    
    def test_lookup_barcode_success(self):
        """Test búsqueda exitosa"""
        response = client.get("/nutrition/barcode/8717123456789")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "calories_per_100g" in data
    
    def test_lookup_barcode_not_found(self):
        """Test producto no encontrado"""
        response = client.get("/nutrition/barcode/1234567890")
        assert response.status_code == 404
    
    def test_lookup_barcode_invalid(self):
        """Test código inválido"""
        response = client.get("/nutrition/barcode/abc")
        assert response.status_code == 422  # Validation error


class TestNutritionInsights:
    """Tests para endpoints de insights"""
    
    def test_daily_insight_success(self):
        """Test insight diario"""
        response = client.get(
            "/nutrition/insights/daily?day=2024-03-25&lang=en"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "day"
        assert isinstance(data["summary"], str)
        assert len(data["summary"]) > 0
    
    def test_weekly_insight_success(self):
        """Test insight semanal"""
        response = client.get(
            "/nutrition/insights/weekly?days=7&lang=es"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "week"
```

### Ejecutar tests

```bash
# Todos los tests
pytest backend/nutrition/test_router.py -v

# Test específico
pytest backend/nutrition/test_router.py::TestNutritionBarcode::test_lookup_barcode_success -v

# Con coverage
pytest backend/nutrition/ --cov=nutrition --cov-report=html
```

---

## 📊 MONITOREO EN PRODUCCIÓN

### Logging

```python
import logging

logger = logging.getLogger(__name__)

# En los endpoints:
logger.info(f"🥗 User {user.id} looking up barcode: {barcode}")
logger.error(f"Failed to lookup barcode: {str(e)}")
```

### Métricas (Prometheus)

```python
from prometheus_client import Counter, Histogram
import time

barcode_lookups = Counter(
    'nutrition_barcode_lookups_total',
    'Total barcode lookups',
    ['status']
)

barcode_lookup_duration = Histogram(
    'nutrition_barcode_lookup_seconds',
    'Barcode lookup duration'
)

@router.get("/barcode/{barcode}")
async def lookup_food_barcode(barcode: str):
    start_time = time.time()
    try:
        result = service.lookup_barcode(barcode)
        barcode_lookups.labels(status='success').inc()
        barcode_lookup_duration.observe(time.time() - start_time)
        return result
    except Exception:
        barcode_lookups.labels(status='error').inc()
        raise
```

---

## 🚀 DEPLOYMENT

### Verificaciones previas

```bash
# 1. Verificar APIs están disponibles
curl -X GET "http://localhost:8000/nutrition/barcode/8714100050047" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Verificar Gemini API key
echo $GEMINI_API_KEY

# 3. Verificar OpenFoodFacts
curl -X GET "https://world.openfoodfacts.org/api/v2/product/8714100050047.json"

# 4. Ejecutar tests
pytest backend/nutrition/ -v

# 5. Build Docker (si aplica)
docker build -t gym-api:latest .
```

### Variables de entorno requeridas

```bash
# .env (backend)
GEMINI_API_KEY=tu_api_key_aqui
ALLOWED_ORIGINS=http://localhost:5173,https://tudominio.com
ENVIRONMENT=production
DATABASE_URL=postgresql://user:pass@localhost/gym_coach
```

---

## 📖 DOCUMENTACIÓN AUTOMÁTICA

FastAPI genera automáticamente documentación Swagger:

```
http://localhost:8000/docs
```

Endpoints de nutrición estarán disponibles en:
- **GET** `/nutrition/barcode/{barcode}`
- **GET** `/nutrition/insights/daily`
- **GET** `/nutrition/insights/weekly`

---

## ✅ CHECKLIST FINAL DE BACKEND

- [ ] Endpoints `/barcode` funcionando
- [ ] Endpoint `/insights/daily` funcionando
- [ ] Endpoint `/insights/weekly` funcionando
- [ ] OpenFoodFacts API accesible
- [ ] Gemini API key configurada
- [ ] Tests pasando (pytest)
- [ ] Logs configurados
- [ ] Error handling completo
- [ ] Validaciones en inputs
- [ ] Documentación Swagger visible

¡Listo para producción! 🚀
