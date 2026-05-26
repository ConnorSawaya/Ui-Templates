"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { Plate3DViewer } from "@/components/Plate3DViewer";
import { getDemoFoodAnalysis } from "@/lib/ai/demoData";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PlatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const scan = useStore((s) => s.getScan(id));
  const analysis = scan?.analysis || getDemoFoodAnalysis();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-5xl space-y-6 py-6"
    >
      <Link
        href={`/result/${id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to analysis
      </Link>

      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {analysis.dishName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Interactive 3D dish view — drag to rotate, click ingredients to learn
          more
        </p>
      </div>

      <Plate3DViewer analysis={analysis} />
    </motion.div>
  );
}
