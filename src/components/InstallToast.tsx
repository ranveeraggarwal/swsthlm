'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

const DISMISSED_KEY = 'pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallToast() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-slide-up">
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--on-surface)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] lift-card">
        <div className="flex-1 min-w-0">
          <p className="font-sans font-bold text-sm">Add to Home Screen</p>
          <p className="font-sans text-xs text-[var(--on-surface-variant)] mt-0.5">
            Quick access to Stockholm swing events
          </p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded bg-[var(--primary)] text-[var(--on-primary)] font-bold uppercase tracking-wider text-xs lift-btn-primary cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="shrink-0 p-1 rounded text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
