"use client";

import { motion } from "framer-motion";
import { PreferenceForm } from "@/components/PreferenceForm";
import { useStore } from "@/lib/store";
import { SavedScanGrid } from "@/components/SavedScanGrid";
import { User, Activity, Settings } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const scans = useStore((s) => s.scans);
  const user = useStore((s) => s.user);
  const preferences = useStore((s) => s.preferences);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl space-y-8 py-6"
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <User className="h-8 w-8 text-accent" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          {user ? user.name : "Local Profile"}
        </p>
      </div>

      {!user && (
        <div className="glass rounded-3xl p-6 shadow-card">
          <p className="text-sm text-muted-foreground">
            Sign-in is not required. Your data is saved locally on this device.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-4 text-center shadow-soft">
          <p className="text-2xl font-bold text-accent">{scans.length}</p>
          <p className="text-xs text-muted-foreground">Total Scans</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center shadow-soft">
          <p className="text-2xl font-bold text-green-500">
            {scans.filter((s) => s.analysis.healthScore >= 70).length}
          </p>
          <p className="text-xs text-muted-foreground">Healthy Meals</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center shadow-soft">
          <p className="text-2xl font-bold text-accent">
            {preferences.allergies.length}
          </p>
          <p className="text-xs text-muted-foreground">Allergies Tracked</p>
        </div>
      </div>

      <PreferenceForm />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Scans</h2>
          <Link
            href="/saved"
            className="text-sm text-accent hover:underline"
          >
            View all
          </Link>
        </div>
        <SavedScanGrid
          scans={scans.slice(0, 3)}
          emptyMessage="No scans yet"
        />
      </div>
    </motion.div>
  );
}
