"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Ingredient } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronDown, AlertTriangle, RefreshCw, Info } from "lucide-react";

const categoryColors: Record<string, string> = {
  protein: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  carb: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  vegetable: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  sauce: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  dairy: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  seasoning: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  oil: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
};

interface IngredientCardProps {
  ingredient: Ingredient;
  index: number;
}

export function IngredientCard({ ingredient, index }: IngredientCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-2xl border border-border transition-all cursor-pointer",
        expanded ? "shadow-soft" : "hover:bg-muted/30"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium",
              categoryColors[ingredient.category] || "bg-muted text-muted-foreground"
            )}
          >
            {ingredient.category}
          </span>
          <div>
            <p className="text-sm font-medium">{ingredient.name}</p>
            <p className="text-xs text-muted-foreground">
              {ingredient.estimatedQuantity} · {ingredient.calories} cal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ingredient.allergens.length > 0 && (
            <AlertTriangle className="h-4 w-4 text-warning" />
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
          />
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-border px-4 py-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {ingredient.notes}
              </p>

              {ingredient.allergens.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-warning flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Allergens
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ingredient.allergens.map((a) => (
                      <span
                        key={a}
                        className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs text-warning"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {ingredient.substitutions.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-accent flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Possible Substitutions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ingredient.substitutions.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs text-accent"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
