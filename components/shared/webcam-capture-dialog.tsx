"use client";

/**
 * Webcam Capture Dialog
 *
 * Reusable dialog component for capturing photos from the user's webcam.
 * Opens a dialog with live camera preview, capture, retake, and confirm flow.
 *
 * Usage:
 * <WebcamCaptureDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onCapture={(blob) => handleUpload(blob)}
 * />
 */

import { useState, useCallback, useEffect } from "react";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWebcam } from "@/hooks/use-webcam";
import { Camera, RotateCcw, Check, XIcon } from "lucide-react";

interface WebcamCaptureDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onCapture: (blob: Blob) => void;
}

export function WebcamCaptureDialog({
   open,
   onOpenChange,
   onCapture,
}: WebcamCaptureDialogProps) {
   const { videoRef, start, stop, capture, isActive, error } = useWebcam();
   const [capturedImage, setCapturedImage] = useState<string | null>(null);
   const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

   // Start camera when dialog opens, stop when it closes
   useEffect(() => {
      if (open) {
         start();
      } else {
         stop();
      }
   }, [open, start, stop]);

   const handleCapture = useCallback(() => {
      const blob = capture();
      if (blob) {
         setCapturedBlob(blob);
         setCapturedImage(URL.createObjectURL(blob));
         stop();
      }
   }, [capture, stop]);

   const handleRetake = useCallback(() => {
      if (capturedImage) {
         URL.revokeObjectURL(capturedImage);
      }
      setCapturedImage(null);
      setCapturedBlob(null);
      start();
   }, [capturedImage, start]);

   const handleConfirm = useCallback(() => {
      if (capturedBlob) {
         onCapture(capturedBlob);
         onOpenChange(false);
      }
   }, [capturedBlob, onCapture, onOpenChange]);

   const handleClose = useCallback(
      (isOpen: boolean) => {
         if (!isOpen) {
            stop();
            if (capturedImage) {
               URL.revokeObjectURL(capturedImage);
            }
            setCapturedImage(null);
            setCapturedBlob(null);
         }
         onOpenChange(isOpen);
      },
      [stop, capturedImage, onOpenChange]
   );

   return (
      <Dialog open={open} onOpenChange={handleClose}>
         <DialogContent className="sm:max-w-md">
            <DialogHeader>
               <DialogTitle>Take a Photo</DialogTitle>
               <DialogDescription>
                  Use your webcam to capture a profile photo.
               </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
               {/* Camera preview / Captured image */}
               <div className="relative w-full max-w-sm aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                  {error ? (
                     <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center">
                        <Camera className="w-10 h-10 text-muted-foreground" />
                        <p className="text-sm text-destructive">{error}</p>
                     </div>
                  ) : capturedImage ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img
                        src={capturedImage}
                        alt="Captured photo"
                        className="w-full h-full object-cover"
                     />
                  ) : (
                     <>
                        <video
                           ref={videoRef}
                           autoPlay
                           playsInline
                           muted
                           className="w-full h-full object-cover -scale-x-100"
                        />
                        {!isActive && !error && (
                           <div className="absolute inset-0 flex items-center justify-center bg-muted">
                              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                           </div>
                        )}
                     </>
                  )}
               </div>
            </div>
            <DialogFooter className="flex-row justify-center gap-2 sm:justify-center">
               {error ? (
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                     <XIcon className="w-4 h-4 mr-2" />
                     Close
                  </Button>
               ) : capturedImage ? (
                  <>
                     <Button variant="outline" onClick={handleRetake}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retake
                     </Button>
                     <Button onClick={handleConfirm}>
                        <Check className="w-4 h-4 mr-2" />
                        Use Photo
                     </Button>
                  </>
               ) : (
                  <Button onClick={handleCapture} disabled={!isActive}>
                     <Camera className="w-4 h-4 mr-2" />
                     Capture
                  </Button>
               )}
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
