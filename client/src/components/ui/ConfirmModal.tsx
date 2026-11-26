import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidthClass?: string;
}

export function ModalDialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidthClass = 'max-w-lg',
}: ModalDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#17231C]/45 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.16 }}
            className={`relative z-10 w-full ${maxWidthClass} rounded-xl border border-[#DCE3DC] bg-white p-6 text-[#17231C] shadow-[0_20px_50px_rgba(18,61,43,0.16)]`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#DCE3DC] pb-3.5">
              <div>
                <h3 className="font-display text-base font-semibold text-[#17231C]">{title}</h3>
                {subtitle ? <p className="mt-0.5 text-xs text-[#55655C]">{subtitle}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#55655C] hover:bg-[#F2F5F1] hover:text-[#17231C] transition-colors"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
