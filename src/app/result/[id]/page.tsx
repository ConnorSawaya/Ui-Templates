"use client";

import { Suspense, use } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { ResultSummaryCard } from "@/components/ResultSummaryCard";
import { getDemoFoodAnalysis } from "@/lib/ai/demoData";
import { useSearchParams } from "next/navigation";
import type { MenuItemAnalysis } from "@/lib/types";

function ResultContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const scan = useStore((s) => s.getScan(id));
  const demoParam = searchParams.get("demo");

  if (demoParam) {
    try {
      const item: MenuItemAnalysis = JSON.parse(decodeURIComponent(demoParam));
      const demoAnalysis = getDemoFoodAnalysis();
      const mergedAnalysis = {
        ...demoAnalysis,
        id,
        dishName: item.name,
        summary: item.description,
        ingredients: item.likelyIngredients.map((name) => ({
          name,
          category: "vegetable",
          estimatedQuantity: "100g",
          calories: Math.round(item.estimatedNutrition.calories / Math.max(item.likelyIngredients.length, 1)),
          allergens: item.allergens.filter((a) => name.toLowerCase().includes(a) || a.includes(name)),
          notes: "Detected from menu analysis",
          substitutions: [],
        })),
        nutrition: {
          calories: item.estimatedNutrition.calories,
          protein: item.estimatedNutrition.protein,
          carbs: item.estimatedNutrition.carbs,
          fat: item.estimatedNutrition.fat,
          sodium: 0,
          sugar: 0,
        },
        dietaryTags: item.dietaryTags,
        allergenWarnings: item.allergens,
        healthScore: item.healthScore,
        hiddenIngredients: [],
        confidenceNotes: "Analysis based on menu text. Actual dish may vary.",
        createdAt: new Date().toISOString(),
      };

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto max-w-3xl py-6"
        >
          <ResultSummaryCard analysis={mergedAnalysis} />
        </motion.div>
      );
    } catch {
      // fall through
    }
  }

  if (!scan) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-muted-foreground">
          Scan not found
        </p>
        <p className="mt-1 text-sm text-muted-foreground/60">
          This scan may have been deleted or the link is invalid.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl py-6"
    >
      <ResultSummaryCard analysis={scan.analysis} imageUrl={scan.imageUrl} />
    </motion.div>
  );
}

export default function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      }
    >
      <ResultContent id={id} />
    </Suspense>
  );
}
