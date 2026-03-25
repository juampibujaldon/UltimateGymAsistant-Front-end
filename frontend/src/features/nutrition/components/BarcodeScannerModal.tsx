import { useEffect, useRef, useState } from "react";
import { Camera, ScanLine, X } from "lucide-react";

type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>;
};

type WindowWithBarcode = Window & {
  BarcodeDetector?: new (options?: { formats?: string[] }) => BarcodeDetectorLike;
};

export default function BarcodeScannerModal({
  open,
  onClose,
  onDetected,
  labels,
}: {
  open: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
  labels: Record<string, string>;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let stream: MediaStream | null = null;
    let intervalId: number | null = null;

    const startScanner = async () => {
      const detectorCtor = (window as WindowWithBarcode).BarcodeDetector;
      if (!detectorCtor || !navigator.mediaDevices?.getUserMedia) return;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const detector = new detectorCtor({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });
        intervalId = window.setInterval(async () => {
          if (!videoRef.current || !canvasRef.current) return;
          const ctx = canvasRef.current.getContext("2d");
          if (!ctx) return;

          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0);

          const codes = await detector.detect(canvasRef.current);
          const rawValue = codes[0]?.rawValue;
          if (rawValue) {
            onDetected(rawValue);
            onClose();
          }
        }, 900);
      } catch {
        setError(labels.cameraError);
      }
    };

    void startScanner();

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [labels.cameraError, onClose, onDetected, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-md rounded-[2rem] p-5 animate-slide-up"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-text">
            <ScanLine className="h-5 w-5 text-brand-300" />
            {labels.scanTitle}
          </h3>
          <button type="button" className="text-text-secondary hover:text-text" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-surface-border bg-surface-hover">
          <video ref={videoRef} className="aspect-[4/3] w-full object-cover" muted playsInline />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <p className="mt-3 text-sm text-text-secondary">{labels.scanHint}</p>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

        <div className="mt-4">
          <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-text-muted">{labels.manualCode}</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              placeholder="7791234567890"
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => manualCode.trim() && onDetected(manualCode.trim())}
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
