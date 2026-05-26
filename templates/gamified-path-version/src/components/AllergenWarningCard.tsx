"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert } from "lucide-react";

interface AllergenWarningCardProps {
  warnings: string[];
  severe?: boolean;
}

export function AllergenWarningCard({
  warnings,
  severe = false,
}: AllergenWarningCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-3xl border p-5 shadow-soft ${
        severe
          ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30"
          : "border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            severe ? "bg-red-100 text-red-600 dark:bg-red-900/50" : "bg-orange-100 text-orange-600 dark:bg-orange-900/50"
          }`}
        >
          {severe ? (
            <ShieldAlert className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <h3
            className={`text-sm font-semibold ${
              severe ? "text-red-800 dark:text-red-300" : "text-orange-800 dark:text-orange-300"
            }`}
          >
            {severe
              ? "Allergy Warning"
              : "Potential Allergen Notice"}
          </h3>
          {severe && (
            <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
              Do not rely only on AI for allergy safety.
            </p>
          )}
          <ul className="mt-2 space-y-1.5">
            {warnings.map((w) => (
              <li
                key={w}
                className={`flex items-center gap-2 text-sm ${
                  severe ? "text-red-700 dark:text-red-300" : "text-orange-700 dark:text-orange-300"
                }`}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
