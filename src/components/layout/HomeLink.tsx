'use client';

// The header's home link: the orange ♪ tile and the wordmark. Clicking it makes
// the tile dance — it presses into its shadow and rocks on a swing count (two
// slow, three quick: a rock step and a triple step) while two notes float out
// of it (#466). The header lives in the root layout, so the dance keeps playing
// across the navigation it triggers.
//
// Kept cheap on purpose. It's CSS keyframes on `transform` and `opacity` only,
// so it runs on the compositor with no per-frame JavaScript and no layout or
// paint. The shadow is its own element that never moves — the tile "presses" by
// sliding onto it — because animating `box-shadow` would repaint every frame.
// The notes exist only while the dance plays; React touches the DOM once to
// start it and once to end it. A click mid-dance bumps the key, which remounts
// the moving pieces and restarts their keyframes without forcing a reflow.

import { useState } from 'react';
import Link from 'next/link';
import { Music, Music2 } from 'lucide-react';
import styles from './HomeLink.module.css';

export function HomeLink() {
  const [beat, setBeat] = useState(0);
  const [playing, setPlaying] = useState(false);

  const dance = () => {
    setBeat((b) => b + 1);
    setPlaying(true);
  };

  return (
    <Link href="/" onClick={dance} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
      <span className="relative block w-10 h-10 shrink-0" aria-hidden="true">
        <span className="absolute inset-0 translate-x-[2px] translate-y-[2px] rounded bg-[var(--shadow-ink)]" />
        <span
          key={`tile-${beat}`}
          className={`absolute inset-0 rounded border border-[var(--border-ink)] bg-[var(--primary)] flex items-center justify-center ${
            playing ? styles.rock : ''
          }`}
        >
          <Music className="w-5 h-5 text-[var(--on-primary)]" />
        </span>
        {playing && (
          <span key={`notes-${beat}`}>
            <Music className={`${styles.note} ${styles.first} text-[var(--primary)]`} />
            {/* The later note finishes last, so its end is the dance's end. */}
            <Music2
              className={`${styles.note} ${styles.second} text-[var(--primary)]`}
              onAnimationEnd={() => setPlaying(false)}
            />
          </span>
        )}
      </span>
      <span>
        <span className="font-serif text-xl font-bold tracking-tight text-[var(--on-surface)] flex items-center gap-1.5">
          Stockholm <span className="text-[var(--primary)]">Swing</span>
        </span>
        <span className="block font-sans text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest font-extrabold mt-0.5">
          Dance Calendar
        </span>
      </span>
    </Link>
  );
}
