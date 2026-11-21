"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

// Frames without a readable code raise these constantly; they are not failures.
const TRANSIENT_NAMES = ["NotFoundException", "ChecksumException", "FormatException"];
// Before the first video frame arrives the decoder reads a 0x0 canvas; that resolves itself.
const isEmptyFrameError = (err: any) => err?.name === "IndexSizeError" || /source width is 0|source height is 0/i.test(err?.message || "");

const friendlyError = (err: any) => {
  if (err?.name === "NotAllowedError") return "Camera permission denied. Allow camera access and reload the page.";
  if (err?.name === "NotFoundError" || err?.name === "OverconstrainedError") return "No camera device found.";
  if (err?.name === "NotReadableError") return "The camera is in use by another app or tab. Close it and reload.";
  return err?.message || "Could not start the camera.";
};

/**
 * Streams the camera into `videoRef` and calls `onDecode(text)` for every decoded frame.
 * `deviceId = null` lets the browser pick the rear camera on phones.
 *
 * Runs are chained: each one waits for the previous one to be fully stopped before it opens the
 * camera, so a camera that starts late (navigation, switching camera, StrictMode) is always shut down.
 */
export function useQrScanner({ videoRef, onDecode, deviceId }: { videoRef: RefObject<HTMLVideoElement | null>; onDecode: (text: string) => void; deviceId: string | null }) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const onDecodeRef = useRef(onDecode);
  onDecodeRef.current = onDecode;
  const previousStop = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const video = videoRef.current;
    let cancelled = false;
    let reader: any = null;
    setError("");
    setReady(false);

    const start = async () => {
      await previousStop.current; // the last run has released the camera
      if (cancelled) return;
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("This browser cannot access the camera (HTTPS is required).");
        const zxing = await import("@zxing/library");
        if (cancelled) return;
        reader = new zxing.BrowserMultiFormatReader();
        await reader.decodeFromVideoDevice(deviceId, video, (result: any, err: any) => {
          if (cancelled) return;
          if (result) onDecodeRef.current(result.getText());
          else if (err && !TRANSIENT_NAMES.includes(err.name) && !isEmptyFrameError(err)) setError(err.message || "QR scan error");
        });
        if (cancelled) return;
        setReady(true);
        // Labels are only available once permission is granted, so list after starting.
        const list = await reader.listVideoInputDevices();
        if (!cancelled) setDevices(list);
      } catch (err) {
        if (!cancelled) setError(friendlyError(err));
      }
    };
    const running = start();

    return () => {
      cancelled = true;
      // Stop only after the start attempt has settled, even if the camera opens after we left.
      previousStop.current = running.then(() => {
        try {
          reader?.reset();
        } catch {
          // already stopped
        }
        const stream = video?.srcObject as MediaStream | null | undefined;
        stream?.getTracks?.().forEach((track) => track.stop());
        if (video) video.srcObject = null;
      });
    };
  }, [deviceId, videoRef]);

  return { devices, ready, error };
}
