"use client";

import { cn } from "@/lib/utils";
import {
  Leaf,
  Beef,
  Wheat,
  Milk,
  Nut,
  Dumbbell,
  Flame,
} from "lucide-react";

const tagConfig: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  vegan: { label: "Vegan", icon: Leaf, color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  vegetarian: { label: "Vegetarian", icon: Leaf, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  "gluten-free": { label: "Gluten-Free", icon: Wheat, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  "dairy-free": { label: "Dairy-Free", icon: Milk, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  "nut-free": { label: "Nut-Free", icon: Nut, color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  "high-protein": { label: "High Protein", icon: Dumbbell, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  "low-calorie": { label: "Low Calorie", icon: Flame, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  spicy: { label: "Spicy", icon: Flame, color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

interface DietaryTagProps {
  tag: string;
  className?: string;
}

export function DietaryTag({ tag, className }: DietaryTagProps) {
  const config = tagConfig[tag.toLowerCase()];
  if (!config) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
        {tag}
      </span>
    );
  }

  const Icon = config.icon as React.ComponentType<{ className?: string }>;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        config.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
