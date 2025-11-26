import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';
import { useHaptics } from '@/hooks/use-haptics';

interface SwipeNavigationProps {
  children: ReactNode;
  routes?: string[];
  className?: string;
}

export const SwipeNavigation = ({
  children,
  routes = ['/', '/dashboard', '/content', '/history', '/templates', '/calendar', '/analytics'],
  className,
}: SwipeNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerHaptic } = useHaptics();

  const currentIndex = routes.indexOf(location.pathname);

  const handleSwipeLeft = () => {
    if (currentIndex < routes.length - 1) {
      triggerHaptic('light');
      navigate(routes[currentIndex + 1]);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      triggerHaptic('light');
      navigate(routes[currentIndex - 1]);
    }
  };

  const { dragHandlers } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 100,
  });

  return (
    <motion.div
      {...dragHandlers}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.1, right: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
