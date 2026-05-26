"use client";

import { motion } from "framer-motion";
import { Salad, Search, Cpu, CheckCircle } from "lucide-react";

interface ScanProgressProps {
  stage: "uploading" | "analyzing" | "extracting" | "complete";
}

const stages = [
  { key: "uploading", label: "Uploading image", icon: Salad },
  { key: "analyzing", label: "Analyzing with AI", icon: Search },
  { key: "extracting", label: "Extracting ingredients", icon: Cpu },
  { key: "complete", label: "Analysis complete", icon: CheckCircle },
] as const;

export function ScanProgress({ stage }: ScanProgressProps) {
  const currentIndex = stages.findIndex((s) => s.key === stage);

  return (
    <div className="glass rounded-2xl p-6 shadow-card">
      <div className="flex items-center justify-between">
        {stages.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === currentIndex;
          const isComplete = i < currentIndex;
          const isPending = i > currentIndex;

          return (
            <div key={s.key} className="flex flex-col items-center gap-2">
              <motion.div
                animate={
                  isActive
                    ? { scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 2 } }
                    : {}
                }
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all ${
                  isComplete
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "bg-accent text-white shadow-lg shadow-accent/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </motion.div>
              <span
                className={`text-xs font-medium ${
                  isActive
                    ? "text-accent"
                    : isComplete
                    ? "text-green-500"
                    : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentIndex + 1) / stages.length) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full bg-accent"
        />
      </div>
    </div>
  );
}
