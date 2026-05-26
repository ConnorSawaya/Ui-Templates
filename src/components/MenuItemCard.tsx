"use client";

import { motion } from "framer-motion";
import type { MenuItemAnalysis } from "@/lib/types";
import { DietaryTag } from "./DietaryTag";
import { getHealthColor } from "@/lib/utils";
import { ChevronRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { generateId } from "@/lib/utils";

interface MenuItemCardProps {
  item: MenuItemAnalysis;
  index: number;
}

export function MenuItemCard({ item, index }: MenuItemCardProps) {
  const healthColor = getHealthColor(item.healthScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link
        href={`/result/${generateId()}?demo=${encodeURIComponent(JSON.stringify(item))}`}
        className="group block rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:shadow-card active:scale-[0.99]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold truncate">{item.name}</h3>
              {item.allergens.length > 0 && (
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {item.description}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.dietaryTags.slice(0, 3).map((tag) => (
                <DietaryTag key={tag} tag={tag} />
              ))}
              {item.dietaryTags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{item.dietaryTags.length - 3}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white"
              style={{ backgroundColor: healthColor }}
            >
              {item.healthScore}
            </div>
            <span className="text-xs text-muted-foreground">
              {item.estimatedNutrition.calories} cal
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
