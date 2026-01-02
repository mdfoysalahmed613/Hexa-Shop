import { useState, useCallback } from "react";

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isSwiping: boolean;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}: UseSwipeOptions) {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isSwiping: false,
  });

  const swipeOffset = swipeState.isSwiping
    ? swipeState.currentX - swipeState.startX
    : 0;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setSwipeState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isSwiping: true,
    });
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!swipeState.isSwiping) return;

      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - swipeState.startX);
      const deltaY = Math.abs(touch.clientY - swipeState.startY);

      // Only consider horizontal swipes
      if (deltaX > deltaY) {
        e.preventDefault();
      }

      setSwipeState((prev) => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
      }));
    },
    [swipeState.isSwiping, swipeState.startX, swipeState.startY]
  );

  const handleTouchEnd = useCallback(() => {
    if (!swipeState.isSwiping) return;

    const deltaX = swipeState.currentX - swipeState.startX;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }

    setSwipeState((prev) => ({
      ...prev,
      isSwiping: false,
    }));
  }, [swipeState, threshold, onSwipeLeft, onSwipeRight]);

  return {
    swipeOffset,
    isSwiping: swipeState.isSwiping,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
