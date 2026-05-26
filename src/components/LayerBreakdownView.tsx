"use client";

import { motion } from "framer-motion";
import type { Ingredient } from "@/lib/types";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  protein: "bg-amber-500",
  carb: "bg-yellow-500",
  vegetable: "bg-green-500",
  sauce: "bg-orange-500",
  dairy: "bg-blue-400",
  seasoning: "bg-purple-500",
  oil: "bg-yellow-400",
  fruit: "bg-pink-400",
};

interface LayerBreakdownViewProps {
  ingredients: Ingredient[];
}

export function LayerBreakdownView({ ingredients }: LayerBreakdownViewProps) {
  const layers = ingredients.map((ing, i) => ({
    ...ing,
    depth: ingredients.length - i,
    color: categoryColors[ing.category] || "bg-gray-400",
  }));

  return (
    <div className="glass rounded-3xl p-6 shadow-card">
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Ingredient Layers
      </h3>
      <div className="space-y-2">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative flex items-center gap-4 rounded-xl bg-muted/30 px-4 py-3"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white",
                layer.color
              )}
            >
              {layers.length - i}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{layer.name}</p>
              <p className="text-xs text-muted-foreground">
                {layer.category} · {layer.estimatedQuantity}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {layer.calories} cal
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
