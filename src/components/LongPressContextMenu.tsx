import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLongPress } from '@/hooks/use-long-press';
import { cn } from '@/lib/utils';

export interface ContextMenuItem {
  icon?: ReactNode;
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive';
}

interface LongPressContextMenuProps {
  children: ReactNode;
  menuItems: ContextMenuItem[];
  className?: string;
}

export const LongPressContextMenu = ({
  children,
  menuItems,
  className,
}: LongPressContextMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleLongPress = (event: React.TouchEvent | React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setIsMenuOpen(true);
  };

  const { handlers, isLongPressing } = useLongPress({
    onLongPress: handleLongPress,
    delay: 500,
  });

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  const handleBackdropClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <motion.div
        {...handlers}
        className={cn('relative', className)}
        animate={isLongPressing ? { scale: 0.95 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleBackdropClick}
            />

            {/* Context Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="fixed z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden min-w-[200px]"
              style={{
                left: menuPosition.x,
                top: menuPosition.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {menuItems.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleMenuItemClick(item.action)}
                  whileHover={{ backgroundColor: 'hsl(var(--accent))' }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    item.variant === 'destructive' && 'text-destructive',
                    index !== menuItems.length - 1 && 'border-b border-border'
                  )}
                >
                  {item.icon && <span className="text-lg">{item.icon}</span>}
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
