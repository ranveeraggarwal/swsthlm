import React, { type ReactNode } from 'react';

const URL_PATTERN = /https?:\/\/[^\s<>"']+/g;
const TRAILING_PUNCTUATION = /[.,!?;:)\]}]+$/;

export function EventDescriptionText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const matchedUrl = match[0];
    const url = matchedUrl.replace(TRAILING_PUNCTUATION, '');
    const index = match.index;

    if (!url) continue;

    parts.push(text.slice(cursor, index));
    parts.push(
      <a
        key={index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-[var(--primary)] underline underline-offset-2 hover:text-[var(--on-surface)]"
      >
        {url}
      </a>,
    );
    parts.push(matchedUrl.slice(url.length));
    cursor = index + matchedUrl.length;
  }

  parts.push(text.slice(cursor));
  return parts;
}