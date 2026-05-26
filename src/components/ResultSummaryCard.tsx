"use client";

import { motion } from "framer-motion";
import type { FoodAnalysis } from "@/lib/types";
import { NutritionRing } from "./NutritionRing";
import { AllergenWarningCard } from "./AllergenWarningCard";
import { DietaryTag } from "./DietaryTag";
import { IngredientCard } from "./IngredientCard";
import { DisclaimerCard } from "./DisclaimerCard";
import { useStore } from "@/lib/store";
import { getHealthColor } from "@/lib/utils";
import { Sparkles, Cuboid, Heart, Share2, FileDown, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

interface ResultSummaryCardProps {
  analysis: FoodAnalysis;
  imageUrl?: string;
}

export function ResultSummaryCard({ analysis, imageUrl }: ResultSummaryCardProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const healthColor = getHealthColor(analysis.healthScore);

  const handleExport = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("PlateVision - Analysis Report", 20, 30);
      doc.setFontSize(14);
      doc.text(`Dish: ${analysis.dishName}`, 20, 50);
      doc.text(`Health Score: ${analysis.healthScore}/100`, 20, 65);
      doc.text(`Calories: ${analysis.nutrition.calories}`, 20, 80);
      doc.text(`Protein: ${analysis.nutrition.protein}g`, 20, 95);
      doc.text(`Carbs: ${analysis.nutrition.carbs}g`, 20, 110);
      doc.text(`Fat: ${analysis.nutrition.fat}g`, 20, 125);
      doc.save(`${analysis.dishName.replace(/\s+/g, "_")}_analysis.pdf`);
      toast.success("PDF exported");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: analysis.dishName, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass overflow-hidden rounded-3xl shadow-card">
        {imageUrl && (
          <div className="relative h-56 sm:h-72">
            <img
              src={imageUrl}
              alt={analysis.dishName}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white drop-shadow-sm">
                    {analysis.dishName}
                  </h2>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                    {(analysis.confidence * 100).toFixed(0)}% match
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white"
                style={{ backgroundColor: healthColor }}
              >
                {analysis.healthScore}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className="text-lg font-semibold">
                  {analysis.healthScore >= 80
                    ? "Excellent"
                    : analysis.healthScore >= 60
                    ? "Good"
                    : analysis.healthScore >= 40
                    ? "Fair"
                    : "Needs Improvement"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="rounded-full border border-border p-2.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleExport}
                className="rounded-full border border-border p-2.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                title="Export PDF"
              >
                <FileDown className="h-4 w-4" />
              </button>
              <Link
                href={`/plate/${analysis.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
              >
                <Cuboid className="h-4 w-4" />
                3D View
              </Link>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {analysis.summary}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Nutrition Profile
          </h3>
          <div className="flex justify-between gap-2">
            <NutritionRing
              label="Calories"
              value={analysis.nutrition.calories}
              unit=""
              max={800}
              color="#0a84ff"
            />
            <NutritionRing
              label="Protein"
              value={analysis.nutrition.protein}
              unit="g"
              max={60}
              color="#34c759"
            />
            <NutritionRing
              label="Carbs"
              value={analysis.nutrition.carbs}
              unit="g"
              max={80}
              color="#ff9f0a"
            />
            <NutritionRing
              label="Fat"
              value={analysis.nutrition.fat}
              unit="g"
              max={60}
              color="#ff3b30"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between rounded-xl bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Sodium</span>
              <span className="font-medium">{analysis.nutrition.sodium}mg</span>
            </div>
            <div className="flex justify-between rounded-xl bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Sugar</span>
              <span className="font-medium">{analysis.nutrition.sugar}g</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Dietary Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.dietaryTags.map((tag) => (
              <DietaryTag key={tag} tag={tag} />
            ))}
          </div>

          {analysis.hiddenIngredients.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-warning flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                Hidden Ingredients Detected
              </p>
              <ul className="space-y-1">
                {analysis.hiddenIngredients.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg bg-warning/10 px-3 py-1.5 text-sm text-warning"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {analysis.allergenWarnings.length > 0 && (
        <AllergenWarningCard warnings={analysis.allergenWarnings} />
      )}

      <div className="glass rounded-3xl p-6 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Ingredients
        </h3>
        <div className="space-y-3">
          {analysis.ingredients.map((ingredient, i) => (
            <IngredientCard key={ingredient.name} ingredient={ingredient} index={i} />
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl p-6 shadow-card">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="flex w-full items-center justify-between"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Ask a question about this dish
          </h3>
          <span className="text-muted-foreground">{chatOpen ? "−" : "+"}</span>
        </button>
        {chatOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="mt-4"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="e.g. Is this keto-friendly?"
                className="flex-1 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
              />
              <button
                onClick={() => {
                  toast.success(`Demo: "${chatMessage}" — In production, this would query an AI.`);
                  setChatMessage("");
                }}
                className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent/90"
              >
                Ask
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <DisclaimerCard />

      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <Link
          href={`/plate/${analysis.id}`}
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 transition-all hover:bg-muted"
        >
          <Cuboid className="h-4 w-4" />
          View 3D Dish
        </Link>
        <button
          onClick={() => {
            useStore.getState().toggleFavorite(analysis.id);
            toast.success("Added to favorites");
          }}
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 transition-all hover:bg-muted"
        >
          <Heart className="h-4 w-4" />
          Save
        </button>
      </div>
    </motion.div>
  );
}
