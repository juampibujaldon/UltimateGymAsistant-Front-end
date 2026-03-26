import type { NutritionFoodLookupResult } from "../../../types";

interface OpenFoodFactsResponse {
  code: string;
  product?: {
    product_name?: string;
    brands?: string;
    image_front_small_url?: string;
    serving_quantity?: number;
    nutriments?: {
      "energy-kcal_100g"?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
      fiber_100g?: number;
      sugars_100g?: number;
    };
  };
  status: number;
}

const OPEN_FOOD_FACTS_API = "https://world.openfoodfacts.org/api/v2/product";

export async function lookupOpenFoodFactsBarcode(barcode: string): Promise<NutritionFoodLookupResult> {
  const response = await fetch(`${OPEN_FOOD_FACTS_API}/${barcode}.json`);

  if (!response.ok) {
    throw new Error("Barcode lookup failed");
  }

  const data = (await response.json()) as OpenFoodFactsResponse;
  const product = data.product;

  if (data.status !== 1 || !product?.product_name) {
    throw new Error("Product not found");
  }

  return {
    barcode,
    name: product.product_name,
    brand: product.brands ?? null,
    image_url: product.image_front_small_url ?? null,
    default_grams: product.serving_quantity || 100,
    calories_per_100g: product.nutriments?.["energy-kcal_100g"] ?? 0,
    protein_per_100g: product.nutriments?.proteins_100g ?? 0,
    carbs_per_100g: product.nutriments?.carbohydrates_100g ?? 0,
    fat_per_100g: product.nutriments?.fat_100g ?? 0,
    fiber_per_100g: product.nutriments?.fiber_100g ?? null,
    sugar_per_100g: product.nutriments?.sugars_100g ?? null,
    source: "openfoodfacts",
  };
}
