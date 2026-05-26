"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Link as LinkIcon, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface QRScannerProps {
  onResult: (url: string) => void;
}

export function QRScanner({ onResult }: QRScannerProps) {
  const [mode, setMode] = useState<"choose" | "scan" | "manual">("choose");
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }
    onResult(finalUrl);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {mode === "choose" && (
          <motion.div
            key="choose"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <button
              onClick={() => setMode("scan")}
              className="glass flex flex-col items-center gap-3 rounded-3xl p-8 shadow-card transition-all hover:shadow-elevated active:scale-[0.98]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                <Camera className="h-7 w-7 text-accent" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold">Scan QR Code</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use your camera to scan
                </p>
              </div>
            </button>

            <button
              onClick={() => setMode("manual")}
              className="glass flex flex-col items-center gap-3 rounded-3xl p-8 shadow-card transition-all hover:shadow-elevated active:scale-[0.98]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                <LinkIcon className="h-7 w-7 text-accent" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold">Paste URL</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter a restaurant menu URL
                </p>
              </div>
            </button>
          </motion.div>
        )}

        {mode === "scan" && (
          <motion.div
            key="scan"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-3xl p-6 shadow-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Scan QR Code</h3>
              <button
                onClick={() => setMode("choose")}
                className="rounded-full p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <QRCodeReader
              onResult={(url) => {
                toast.success("QR Code detected!");
                onResult(url);
              }}
              onBack={() => setMode("choose")}
            />
          </motion.div>
        )}

        {mode === "manual" && (
          <motion.div
            key="manual"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-3xl p-6 shadow-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Enter Menu URL</h3>
              <button
                onClick={() => setMode("choose")}
                className="rounded-full p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://restaurant.com/menu"
                className="flex-1 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
              />
              <button
                type="submit"
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
              >
                Fetch
              </button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">
              If the URL is not accessible, you&apos;ll be able to paste the menu
              text manually.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QRCodeReader({
  onResult,
  onBack,
}: {
  onResult: (url: string) => void;
  onBack: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let html5QrCode: any = null;

    const start = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        html5QrCode = new Html5Qrcode("qr-reader");

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            html5QrCode?.stop();
            onResult(decodedText);
          },
          () => {}
        );
      } catch (err) {
        setError(
          "Camera access unavailable. Please use the URL paste option instead."
        );
      }
    };

    start();

    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [onResult]);

  return (
    <div>
      <div
        id="qr-reader"
        ref={containerRef}
        className="overflow-hidden rounded-2xl"
      />
      {error && (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-warning">{error}</p>
          <button
            onClick={onBack}
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white"
          >
            Back to options
          </button>
        </div>
      )}
    </div>
  );
}
