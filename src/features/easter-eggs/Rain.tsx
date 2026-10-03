'use client';

// The homepage's rain easter egg (see `./rains.ts` for which ones exist): on a
// rain's day, its icon appears after the hero title, and every click drops
// another one from the top of the screen to the bottom.
//
// Which rain, if any, is decided only after hydration, from the Stockholm
// clock. The page is static HTML built on some other day, so a server-side
// check would only fire if a deploy happened to land on the day, and rendering
// it into the initial markup would mismatch on hydration every other day. The
// clock is re-read every minute, so a tab left open across midnight follows
// the date like the event badges do.

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useLocale } from '@/components/providers/LocaleProvider';
import { getStockholmCurrentDate } from '@/lib/date/clock';
import { type Rain as RainConfig, rainFor } from './rains';
import styles from './Rain.module.css';

const CLOCK_TICK_MS = 60_000;
/** Enough for a satisfying pile-up; past this, clicks wait for drops to land. */
const MAX_FALLING = 40;

interface Drop {
  id: number;
  /** Horizontal start, as a percentage of the viewport width. */
  left: number;
  size: number;
  durationMs: number;
  /** Total rotation over the fall, in degrees. Negative spins anticlockwise. */
  spin: number;
}

function useTodaysRain(): RainConfig | null {
  const [rain, setRain] = useState<RainConfig | null>(null);

  useEffect(() => {
    const forcedId = new URLSearchParams(window.location.search).get('rain');
    const check = () => setRain(rainFor(getStockholmCurrentDate(), forcedId));
    check();
    const id = setInterval(check, CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  return rain;
}

export function Rain() {
  const rain = useTodaysRain();
  const { bundle } = useLocale();
  const [drops, setDrops] = useState<Drop[]>([]);
  const nextId = useRef(0);

  if (!rain) return null;

  const label = bundle.rains[rain.id];

  const drop = () => {
    const next: Drop = {
      id: nextId.current++,
      left: Math.random() * 100,
      size: 32 + Math.random() * 32,
      durationMs: 2200 + Math.random() * 2000,
      spin: (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 540),
    };
    setDrops((current) => (current.length >= MAX_FALLING ? current : [...current, next]));
  };

  const land = (id: number) => setDrops((current) => current.filter((d) => d.id !== id));

  return (
    <>
      <button
        type="button"
        onClick={drop}
        aria-label={label}
        title={label}
        className={`${styles.button} ml-2 inline-block align-middle rounded-full cursor-pointer`}
      >
        <Image src={rain.icon} alt="" unoptimized className="w-[0.9em] h-[0.9em]" />
      </button>
      {createPortal(
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {drops.map((d) => (
            <Image
              key={d.id}
              src={rain.icon}
              alt=""
              unoptimized
              className={`${styles.drop} absolute`}
              style={
                {
                  left: `${d.left}%`,
                  width: d.size,
                  height: d.size,
                  marginLeft: -d.size / 2,
                  '--drop-duration': `${d.durationMs}ms`,
                  '--drop-spin': `${d.spin}deg`,
                } as React.CSSProperties
              }
              onAnimationEnd={() => land(d.id)}
            />
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}
