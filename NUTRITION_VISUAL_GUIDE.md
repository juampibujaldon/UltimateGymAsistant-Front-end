# 🎨 GUÍA VISUAL Y CASOS DE USO - MÓDULO NUTRICIÓN

## 📱 WIREFRAMES Y FLUJOS VISUALES

### PANTALLA 1: Dashboard Principal

```
┌─────────────────────────────────────┐
│ 🏋️ Gym AI Coach        [☀️ MX] [👤] │
├─────────────────────────────────────┤
│                                     │
│  NUTRICION                          │
│  Registra comidas, macros...        │
│                                     │
│              📅 2024-03-25          │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────┬─────────┬─────────┬──┐ │
│  │ 2100    │  150g   │  250g   │70│ │
│  │kcal/2200│p/160    │c/220    │f │
│  │▓▓▓▓▓▓░░ │▓▓▓░░░░░ │▓▓▓▓▓░░ │░░│
│  │96% ✓    │94%      │114% ⚠️  │  │
│  └─────────┴─────────┴─────────┴──┘ │
│                                     │
├─ COMIDAS ───────────────────────────│
│                                     │
│ DESAYUNO                      [📱][🗑]│
│ 500 kcal · 15p · 60c · 20f          │
│ ├─ Huevo frito ... 155kcal         │
│ ├─ Pan integral ... 200kcal        │
│ └─ Naranja ... 145kcal             │
│                                     │
│ ALMUERZO                      [📱][🗑]│
│ 800 kcal · 40p · 90c · 30f         │
│ ├─ Pollo cocido ... 330kcal        │
│ ├─ Arroz ... 390kcal               │
│ └─ Ensalada ... 80kcal             │
│                                     │
│ CENA                          [➕][📱]│
│ Sin alimentos aún                   │
│                                     │
├─ OBJETIVOS ─────────────────────────│
│                                     │
│ Calorías: 2200 kcal ☀️ Editar       │
│ Proteína: 160 g                     │
│ Carbohidratos: 220 g                │
│ Grasas: 70 g                        │
│                                     │
├─ RESTANTE ──────────────────────────│
│                                     │
│ Calorías: 100 | Proteína: 10g      │
│ Carbs: -30g ⚠️ | Grasas: 20g       │
│                                     │
├─ HISTORIAL ─────────────────────────│
│ Gráfico de últimos 7 días           │
│                                     │
├─ 💡 INSIGHT IA ──────────────────────│
│ "Excelente consumo de proteína hoy. │
│  Considera agregar 50g más de carbs │
│  en la próxima comida."             │
│                                     │
├─ 📊 ANÁLISIS SEMANAL ────────────────│
│ "Tendencia consistente de 2100 kcal.│
│  Mantén este ritmo. Proteína: 150g  │
│  en promedio. Perfecto!"            │
│                                     │
└─────────────────────────────────────┘
```

### PANTALLA 2: Modal de Escaneo de Código de Barras

```
┌──────────────────────────────────────┐
│ 📱 ESCANEAR CÓDIGO DE BARRAS      [X] │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │    📷 CÁMARA ACTIVA            │  │
│  │                                │  │
│  │  ┌─────────────────────────┐   │  │
│  │  │ ▄▄▄▄ Apunta aquí ▄▄▄▄   │   │  │
│  │  │                         │   │  │
│  │  │    █████ CODIGO █████   │   │  │
│  │  │                         │   │  │
│  │  └─────────────────────────┘   │  │
│  │                                │  │
│  │  ℹ️ Coloca el código en el     │  │
│  │  rectángulo                    │  │
│  │                                │  │
│  └────────────────────────────────┘  │
│                                      │
│  ────────────────────────────────    │
│  o ingresa manualmente:              │
│  ┌──────────────────────────────┐   │
│  │ Código: |__________________|  │   │
│  │                              │   │
│  │ [📤 BUSCAR]  [Cancelar]      │   │
│  └──────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘

⬇️ DESPUÉS DE ESCANEAR (ej: 5900123002123)

┌──────────────────────────────────────┐
│ ✓ PRODUCTO ENCONTRADO              [X] │
├──────────────────────────────────────┤
│                                      │
│ Coca-Cola (330ml)                    │
│ Marca: The Coca-Cola Company         │
│ 🖼️ [Imagen del producto]             │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Información por 100ml:           │ │
│ │ • Calorías: 42 kcal              │ │
│ │ • Proteína: 0g                   │ │
│ │ • Carbohidratos: 10.6g           │ │
│ │ • Grasas: 0g                     │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Cantidad: [330] ml                   │
│ (Cálculo: 42 * 3.3 = 138.6 kcal)    │
│                                      │
│ [➕ AGREGAR A ALMUERZO]              │
│                                      │
└──────────────────────────────────────┘
```

### PANTALLA 3: Quick Add Food Modal

```
┌──────────────────────────────────────┐
│ ⚡ AGREGAR RÁPIDO                  [X] │
├──────────────────────────────────────┤
│                                      │
│ 🔍 Buscar alimento...                │
│ ┌──────────────────────────────────┐ │
│ │ |pechuga____               |      │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 🍗 Pechuga de pollo (100g)      │ │
│ │    165kcal · 31p · 0c · 3.6f    │ │
│ │                                  │ │
│ │ 🍚 Arroz cocido (100g)          │ │
│ │    130kcal · 2.7p · 28c · 0.3f  │ │
│ │                                  │ │
│ │ 🐟 Salmón (100g)                │ │
│ │    208kcal · 20p · 0c · 13f     │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Cantidad: [1] x                      │
│                                      │
│ [✓ AGREGAR]  [Cancelar]             │
│                                      │
└──────────────────────────────────────┘
```

### PANTALLA 4: Edición de Alimento

```
┌──────────────────────────────────────┐
│ ✏️ EDITAR ALIMENTO                  │
├──────────────────────────────────────┤
│                                      │
│ Pollo cocido                         │
│ Marca: Premium                       │
│ #8717123456789                       │
│                                      │
│ VALORES NUTRICIONALES                │
│                                      │
│ Cantidad: [1.5] gramos               │
│ Peso total: [150] g                  │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Calorías │ 248 kcal (Valor)      │ │
│ │ Proteína │ 48 g                  │ │
│ │ Carbohidratos │ 0 g              │ │
│ │ Grasas │ 5.4 g                   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [💾 GUARDAR]  [❌ ELIMINAR] [✕]    │
│                                      │
└──────────────────────────────────────┘
```

## 🎯 CASOS DE USO (USER STORIES)

### Caso 1: Usuario escanea su desayuno

```
👤 Usuario: "Quiero registrar mi desayuno rápidamente"

FLUJO:
1. Abre app → Va a Nutrición
2. Toca el botón "📱" en DESAYUNO
3. Se abre modal de escaneo
4. Escanea: Leche, Pan, Mermelada, Huevo
5. Cada escaneo agrega al desayuno automáticamente
6. App suma: 2800 kcal, 100p, 300c, 80f

RESULTADO:
✅ Desayuno registrado en 2 minutos
✅ Calorías diarias se actualizan
✅ Gráficos se refrescan
✅ App avisa: "Te faltan 100g de proteína"
```

### Caso 2: Usuario agrega comida manualmente

```
👤 Usuario: "Hice una comida casera, no tiene código de barras"

FLUJO:
1. Toca "➕ AGREGAR" en ALMUERZO
2. Abre Quick Add Food
3. Busca "Pollo" → Selecciona "Pechuga de pollo"
4. Cambia cantidad a 200g
5. Agregar
6. Busca "Arroz" → Selecciona "Arroz cocido"
7. Cambia cantidad a 150g
8. Agregar

RESULTADO:
✅ Almuerzo: 330kcal + 195kcal = 525kcal
✅ Macros automáticas: 62p, 42c, 4f
✅ Fácil y rápido sin código de barras
```

### Caso 3: Usuario edita calorías de alimento

```
👤 Usuario: "Agregué 100g de pollo pero comí 120g"

FLUJO:
1. En la tarjeta de Pollo, toca el ícono 📝
2. Se abre modo edición
3. Cambia "Gramos" de 100 a 120
4. Presiona "💾 GUARDAR"
5. Se recalculan macros automáticamente

RESULTADO:
✅ Pollo: 165 × 1.2 = 198 kcal
✅ Proteína: 31 × 1.2 = 37.2g
✅ Totales del día se actualizan
```

### Caso 4: Usuario revisa insights de IA

```
👤 Usuario: "¿Qué me recomienda la IA hoy?"

FLUJO:
1. Scroll hacia abajo en dashboard
2. Ve sección "💡 SUGERENCIA IA DE HOY"
3. Lee: "Excelente consumo de proteína. Te faltan
   50g de carbohidratos. Sugiero agregar:
   - 100g de arroz cocido
   - 1 banana
   - 1 taza de avena"
4. También ve análisis semanal:
   "Promedio: 2100 kcal/día. Muy consistente!"

RESULTADO:
✅ Información personalizada basada en IA
✅ Sugerencias concretas de alimentos
✅ Análisis de tendencias
```

### Caso 5: Usuario configura objetivos personalizados

```
👤 Usuario: "Quiero cambiar mis objetivos"

FLUJO:
1. En panel derecho, ve "OBJETIVOS NUTRICIONALES"
2. Toca el botón "Editar"
3. Cambia valores:
   - Calorías: 2200 → 2500
   - Proteína: 160g → 180g
   - Carbohidratos: 220g → 280g
   - Grasas: 70g → 80g
4. Presiona "Guardar objetivos"
5. Backend valida y guarda en BD
6. Dashboard se recalcula automáticamente

RESULTADO:
✅ Nuevos objetivos guardados
✅ Gráficos de progreso se actualizan
✅ Cálculo de "Restante" se recalcula
```

### Caso 6: Usuario revisa histórico de 7 días

```
👤 Usuario: "¿Cómo estuvo mi semana?"

FLUJO:
1. En el gráfico "CONSUMO" scroll horizontal
2. Ve últimos 7 días:
   - Lun: 2100 kcal ▓▓▓▓▓░░░
   - Mar: 2250 kcal ▓▓▓▓▓▓░░
   - Mié: 1950 kcal ▓▓▓▓░░░░
   - Jue: 2180 kcal ▓▓▓▓▓░░░
   - Vie: 2100 kcal ▓▓▓▓▓░░░
   - Sab: 2400 kcal ▓▓▓▓▓▓▓░
   - Dom: 2050 kcal ▓▓▓▓▓░░░
3. Lee análisis semanal:
   "Promedio: 2154 kcal. Proteína: 155g.
    Muy consistente. Sigue así!"

RESULTADO:
✅ Visualiza tendencias
✅ Identifica patrones
✅ Motivación basada en datos
```

## 🎨 PALETA DE COLORES NUTRICIÓN

```
Calorías (Fuego):  #3B82F6 (Azul/Brand)
Proteína (Carne):  #10B981 (Esmeralda)
Carbohidratos:     #F59E0B (Ámbar)
Grasas:            #EF4444 (Rojo/Rosa)

Estados:
✓ Completado:      #10B981 (Verde)
⚠️ Excedido:       #EF4444 (Rojo)
🔔 Advertencia:    #F59E0B (Amarillo)
ℹ️ Info:           #3B82F6 (Azul)
```

## 📊 EJEMPLOS DE DATOS

### Ejemplo JSON: NutritionDaySummary

```json
{
  "date": "2024-03-25",
  "goals": {
    "id": 1,
    "user_id": 42,
    "calorie_target": 2200,
    "protein_target": 160,
    "carbs_target": 220,
    "fat_target": 70
  },
  "totals": {
    "calories": 2100,
    "protein": 150,
    "carbs": 250,
    "fat": 65,
    "fiber": 25,
    "sugar": 45
  },
  "remaining": {
    "calories": 100,
    "protein": 10,
    "carbs": -30,
    "fat": 5,
    "fiber": 0,
    "sugar": 0
  },
  "meals": [
    {
      "id": 101,
      "user_id": 42,
      "meal_type": "breakfast",
      "entry_date": "2024-03-25",
      "title": null,
      "created_at": "2024-03-25T08:30:00",
      "foods": [
        {
          "id": 1,
          "meal_entry_id": 101,
          "name": "Huevo frito",
          "brand": null,
          "barcode": null,
          "quantity": 2,
          "unit": "unidad",
          "grams": 110,
          "calories": 310,
          "protein": 26,
          "carbs": 2.2,
          "fat": 22,
          "fiber": null,
          "sugar": null,
          "source": "manual",
          "created_at": "2024-03-25T08:32:00"
        }
      ]
    }
  ]
}
```

## ✨ ANIMACIONES RECOMENDADAS

```css
/* Transición al cargar datos */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Progreso de barra */
@keyframes fillProgress {
  from { width: 0%; }
  to { width: var(--width); }
}

/* Parpadeo de insight IA */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Slide up modal */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

## 🔔 NOTIFICACIONES POTENCIALES

```
✓ "¡Desayuno registrado! 500 kcal añadidas"
⚠️ "Cuidado, excediste carbohidratos por 30g"
🎯 "¡Alcanzaste tu objetivo de proteína!"
💡 "Te recomendamos agregar un snack proteico"
📈 "Semana consistente: Promedio 2100 kcal"
```

## 📱 RESPONSIVE DESIGN

```
MOBILE (< 768px):
- Grid 1 columna
- Macros apiladas verticalmente
- Botones grandes (48px)
- Modales fullscreen

TABLET (768px - 1024px):
- Grid 2 columnas
- Macros side-by-side
- Tamaño normal

DESKTOP (> 1024px):
- Grid 4 columnas de macros
- Sidebar derecho con objetivos
- Gráfico grande de historial
```

## 🎯 MÉTRICAS DE ÉXITO

- ✅ Registrar comida < 30 segundos
- ✅ Escanear código < 5 segundos
- ✅ App responde en < 1 segundo
- ✅ 0% interferencia con módulo de workouts
- ✅ 100% de endpoints funcionando
- ✅ IA genera insights en < 3 segundos
