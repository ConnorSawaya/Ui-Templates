"use client";

import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadCardProps {
  onImage: (file: File, dataUrl: string) => void;
  className?: string;
}

export function UploadCard({ onImage, className }: UploadCardProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleCamera = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  const clearPreview = useCallback(() => {
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }, []);

  const confirmImage = useCallback(() => {
    if (!preview || !fileName) return;
    const file = new File([], fileName, { type: "image/jpeg" });
    onImage(file, preview);
  }, [preview, fileName, onImage]);

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic"
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-200",
              dragOver
                ? "border-accent bg-accent/5"
                : "border-border bg-muted/30 hover:border-muted-foreground/40"
            )}
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <Upload className="h-6 w-6 text-accent" />
            </div>
            <p className="text-base font-medium">
              Drop your food photo here
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              JPG, PNG, HEIC accepted
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <ImageIcon className="mr-2 inline-block h-4 w-4" />
                Browse Files
              </button>
              <button
                onClick={handleCamera}
                className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-[0.98]"
              >
                <Camera className="mr-2 inline-block h-4 w-4" />
                Use Camera
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="overflow-hidden rounded-2xl border border-border"
          >
            <div className="relative">
              <img
                src={preview}
                alt="Food preview"
                className="h-72 w-full object-cover"
              />
              <div className="absolute inset-x-0 top-0 flex justify-between p-3">
                <span className="rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm">
                  {fileName}
                </span>
                <button
                  onClick={clearPreview}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-2 p-3">
              <button
                onClick={clearPreview}
                className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium transition-all hover:bg-muted active:scale-[0.98]"
              >
                Retake
              </button>
              <button
                onClick={confirmImage}
                className="flex-1 rounded-full bg-accent py-2.5 text-sm font-medium text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
              >
                Analyze Food
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
