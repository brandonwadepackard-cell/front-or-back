import { useCallback, useRef, useState } from 'react';
import { useHaptics } from './use-haptics';

interface LongPressOptions {
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
  delay?: number;
  enableHaptic?: boolean;
}

export const useLongPress = ({
  onLongPress,
  onLongPressStart,
  onLongPressEnd,
  delay = 500,
  enableHaptic = true,
}: LongPressOptions) => {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const { triggerHaptic } = useHaptics();

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      event.preventDefault();
      
      if (enableHaptic) {
        triggerHaptic('light');
      }
      
      setIsLongPressing(true);
      onLongPressStart?.();

      timerRef.current = setTimeout(() => {
        if (enableHaptic) {
          triggerHaptic('medium');
        }
        onLongPress(event);
        setIsLongPressing(false);
      }, delay);
    },
    [delay, enableHaptic, onLongPress, onLongPressStart, triggerHaptic]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsLongPressing(false);
    onLongPressEnd?.();
  }, [onLongPressEnd]);

  const handlers = {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
  };

  return {
    handlers,
    isLongPressing,
  };
};
