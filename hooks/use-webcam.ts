/**
 * Webcam Hook
 *
 * Manages webcam MediaStream lifecycle for capturing photos.
 * Handles stream initialization, photo capture to Blob, and cleanup.
 *
 * Usage:
 * const { videoRef, start, stop, capture, isActive, error } = useWebcam();
 * await start();
 * const blob = capture();
 * stop();
 */
import { useState, useRef, useCallback, useEffect } from "react";

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  start: () => Promise<void>;
  stop: () => void;
  capture: () => Blob | null;
  isActive: boolean;
  error: string | null;
}

export function useWebcam(): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);

    // Stop any existing stream first
    if (streamRef.current) {
      stop();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsActive(true);
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera access in your browser settings."
          : err instanceof DOMException && err.name === "NotFoundError"
            ? "No camera found. Please connect a camera and try again."
            : "Failed to access camera. Please check your browser permissions.";
      setError(message);
      setIsActive(false);
    }
  }, [stop]);

  const capture = useCallback((): Blob | null => {
    const video = videoRef.current;
    if (!video || !isActive) return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Mirror horizontally to match the preview (user-facing camera)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    let blob: Blob | null = null;
    canvas.toBlob(
      (b) => {
        blob = b;
      },
      "image/jpeg",
      0.9,
    );

    // toBlob is async but with a synchronous callback in most browsers
    // Use a synchronous fallback via toDataURL
    if (!blob) {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const byteString = atob(dataUrl.split(",")[1]);
      const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      blob = new Blob([ab], { type: mimeString });
    }

    return blob;
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return { videoRef, start, stop, capture, isActive, error };
}
