'use client';

// Renders a sentence from the locale bundle with React nodes — links, bold
// runs — substituted into its named holes.
//
// The point is that the sentence stays whole in `en.ts` / `sv.ts`. The
// alternative, cutting prose into one string per fragment, produces strings
// like "or" and " and we'll get it set up." that mean nothing on their own,
// and it fixes the word order in English: a translator can't move a link to
// where their language wants it if the sentence was already chopped up around
// where English put it.

import React from 'react';
import { tokenize } from '@/i18n/template';

interface InterpolateProps {
  /** A template containing `{name}` placeholders. */
  template: string;
  /** One node per placeholder, keyed by name. */
  values: Record<string, React.ReactNode>;
}

export function Interpolate({ template, values }: InterpolateProps) {
  return (
    <>
      {tokenize(template).map((part, i) =>
        part.kind === 'text' ? (
          <React.Fragment key={i}>{part.value}</React.Fragment>
        ) : (
          // An unknown placeholder renders as written — `{typo}` on the page is
          // a visible bug report, where dropping it silently would leave a
          // sentence that reads fine and says the wrong thing.
          <React.Fragment key={i}>{values[part.name] ?? `{${part.name}}`}</React.Fragment>
        ),
      )}
    </>
  );
}
