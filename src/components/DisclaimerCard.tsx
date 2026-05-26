"use client";

import { Info } from "lucide-react";

export function DisclaimerCard() {
  return (
    <div className="rounded-2xl border border-border bg-muted/50 p-4">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            PlateVision uses AI estimates and may be incorrect. Always check
            with the restaurant or product label for allergies or medical needs.
          </p>
          <p className="font-medium text-destructive">
            Do not rely only on AI for allergy safety.
          </p>
        </div>
      </div>
    </div>
  );
}
