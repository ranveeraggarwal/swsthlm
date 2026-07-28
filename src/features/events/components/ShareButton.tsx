'use client';

// Share an event's permalink: the native share sheet on mobile, a clipboard copy
// on desktop.
//
// The URL is built from `window.location.origin` rather than the canonical host
// so that sharing from a preview deploy shares a link that actually works.

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { eventPath, type SwingEvent } from '../model/event';
import { useLocale } from '@/components/providers/LocaleProvider';

const COPIED_FEEDBACK_MS = 2000;

export function ShareButton({ event }: { event: SwingEvent }) {
  const { bundle } = useLocale();
  const [copied, setCopied] = useState(false);
  const path = eventPath(event);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: event.title, url });
        return;
      } catch {
        // Cancelled by the user, or unsupported despite being present — fall
        // through to the clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // No clipboard access either. Nothing useful to say, so say nothing.
    }
  };

  return (
    <IconButton
      onClick={handleShare}
      label={copied ? bundle.actions.linkCopied : bundle.actions.share}
      icon={copied ? Check : Share2}
    />
  );
}
