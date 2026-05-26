"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { SavedScanGrid } from "@/components/SavedScanGrid";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = "all" | "favorites";

export default function SavedPage() {
  const scans = useStore((s) => s.scans);
  const [tab, setTab] = useState<Tab>("all");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-5xl space-y-6 py-6"
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Saved Scans
        </h1>
        <p className="mt-2 text-muted-foreground">
          View and manage your food scan history
        </p>
      </div>

      <div className="flex justify-center gap-2">
        <button
          onClick={() => setTab("all")}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-all",
            tab === "all"
              ? "bg-accent text-white"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          All ({scans.length})
        </button>
        <button
          onClick={() => setTab("favorites")}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-all",
            tab === "favorites"
              ? "bg-accent text-white"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          Favorites ({scans.filter((s) => s.isFavorite).length})
        </button>
      </div>

      <SavedScanGrid
        scans={scans}
        showFavoritesOnly={tab === "favorites"}
        emptyMessage={
          tab === "favorites"
            ? "No favorite scans yet"
            : "No scans yet"
        }
      />
    </motion.div>
  );
}
