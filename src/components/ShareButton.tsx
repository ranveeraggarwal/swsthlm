'use client';

// Share button for event cards. Uses navigator.share on mobile (native sheet),
// falls back to clipboard copy on desktop. The permalink structure is:
//   /event/[sourceId]/[YYYY-MM-DD]
// where sourceId is extracted from the occurrence id (`${sourceId}:${date}`).

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  eventId: string;  // occurrenceId: "${sourceId}:${date}"
  eventDate: string; // YYYY-MM-DD
  eventTitle: string;
}

export function ShareButton({ eventId, eventDate, eventTitle }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const sourceId = eventId.split(':')[0];
  const path = `/event/${sourceId}/${eventDate}`;

  const handleShare = async () => {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}${path}`
      : path;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: eventTitle, url });
        return;
      } catch {
        // Aborted or unsupported — fall through to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard also unavailable — silent fail
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      title={copied ? 'Link copied!' : 'Share event'}
      aria-label={copied ? 'Link copied!' : 'Share event'}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-[var(--on-surface)] bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer shrink-0"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share
        </>
      )}
    </button>
  );
}
