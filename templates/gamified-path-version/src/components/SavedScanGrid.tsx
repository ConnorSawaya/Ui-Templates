"use client";

import { motion } from "framer-motion";
import type { Scan } from "@/lib/types";
import { formatDate, getHealthColor } from "@/lib/utils";
import { Heart, Trash2, Clock, Bookmark } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";

interface SavedScanGridProps {
  scans: Scan[];
  emptyMessage?: string;
  showFavoritesOnly?: boolean;
}

export function SavedScanGrid({
  scans,
  emptyMessage = "No scans yet",
  showFavoritesOnly = false,
}: SavedScanGridProps) {
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const removeScan = useStore((s) => s.removeScan);

  const displayScans = showFavoritesOnly
    ? scans.filter((s) => s.isFavorite)
    : scans;

  if (displayScans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Bookmark className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-base font-medium text-muted-foreground">
          {emptyMessage}
        </p>
        <p className="mt-1 text-sm text-muted-foreground/60">
          Scan some food to see results here
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {displayScans.map((scan, i) => {
        const healthColor = getHealthColor(scan.analysis.healthScore);
        return (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:shadow-card"
          >
            <Link href={`/result/${scan.id}`}>
              {scan.imageUrl ? (
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={scan.imageUrl}
                    alt={scan.dishName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center bg-muted">
                  <span className="text-4xl">🍽️</span>
                </div>
              )}
            </Link>

            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <Link href={`/result/${scan.id}`}>
                    <h3 className="text-sm font-semibold truncate hover:text-accent transition-colors">
                      {scan.dishName}
                    </h3>
                  </Link>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(scan.createdAt)}
                  </p>
                </div>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: healthColor }}
                >
                  {scan.analysis.healthScore}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {scan.analysis.nutrition.calories} cal
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {scan.analysis.ingredients.length} ingredients
                </span>
              </div>

              <div className="mt-3 flex gap-1.5">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(scan.id);
                    toast.success(
                      scan.isFavorite
                        ? "Removed from favorites"
                        : "Added to favorites"
                    );
                  }}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-red-500"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      scan.isFavorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeScan(scan.id);
                    toast.success("Scan removed");
                  }}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
