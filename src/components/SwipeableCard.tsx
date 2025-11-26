import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { Trash2, Archive, Check } from 'lucide-react';
import { Card } from './ui/card';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';
import { cn } from '@/lib/utils';

interface SwipeAction {
  icon: ReactNode;
  label: string;
  action: () => void;
  color: string;
}

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  className?: string;
  threshold?: number;
}

export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className,
  threshold = 100,
}: SwipeableCardProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-threshold, 0, threshold], [1, 0, 1]);
  const scale = useTransform(x, [-threshold, 0, threshold], [1, 0.95, 1]);

  const { dragHandlers } = useSwipeGesture({
    onSwipeLeft: () => {
      if (onSwipeLeft) {
        setIsRevealed(true);
        onSwipeLeft();
      }
    },
    onSwipeRight: () => {
      if (onSwipeRight) {
        setIsRevealed(true);
        onSwipeRight();
      }
    },
    threshold,
  });

  const defaultLeftAction: SwipeAction = {
    icon: <Trash2 className="w-5 h-5" />,
    label: 'Delete',
    action: () => onSwipeLeft?.(),
    color: 'bg-destructive',
  };

  const defaultRightAction: SwipeAction = {
    icon: <Archive className="w-5 h-5" />,
    label: 'Archive',
    action: () => onSwipeRight?.(),
    color: 'bg-primary',
  };

  const leftActionConfig = leftAction || (onSwipeLeft ? defaultLeftAction : null);
  const rightActionConfig = rightAction || (onSwipeRight ? defaultRightAction : null);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Left action background */}
      {leftActionConfig && (
        <motion.div
          className={cn(
            'absolute inset-0 flex items-center justify-end px-6',
            leftActionConfig.color
          )}
          style={{ opacity: useTransform(x, [-threshold, 0], [1, 0]) }}
        >
          <div className="flex items-center gap-2 text-white">
            {leftActionConfig.icon}
            <span className="font-semibold">{leftActionConfig.label}</span>
          </div>
        </motion.div>
      )}

      {/* Right action background */}
      {rightActionConfig && (
        <motion.div
          className={cn(
            'absolute inset-0 flex items-center justify-start px-6',
            rightActionConfig.color
          )}
          style={{ opacity: useTransform(x, [0, threshold], [0, 1]) }}
        >
          <div className="flex items-center gap-2 text-white">
            {rightActionConfig.icon}
            <span className="font-semibold">{rightActionConfig.label}</span>
          </div>
        </motion.div>
      )}

      {/* Card content */}
      <motion.div
        style={{ x, scale }}
        {...dragHandlers}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.2, right: 0.2 }}
        animate={isRevealed ? { opacity: 0, scale: 0.8 } : {}}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <Card>{children}</Card>
      </motion.div>
    </div>
  );
};
