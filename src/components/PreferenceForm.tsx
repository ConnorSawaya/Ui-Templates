"use client";

import { useStore } from "@/lib/store";
import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const dietTypes = [
  { value: "none", label: "No restriction" },
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "keto", label: "Keto" },
  { value: "paleo", label: "Paleo" },
  { value: "mediterranean", label: "Mediterranean" },
];

export function PreferenceForm() {
  const preferences = useStore((s) => s.preferences);
  const setPreferences = useStore((s) => s.setPreferences);

  const [allergyInput, setAllergyInput] = useState("");
  const [avoidInput, setAvoidInput] = useState("");

  const addAllergy = () => {
    if (!allergyInput.trim()) return;
    setPreferences({
      allergies: [...preferences.allergies, allergyInput.trim().toLowerCase()],
    });
    setAllergyInput("");
  };

  const addAvoid = () => {
    if (!avoidInput.trim()) return;
    setPreferences({
      foodsToAvoid: [...preferences.foodsToAvoid, avoidInput.trim().toLowerCase()],
    });
    setAvoidInput("");
  };

  const removeAllergy = (item: string) => {
    setPreferences({
      allergies: preferences.allergies.filter((a) => a !== item),
    });
  };

  const removeAvoid = (item: string) => {
    setPreferences({
      foodsToAvoid: preferences.foodsToAvoid.filter((a) => a !== item),
    });
  };

  const handleSave = () => {
    toast.success("Preferences saved");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass rounded-3xl p-6 shadow-card">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Diet Type
        </h3>
        <div className="flex flex-wrap gap-2">
          {dietTypes.map((diet) => (
            <button
              key={diet.value}
              onClick={() => setPreferences({ dietType: diet.value })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                preferences.dietType === diet.value
                  ? "bg-accent text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {diet.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl p-6 shadow-card">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Allergies & Intolerances
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
            placeholder="e.g. peanuts, shellfish, dairy"
            className="flex-1 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
          />
          <button
            onClick={addAllergy}
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white"
          >
            Add
          </button>
        </div>
        {preferences.allergies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {preferences.allergies.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300"
              >
                {a}
                <button
                  onClick={() => removeAllergy(a)}
                  className="ml-0.5 hover:text-red-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="glass rounded-3xl p-6 shadow-card">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Foods to Avoid
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={avoidInput}
            onChange={(e) => setAvoidInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAvoid())}
            placeholder="e.g. mushrooms, cilantro"
            className="flex-1 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
          />
          <button
            onClick={addAvoid}
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white"
          >
            Add
          </button>
        </div>
        {preferences.foodsToAvoid.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {preferences.foodsToAvoid.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
              >
                {a}
                <button
                  onClick={() => removeAvoid(a)}
                  className="ml-0.5 hover:text-orange-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-3xl p-6 shadow-card">
          <label className="text-sm font-medium text-muted-foreground">
            Daily Calorie Goal
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min="1200"
              max="4000"
              step="50"
              value={preferences.calorieGoal}
              onChange={(e) =>
                setPreferences({ calorieGoal: parseInt(e.target.value) })
              }
              className="flex-1 accent-accent"
            />
            <span className="min-w-[4rem] text-right text-sm font-semibold">
              {preferences.calorieGoal}
            </span>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 shadow-card">
          <label className="text-sm font-medium text-muted-foreground">
            Daily Protein Goal (g)
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min="20"
              max="200"
              step="5"
              value={preferences.proteinGoal}
              onChange={(e) =>
                setPreferences({ proteinGoal: parseInt(e.target.value) })
              }
              className="flex-1 accent-accent"
            />
            <span className="min-w-[4rem] text-right text-sm font-semibold">
              {preferences.proteinGoal}g
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full rounded-full bg-accent py-3 text-sm font-medium text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
      >
        Save Preferences
      </button>
    </motion.div>
  );
}
