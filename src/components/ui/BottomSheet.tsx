import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
}

/**
 * A slide-up bottom sheet on mobile that becomes a centered modal on larger
 * screens — the native-feeling alternative to a desktop popup.
 */
export function BottomSheet({ open, onClose, title, description, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative z-10 w-full max-w-[480px] rounded-t-3xl bg-white pb-safe shadow-2xl sm:rounded-3xl sm:max-w-md"
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.4 }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
          >
            <div className="flex justify-center pt-3 sm:hidden">
              <span className="h-1.5 w-10 rounded-full bg-navy-200" aria-hidden />
            </div>
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-4">
                <div>
                  {title && <h2 className="text-lg font-bold text-navy-900">{title}</h2>}
                  {description && <p className="mt-0.5 text-sm text-navy-500">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="touch-target -mr-2 -mt-1 grid place-items-center rounded-full text-navy-400 hover:bg-navy-50 hover:text-navy-700 focus-ring"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="max-h-[78vh] overflow-y-auto px-5 pb-6 pt-2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
