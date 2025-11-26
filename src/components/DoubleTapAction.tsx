import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDoubleTap } from '@/hooks/use-double-tap';
import { cn } from '@/lib/utils';

interface DoubleTapActionProps {
  children: ReactNode;
  onDoubleTap: () => void;
  onSingleTap?: () => void;
  icon?: ReactNode;
  feedbackText?: string;
  className?: string;
}

export const DoubleTapAction = ({
  children,
  onDoubleTap,
  onSingleTap,
  icon,
  feedbackText = 'Action!',
  className,
}: DoubleTapActionProps) => {
  const [showFeedback, setShowFeedback] = useState(false);

  const handleDoubleTap = () => {
    setShowFeedback(true);
    onDoubleTap();
    setTimeout(() => setShowFeedback(false), 1000);
  };

  const { onClick } = useDoubleTap({
    onDoubleTap: handleDoubleTap,
    onSingleTap,
    delay: 300,
  });

  return (
    <div className={cn('relative', className)} onClick={onClick}>
      {children}
      
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-2xl flex items-center gap-2"
            >
              {icon && <span className="text-xl">{icon}</span>}
              <span className="font-semibold">{feedbackText}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
