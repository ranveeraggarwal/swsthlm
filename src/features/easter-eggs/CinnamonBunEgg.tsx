'use client';

// Kanelbullens dag (4 October) easter egg: a cinnamon bun after the hero title,
// and every click drops another bun from the top of the screen to the bottom.
//
// It decides whether to show only after hydration, from the Stockholm clock.
// The page is static HTML built on some other day, so a server-side check would
// show the bun only if a deploy happened to land on the 4th, and rendering it
// into the initial markup would mismatch on hydration every other day. The
// clock is re-read every minute, so a tab left open across midnight follows
// the date like the event badges do.
//
// `?kanelbulle` in the URL forces it on, for previewing on any other day.

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '@/components/providers/LocaleProvider';
import { getStockholmCurrentDate } from '@/lib/date/clock';
import { isCinnamonBunDay } from './cinnamonBunDay';
import styles from './CinnamonBunEgg.module.css';

const CLOCK_TICK_MS = 60_000;
/** Enough for a satisfying pile-up; past this, clicks wait for buns to land. */
const MAX_FALLING = 40;

interface FallingBun {
  id: number;
  /** Horizontal start, as a percentage of the viewport width. */
  left: number;
  size: number;
  durationMs: number;
  /** Total rotation over the fall, in degrees. Negative spins anticlockwise. */
  spin: number;
}

function useIsCinnamonBunDay(): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).has('kanelbulle');
    const check = () => setActive(forced || isCinnamonBunDay(getStockholmCurrentDate()));
    check();
    const id = setInterval(check, CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  return active;
}

export function CinnamonBunEgg() {
  const active = useIsCinnamonBunDay();
  const { bundle } = useLocale();
  const [buns, setBuns] = useState<FallingBun[]>([]);
  const nextId = useRef(0);

  if (!active) return null;

  const dropBun = () => {
    const bun: FallingBun = {
      id: nextId.current++,
      left: Math.random() * 100,
      size: 32 + Math.random() * 32,
      durationMs: 2200 + Math.random() * 2000,
      spin: (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 540),
    };
    setBuns((current) => (current.length >= MAX_FALLING ? current : [...current, bun]));
  };

  const land = (id: number) => setBuns((current) => current.filter((b) => b.id !== id));

  return (
    <>
      <button
        type="button"
        onClick={dropBun}
        aria-label={bundle.home.cinnamonBun}
        title={bundle.home.cinnamonBun}
        className={`${styles.button} ml-2 inline-block align-middle rounded-full cursor-pointer`}
      >
        <CinnamonBunIcon className="w-[0.9em] h-[0.9em]" />
      </button>
      {createPortal(
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {buns.map((bun) => (
            <div
              key={bun.id}
              className={`${styles.fallingBun} absolute`}
              style={
                {
                  left: `${bun.left}%`,
                  width: bun.size,
                  height: bun.size,
                  marginLeft: -bun.size / 2,
                  '--bun-duration': `${bun.durationMs}ms`,
                  '--bun-spin': `${bun.spin}deg`,
                } as React.CSSProperties
              }
              onAnimationEnd={() => land(bun.id)}
            >
              <CinnamonBunIcon className="w-full h-full" />
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}

// A top-down kanelbulle: a golden-brown knot, a cinnamon spiral, pearl sugar.
// The fills are fixed rather than tokens on purpose — a bun is the same colour
// in dark mode, the same way the calendar providers' marks are (DESIGN.md).
const DOUGH = '#c98a45';
const CRUST = '#8a4f1d';
const CINNAMON = '#6b3510';
const PEARL_SUGAR = '#fffaf0';

function CinnamonBunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <circle cx="32" cy="33" r="27" fill={DOUGH} stroke={CRUST} strokeWidth="3" />
      <path
        d="M32 33 m0 -3 a3 3 0 1 1 -3 3 a7 7 0 0 1 7 -7 a10 10 0 0 1 10 10 a14 14 0 0 1 -14 14 a18 18 0 0 1 -18 -18 a20 20 0 0 1 20 -20"
        fill="none"
        stroke={CINNAMON}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {[
        [20, 18], [44, 20], [50, 34], [42, 48], [24, 50], [14, 36], [32, 24], [38, 40], [26, 38],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 1.5} y={y - 1.5} width="3" height="3" rx="0.8" fill={PEARL_SUGAR} />
      ))}
    </svg>
  );
}
