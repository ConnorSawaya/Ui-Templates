"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DietaryFilter } from "@/lib/types";
import { dietaryFilterLabels } from "@/lib/utils";

interface MenuSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: DietaryFilter[]) => void;
  activeFilters: DietaryFilter[];
}

export function MenuSearch({
  onSearch,
  onFilterChange,
  activeFilters,
}: MenuSearchProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const allFilters: DietaryFilter[] = [
    "vegan",
    "vegetarian",
    "gluten-free",
    "dairy-free",
    "nut-free",
    "high-protein",
    "low-calorie",
    "spicy",
  ];

  const toggleFilter = (filter: DietaryFilter) => {
    const isActive = activeFilters.includes(filter);
    const next = isActive
      ? activeFilters.filter((f) => f !== filter)
      : [...activeFilters, filter];
    onFilterChange(next);
  };

  const clearAll = () => {
    onFilterChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Search menu items..."
          className="w-full rounded-2xl border border-border bg-card py-3 pl-11 pr-12 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors",
            showFilters || activeFilters.length > 0
              ? "text-accent bg-accent/10"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Dietary Filters
                </span>
                {activeFilters.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1 text-xs text-accent"
                  >
                    <X className="h-3 w-3" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allFilters.map((filter) => {
                  const isActive = activeFilters.includes(filter);
                  return (
                    <button
                      key={filter}
                      onClick={() => toggleFilter(filter)}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                        isActive
                          ? "bg-accent text-white"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {dietaryFilterLabels[filter]}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
