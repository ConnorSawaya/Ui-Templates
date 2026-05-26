"use client";

import { Suspense, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { UploadCard } from "@/components/UploadCard";
import { CameraCapture } from "@/components/CameraCapture";
import { ScanProgress } from "@/components/ScanProgress";
import { ResultSummaryCard } from "@/components/ResultSummaryCard";
import { DisclaimerCard } from "@/components/DisclaimerCard";
import { analyzeFoodImage } from "@/lib/ai/analyzeFoodImage";
import { useStore } from "@/lib/store";
import type { FoodAnalysis } from "@/lib/types";
import { Camera } from "lucide-react";

function ScanContent() {
  const searchParams = useSearchParams();
  const addScan = useStore((s) => s.addScan);

  const [mode, setMode] = useState<"upload" | "camera" | "result" | "loading">(
    searchParams.get("demo") === "true" ? "loading" : "upload"
  );
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [progressStage, setProgressStage] = useState<
    "uploading" | "analyzing" | "extracting" | "complete"
  >("uploading");

  const handleImage = useCallback(
    async (file: File, dataUrl: string) => {
      setImagePreview(dataUrl);
      setMode("loading");
      setProgressStage("uploading");
      await new Promise((r) => setTimeout(r, 500));
      setProgressStage("analyzing");
      const result = await analyzeFoodImage(dataUrl);
      setProgressStage("extracting");
      await new Promise((r) => setTimeout(r, 400));
      setProgressStage("complete");
      await new Promise((r) => setTimeout(r, 300));
      setAnalysis(result);
      addScan(result, dataUrl);
      setMode("result");
    },
    [addScan]
  );

  if (searchParams.get("demo") === "true" && mode === "loading" && !analysis) {
    handleImage(new File([], "demo.jpg", { type: "image/jpeg" }), "");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl space-y-6 py-6"
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Scan Your Food
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload a photo or use your camera to analyze any dish
        </p>
      </div>

      <AnimatePresence mode="wait">
        {mode === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setMode("camera")}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-all hover:bg-muted active:scale-[0.98]"
              >
                <Camera className="h-4 w-4" />
                Use Camera
              </button>
            </div>
            <UploadCard onImage={handleImage} />
            <DisclaimerCard />
          </motion.div>
        )}

        {mode === "camera" && (
          <motion.div
            key="camera"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <button
              onClick={() => setMode("upload")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to upload
            </button>
            <CameraCapture
              onCapture={(dataUrl) => {
                handleImage(new File([], "camera.jpg", { type: "image/jpeg" }), dataUrl);
              }}
            />
            <DisclaimerCard />
          </motion.div>
        )}

        {mode === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-12"
          >
            <ScanProgress stage={progressStage} />
          </motion.div>
        )}

        {mode === "result" && analysis && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ResultSummaryCard analysis={analysis} imageUrl={imagePreview} />
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setMode("upload");
                  setAnalysis(null);
                  setImagePreview(undefined);
                }}
                className="rounded-full border border-border px-6 py-2.5 text-sm font-medium transition-all hover:bg-muted active:scale-[0.98]"
              >
                Scan Another Dish
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      }
    >
      <ScanContent />
    </Suspense>
  );
}
