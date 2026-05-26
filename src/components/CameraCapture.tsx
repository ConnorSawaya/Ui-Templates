"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, X } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const [streaming, setStreaming] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreaming(true);
    } catch {
      alert("Camera access denied. Please upload an image instead.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStreaming(false);
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setCaptured(dataUrl);
    stopCamera();
  }, [stopCamera]);

  const confirm = useCallback(() => {
    if (captured) onCapture(captured);
  }, [captured, onCapture]);

  if (captured) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border">
        <img
          src={captured}
          alt="Captured"
          className="h-64 w-full object-cover"
        />
        <div className="flex gap-2 p-3">
          <button
            onClick={() => { setCaptured(null); startCamera(); }}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium"
          >
            Retake
          </button>
          <button
            onClick={confirm}
            className="flex-1 rounded-full bg-accent py-2.5 text-sm font-medium text-white"
          >
            Use Photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!streaming ? (
        <button
          onClick={startCamera}
          className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border py-12 transition-colors hover:border-muted-foreground/40"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <Camera className="h-6 w-6 text-accent" />
          </div>
          <span className="text-sm font-medium">Open Camera</span>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-72 w-full bg-black object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-4 p-4">
            <button
              onClick={stopCamera}
              className="rounded-full bg-white/20 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm"
            >
              <X className="mr-1 inline-block h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={capture}
              className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black shadow-lg"
            >
              <Camera className="mr-1 inline-block h-4 w-4" />
              Capture
            </button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
