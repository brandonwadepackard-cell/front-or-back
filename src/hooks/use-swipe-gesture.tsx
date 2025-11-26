import { useState } from 'react';
import { PanInfo } from 'framer-motion';
import { useHaptics } from './use-haptics';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  enableHaptic?: boolean;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  enableHaptic = true,
}: SwipeGestureOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const { triggerHaptic } = useHaptics();

  const handleDragStart = () => {
    setIsDragging(true);
    if (enableHaptic) {
      triggerHaptic('light');
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    
    const { offset, velocity } = info;
    const swipeThreshold = threshold;
    const velocityThreshold = 500;

    // Determine swipe direction based on offset and velocity
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      // Horizontal swipe
      if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
        if (enableHaptic) triggerHaptic('medium');
        onSwipeRight?.();
      } else if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
        if (enableHaptic) triggerHaptic('medium');
        onSwipeLeft?.();
      }
    } else {
      // Vertical swipe
      if (offset.y > swipeThreshold || velocity.y > velocityThreshold) {
        if (enableHaptic) triggerHaptic('medium');
        onSwipeDown?.();
      } else if (offset.y < -swipeThreshold || velocity.y < -velocityThreshold) {
        if (enableHaptic) triggerHaptic('medium');
        onSwipeUp?.();
      }
    }
  };

  return {
    isDragging,
    dragHandlers: {
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      drag: true as const,
      dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
      dragElastic: 0.2,
    },
  };
};
