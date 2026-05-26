import type { Ingredient } from "../types";

export async function extractIngredients(
  dishName: string,
  description: string
): Promise<Ingredient[]> {
  return [
    {
      name: "Sample Ingredient",
      category: "protein",
      estimatedQuantity: "100g",
      calories: 150,
      allergens: [],
      notes: "Sample ingredient extracted",
      substitutions: ["alternative 1", "alternative 2"],
    },
  ];
}
