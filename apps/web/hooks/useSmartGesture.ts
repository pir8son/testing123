
import React, { useRef, useCallback } from 'react';

interface SmartGestureHandlers {
  onSingleTap: () => void;
  onDoubleTap: () => void;
  delay?: number;
}

export const useSmartGesture = ({ onSingleTap, onDoubleTap, delay = 250 }: SmartGestureHandlers) => {
  const lastTapRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const timeDiff = now - lastTapRef.current;

    if (timeDiff < delay && timeDiff > 0) {
      // Double Tap Detected
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onDoubleTap();
      lastTapRef.current = 0; // Reset to prevent triple-tap triggering another double-tap
    } else {
      // Potential Single Tap
      lastTapRef.current = now;
      timerRef.current = setTimeout(() => {
        onSingleTap();
        timerRef.current = null;
        lastTapRef.current = 0;
      }, delay);
    }
  }, [onSingleTap, onDoubleTap, delay]);

  return handleTap;
};
