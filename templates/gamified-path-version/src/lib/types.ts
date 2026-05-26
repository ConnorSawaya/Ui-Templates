export interface Ingredient {
  name: string;
  category: string;
  estimatedQuantity: string;
  calories: number;
  allergens: string[];
  notes: string;
  substitutions: string[];
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number;
  sugar: number;
}

export interface FoodAnalysis {
  id: string;
  dishName: string;
  confidence: number;
  summary: string;
  imageUrl?: string;
  ingredients: Ingredient[];
  nutrition: NutritionInfo;
  dietaryTags: string[];
  allergenWarnings: string[];
  healthScore: number;
  hiddenIngredients: string[];
  confidenceNotes: string;
  createdAt: string;
}

export interface MenuItemAnalysis {
  name: string;
  description: string;
  likelyIngredients: string[];
  estimatedNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  allergens: string[];
  dietaryTags: string[];
  healthScore: number;
}

export interface MenuAnalysis {
  restaurantName: string | null;
  items: MenuItemAnalysis[];
}

export interface UserPreferences {
  allergies: string[];
  foodsToAvoid: string[];
  dietType: string;
  calorieGoal: number;
  proteinGoal: number;
}

export interface Scan {
  id: string;
  userId?: string;
  imageUrl?: string;
  dishName: string;
  analysis: FoodAnalysis;
  createdAt: string;
  isFavorite: boolean;
}

export type DietaryFilter = 
  | "vegan"
  | "vegetarian"
  | "gluten-free"
  | "dairy-free"
  | "nut-free"
  | "high-protein"
  | "low-calorie"
  | "spicy";
