"use client";

import React, { useEffect, useRef, useState } from "react";

export default function QRScannerModal({ open, onClose, onDetected }: { open: boolean; onClose: () => void; onDetected: (token: string) => void; }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const detectorRef = useRef<any>(null);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (!mounted) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if ((window as any).BarcodeDetector) {
          try {
            const BarcodeDetectorConstructor = (window as any).BarcodeDetector;
            const supported = await BarcodeDetectorConstructor.getSupportedFormats?.();
            detectorRef.current = new BarcodeDetectorConstructor({ formats: ["qr_code"] });
            const tick = async () => {
              if (!videoRef.current || videoRef.current.readyState < 2) {
                requestAnimationFrame(tick);
                return;
              }
              try {
                const detections = await detectorRef.current.detect(videoRef.current);
                if (detections && detections.length) {
                  const token = detections[0].rawValue || detections[0].raw_data || detections[0].rawvalue || detections[0].rawValue;
                  if (token) onDetected(String(token));
                }
              } catch (e) {
              }
              requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          } catch (e) {
          }
        } else {
          setError("Camera scanning not supported in this browser. You can paste token manually.");
        }
      } catch (err: any) {
        setError(err?.message || "Could not access camera");
      }
    })();

    return () => {
      mounted = false;
      try { if (videoRef.current) videoRef.current.pause(); } catch (e) {}
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      detectorRef.current = null;
    };
  }, [open, onDetected]);

  const [manual, setManual] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/70 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl p-4 w-full max-w-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-lg font-semibold">Scan Registration QR</h3>
          <button onClick={onClose} className="text-muted-foreground">Close</button>
        </div>
        <div className="space-y-3">
          <div className="w-full h-64 bg-black rounded-md overflow-hidden flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline />
            {!((window as any).BarcodeDetector) && (
              <div className="absolute text-sm text-background/80">Camera scanning not available — paste token below</div>
            )}
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-2">
            <input className="flex-1 rounded-md border px-2 py-1" placeholder="Paste token here" value={manual} onChange={(e) => setManual(e.target.value)} />
            <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground" onClick={() => { if (manual) onDetected(manual); }}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
