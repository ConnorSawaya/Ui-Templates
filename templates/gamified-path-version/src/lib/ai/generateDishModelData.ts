export interface DishModelData {
  ingredients: DishIngredient[];
  dishColor: string;
  plateColor: string;
}

export interface DishIngredient {
  name: string;
  color: string;
  volume: number; // 0-1, relative volume
  position: [number, number, number]; // x, y, z
}

const ingredientColors: Record<string, string> = {
  protein: "#d4a574",
  carb: "#f5deb3",
  vegetable: "#4ade80",
  sauce: "#f97316",
  dairy: "#fef3c7",
  seasoning: "#a16207",
  oil: "#fbbf24",
  fruit: "#f472b6",
};

const positions: [number, number, number][] = [
  [0, 0.05, 0],
  [0.4, 0, 0.4],
  [-0.4, 0, 0.4],
  [0.4, 0, -0.4],
  [-0.4, 0, -0.4],
  [0, 0, 0.5],
  [0, 0, -0.5],
  [0.5, 0, 0],
  [-0.5, 0, 0],
];

export async function generateDishModelData(
  dishName: string,
  ingredients: { name: string; category: string }[]
): Promise<DishModelData> {
  const mapped = ingredients.map((ing, i) => ({
    name: ing.name,
    color: ingredientColors[ing.category] || "#888888",
    volume: Math.max(0.1, 1 - i * 0.1),
    position: positions[i % positions.length],
  }));

  return {
    ingredients: mapped,
    dishColor: "#ffffff",
    plateColor: "#e5e7eb",
  };
}
