"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRScanner } from "@/components/QRScanner";
import { MenuSearch } from "@/components/MenuSearch";
import { MenuItemCard } from "@/components/MenuItemCard";
import { DisclaimerCard } from "@/components/DisclaimerCard";
import { analyzeMenuText } from "@/lib/ai/analyzeMenuText";
import type { MenuAnalysis, MenuItemAnalysis, DietaryFilter } from "@/lib/types";
import toast from "react-hot-toast";

export default function QRPage() {
  const [analysis, setAnalysis] = useState<MenuAnalysis | null>(null);
  const [filtered, setFiltered] = useState<MenuItemAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"scan" | "loading" | "result" | "manual">("scan");
  const [manualText, setManualText] = useState("");
  const [activeFilters, setActiveFilters] = useState<DietaryFilter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleUrl = async (url: string) => {
    setLoading(true);
    setMode("loading");

    try {
      // Try to fetch the URL content
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error("Fetch failed");

      const text = await response.text();
      if (text.trim()) {
        const result = await analyzeMenuText(text);
        setAnalysis(result);
        setFiltered(result.items);
        setMode("result");
      } else {
        setMode("manual");
        toast("Could not extract menu from URL. Please paste the menu manually.");
      }
    } catch {
      setMode("manual");
      toast("Could not access that URL. Paste the menu manually instead.");
    }

    setLoading(false);
  };

  const handleManualSubmit = async () => {
    if (!manualText.trim()) return;
    setLoading(true);
    setMode("loading");

    const result = await analyzeMenuText(manualText);
    setAnalysis(result);
    setFiltered(result.items);
    setMode("result");
    setLoading(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!analysis) return;
    let items = analysis.items;
    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }
    if (activeFilters.length > 0) {
      items = items.filter((item) =>
        activeFilters.every((f) => item.dietaryTags.includes(f))
      );
    }
    setFiltered(items);
  };

  const handleFilterChange = (filters: DietaryFilter[]) => {
    setActiveFilters(filters);
    handleSearch(searchQuery);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl space-y-6 py-6"
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          QR Scanner
        </h1>
        <p className="mt-2 text-muted-foreground">
          Scan a restaurant QR code or paste a URL to view the menu
        </p>
      </div>

      <AnimatePresence mode="wait">
        {mode === "scan" && (
          <motion.div
            key="scan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QRScanner onResult={handleUrl} />
          </motion.div>
        )}

        {mode === "manual" && (
          <motion.div
            key="manual"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="glass rounded-3xl p-6 shadow-card">
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Paste Menu Manually
              </h3>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste the restaurant menu here..."
                rows={10}
                className="w-full resize-none rounded-2xl border border-border bg-muted/30 p-4 text-sm outline-none transition-colors focus:border-accent"
              />
              <button
                onClick={handleManualSubmit}
                disabled={!manualText.trim() || loading}
                className="mt-4 w-full rounded-full bg-accent py-3 text-sm font-medium text-white transition-all hover:bg-accent/90 disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Analyze Menu"}
              </button>
            </div>
            <button
              onClick={() => setMode("scan")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Scan again
            </button>
          </motion.div>
        )}

        {mode === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            <div className="glass rounded-3xl px-8 py-6 shadow-card text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Fetching and analyzing menu...
              </p>
            </div>
          </motion.div>
        )}

        {mode === "result" && analysis && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {analysis.restaurantName && (
              <div className="glass rounded-2xl px-5 py-3 shadow-soft">
                <p className="text-xs text-muted-foreground">Restaurant</p>
                <p className="text-base font-semibold">
                  {analysis.restaurantName}
                </p>
              </div>
            )}

            <MenuSearch
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              activeFilters={activeFilters}
            />

            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <p className="text-sm font-medium">No matching items</p>
                  <p className="text-xs">Try adjusting your filters</p>
                </div>
              ) : (
                filtered.map((item, i) => (
                  <MenuItemCard key={item.name + i} item={item} index={i} />
                ))
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
            </p>

            <div className="flex justify-center">
              <button
                onClick={() => { setMode("scan"); setAnalysis(null); }}
                className="rounded-full border border-border px-5 py-2 text-sm font-medium transition-all hover:bg-muted"
              >
                Scan Again
              </button>
            </div>

            <DisclaimerCard />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
