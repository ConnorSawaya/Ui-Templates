"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { Moon, Sun, Trash2, Download } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const scans = useStore((s) => s.scans);

  const handleExportAll = () => {
    const data = JSON.stringify(scans, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "platevision-scans.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported");
  };

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to clear all data? This cannot be undone."
      )
    ) {
      localStorage.removeItem("platevision-store");
      window.location.reload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-2xl space-y-6 py-6"
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          App preferences and data management
        </p>
      </div>

      <div className="glass rounded-3xl p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Dark Mode</p>
            <p className="text-xs text-muted-foreground">
              Toggle between light and dark themes
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Data
        </h3>
        <div className="space-y-3">
          <button
            onClick={handleExportAll}
            className="flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3 text-left transition-all hover:bg-muted"
          >
            <div>
              <p className="text-sm font-medium">Export All Data</p>
              <p className="text-xs text-muted-foreground">
                Download your scans as JSON ({scans.length} scans)
              </p>
            </div>
            <Download className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            onClick={handleClearData}
            className="flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3 text-left transition-all hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <div>
              <p className="text-sm font-medium text-destructive">
                Clear All Data
              </p>
              <p className="text-xs text-muted-foreground">
                Remove all scans and preferences
              </p>
            </div>
            <Trash2 className="h-5 w-5 text-destructive" />
          </button>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 shadow-card">
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          About
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">AI Provider</span>
            <span className="font-medium">Demo Mode (local)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data Storage</span>
            <span className="font-medium">Local (browser)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
