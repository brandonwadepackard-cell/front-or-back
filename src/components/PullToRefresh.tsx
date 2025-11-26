import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useHaptics } from '@/hooks/use-haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { triggerHaptic } = useHaptics();
  
  const y = useMotionValue(0);
  const pullProgress = useTransform(y, [0, threshold], [0, 1]);
  const rotation = useTransform(pullProgress, [0, 1], [0, 360]);

  const handleDragEnd = async (_: any, info: PanInfo) => {
    if (info.offset.y > threshold && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic('medium');
      
      try {
        await onRefresh();
        triggerHaptic('success');
      } catch (error) {
        triggerHaptic('error');
      } finally {
        setIsRefreshing(false);
        setHasTriggeredHaptic(false);
      }
    }
    
    y.set(0);
    setHasTriggeredHaptic(false);
  };

  const handleDrag = (_: any, info: PanInfo) => {
    const containerTop = containerRef.current?.getBoundingClientRect().top || 0;
    const scrollTop = containerRef.current?.scrollTop || 0;
    
    // Only allow pull-to-refresh when at the top of the scroll container
    if (scrollTop === 0 && containerTop >= 0 && info.offset.y > 0) {
      const dragY = Math.min(info.offset.y, threshold * 1.5);
      y.set(dragY);
      
      // Trigger haptic feedback when threshold is reached
      if (dragY >= threshold && !hasTriggeredHaptic && !isRefreshing) {
        triggerHaptic('light');
        setHasTriggeredHaptic(true);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative h-full overflow-auto">
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="min-h-full"
      >
        {/* Pull-to-refresh indicator */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
          style={{
            top: -60,
            opacity: pullProgress,
          }}
        >
          <motion.div
            style={{ rotate: isRefreshing ? 360 : rotation }}
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            className="w-12 h-12 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center"
          >
            <RefreshCw className="w-6 h-6 text-primary" />
          </motion.div>
        </motion.div>

        {children}
      </motion.div>
    </div>
  );
};
