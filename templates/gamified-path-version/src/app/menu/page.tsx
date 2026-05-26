"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuSearch } from "@/components/MenuSearch";
import { MenuItemCard } from "@/components/MenuItemCard";
import { DisclaimerCard } from "@/components/DisclaimerCard";
import { ScanProgress } from "@/components/ScanProgress";
import { analyzeMenuText } from "@/lib/ai/analyzeMenuText";
import type { MenuAnalysis, MenuItemAnalysis, DietaryFilter } from "@/lib/types";
import { Upload, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function MenuPage() {
  const [analysis, setAnalysis] = useState<MenuAnalysis | null>(null);
  const [filtered, setFiltered] = useState<MenuItemAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"choose" | "text" | "image" | "result">("choose");
  const [menuText, setMenuText] = useState("");
  const [activeFilters, setActiveFilters] = useState<DietaryFilter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleMenuText = useCallback(async () => {
    if (!menuText.trim()) return;
    setLoading(true);
    setMode("result");

    try {
      const result = await analyzeMenuText(menuText);
      setAnalysis(result);
      setFiltered(result.items);
      setLoading(false);
    } catch {
      toast.error("Failed to analyze menu");
      setLoading(false);
    }
  }, [menuText]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!analysis) return;
      let items = analysis.items;

      if (query) {
        const q = query.toLowerCase();
        items = items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.likelyIngredients.some((ing) => ing.toLowerCase().includes(q))
        );
      }

      if (activeFilters.length > 0) {
        items = items.filter((item) =>
          activeFilters.every((f) => item.dietaryTags.includes(f))
        );
      }

      setFiltered(items);
    },
    [analysis, activeFilters]
  );

  const handleFilterChange = useCallback(
    (filters: DietaryFilter[]) => {
      setActiveFilters(filters);
      handleSearch(searchQuery);
    },
    [handleSearch, searchQuery]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl space-y-6 py-6"
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Menu Scanner
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload a menu photo or paste menu text to analyze items
        </p>
      </div>

      <AnimatePresence mode="wait">
        {mode === "choose" && (
          <motion.div
            key="choose"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <button
              onClick={() => setMode("text")}
              className="glass flex flex-col items-center gap-3 rounded-3xl p-8 shadow-card transition-all hover:shadow-elevated active:scale-[0.98]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                <FileText className="h-7 w-7 text-accent" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold">Paste Menu Text</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Type or paste a restaurant menu
                </p>
              </div>
            </button>
            <button
              onClick={() => setMode("image")}
              className="glass flex flex-col items-center gap-3 rounded-3xl p-8 shadow-card transition-all hover:shadow-elevated active:scale-[0.98]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                <Upload className="h-7 w-7 text-accent" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold">Upload Menu Image</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Take a photo or upload a menu
                </p>
              </div>
            </button>
          </motion.div>
        )}

        {mode === "text" && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <button
              onClick={() => setMode("choose")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <div className="glass rounded-3xl p-6 shadow-card">
              <textarea
                value={menuText}
                onChange={(e) => setMenuText(e.target.value)}
                placeholder="Paste the restaurant menu here...&#10;&#10;Example:&#10;Classic Caesar Salad - $14&#10;Grilled Salmon Plate - $24&#10;Truffle Mushroom Risotto - $18&#10;Spicy Thai Noodle Bowl - $16&#10;Vegan Power Bowl - $17"
                rows={12}
                className="w-full resize-none rounded-2xl border border-border bg-muted/30 p-4 text-sm outline-none transition-colors focus:border-accent"
              />
              <button
                onClick={handleMenuText}
                disabled={!menuText.trim() || loading}
                className="mt-4 w-full rounded-full bg-accent py-3 text-sm font-medium text-white transition-all hover:bg-accent/90 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "Analyzing..." : "Analyze Menu"}
              </button>
            </div>
          </motion.div>
        )}

        {mode === "image" && (
          <motion.div
            key="image"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <button
              onClick={() => setMode("choose")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <div className="glass rounded-3xl p-6 shadow-card">
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-12 transition-colors hover:border-muted-foreground/40"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    setLoading(true);
                    setMode("result");
                    try {
                      const { createWorker } = await import("tesseract.js");
                      const worker = await createWorker("eng");
                      const {
                        data: { text },
                      } = await worker.recognize(file);
                      await worker.terminate();
                      if (text.trim()) {
                        const result = await analyzeMenuText(text);
                        setAnalysis(result);
                        setFiltered(result.items);
                      } else {
                        toast.error("No text found in image");
                        setMode("choose");
                      }
                    } catch {
                      toast.error("OCR failed. Try pasting the menu text manually.");
                      setMode("text");
                    }
                    setLoading(false);
                  };
                  input.click();
                }}
              >
                <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Click to upload menu image
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  OCR will extract the text automatically
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {mode === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {loading ? (
              <ScanProgress stage="analyzing" />
            ) : (
              <>
                {analysis?.restaurantName && (
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
              </>
            )}

            <div className="flex justify-center gap-3">
              <button
                onClick={() => { setMode("choose"); setAnalysis(null); }}
                className="rounded-full border border-border px-5 py-2 text-sm font-medium transition-all hover:bg-muted"
              >
                Scan Another Menu
              </button>
            </div>

            <DisclaimerCard />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
