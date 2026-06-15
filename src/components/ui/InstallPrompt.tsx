import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from './Logo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'heloc.install.dismissed';

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="fixed inset-x-0 bottom-[84px] z-40 mx-auto w-[calc(100%-2rem)] max-w-[440px] lg:bottom-6 lg:left-auto lg:right-6 lg:mx-0"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-navy-800 p-3 pr-2 text-white shadow-card-hover">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10">
              <Download size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 flex items-center gap-1.5 text-sm font-semibold">
                Install <Logo chip className="h-3" />
              </p>
              <p className="truncate text-xs text-white/70">Add to your home screen for a faster, app-like experience.</p>
            </div>
            <button
              onClick={install}
              className="touch-target shrink-0 rounded-xl bg-crimson-500 px-3.5 py-2 text-sm font-semibold hover:bg-crimson-600 focus-ring"
            >
              Install
            </button>
            <button
              onClick={dismiss}
              aria-label="Dismiss install prompt"
              className="touch-target grid shrink-0 place-items-center rounded-xl text-white/60 hover:text-white focus-ring"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
