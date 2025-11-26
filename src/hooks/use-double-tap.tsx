import { useCallback, useRef } from 'react';
import { useHaptics } from './use-haptics';

interface DoubleTapOptions {
  onDoubleTap: () => void;
  onSingleTap?: () => void;
  delay?: number;
  enableHaptic?: boolean;
}

export const useDoubleTap = ({
  onDoubleTap,
  onSingleTap,
  delay = 300,
  enableHaptic = true,
}: DoubleTapOptions) => {
  const tapCountRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const { triggerHaptic } = useHaptics();

  const handleTap = useCallback(() => {
    tapCountRef.current += 1;

    if (tapCountRef.current === 1) {
      if (enableHaptic) {
        triggerHaptic('light');
      }

      timerRef.current = setTimeout(() => {
        if (tapCountRef.current === 1) {
          onSingleTap?.();
        }
        tapCountRef.current = 0;
      }, delay);
    } else if (tapCountRef.current === 2) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      if (enableHaptic) {
        triggerHaptic('medium');
      }
      
      onDoubleTap();
      tapCountRef.current = 0;
    }
  }, [delay, enableHaptic, onDoubleTap, onSingleTap, triggerHaptic]);

  return {
    onClick: handleTap,
  };
};
