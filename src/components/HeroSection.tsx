"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-accent)_0%,_transparent_60%)] opacity-10 dark:opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent"
        >
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse-soft" />
          AI-Powered Food Intelligence
        </motion.div>

        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          See what&apos;s really
          <br />
          <span className="bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">
            in your food.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
          Scan food, menus, or QR codes to instantly understand ingredients,
          nutrition, allergens, and dish structure — powered by AI.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/scan"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-semibold text-background shadow-lg shadow-foreground/10 transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Start Scanning
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/scan?demo=true"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-8 py-3.5 text-sm font-semibold text-foreground shadow-soft transition-all hover:bg-muted active:scale-[0.98]"
          >
            <Play className="h-4 w-4" />
            View Demo
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-20 w-full max-w-2xl"
      >
        <div className="glass rounded-3xl p-1 shadow-elevated">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-accent/5 to-blue-500/5 p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-muted-foreground">Analysis Result</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Grilled Chicken Salad</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">
                    Health Score: 82/100
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Calories</span>
                    <span className="font-medium">490</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Protein</span>
                    <span className="font-medium">42g</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Carbs</span>
                    <span className="font-medium">18g</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Fat</span>
                    <span className="font-medium">28g</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">Ingredients</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Chicken Breast
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Mixed Greens
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Cherry Tomatoes
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    Olive Oil Vinaigrette
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-16 grid grid-cols-3 gap-8 text-center text-sm text-muted-foreground">
        {[
          { value: "10K+", label: "Dishes Analyzed" },
          { value: "98%", label: "Accuracy Rate" },
          { value: "50+", label: "Dietary Filters" },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
