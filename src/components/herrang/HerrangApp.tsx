'use client';

// The client shell: owns the clock, the track selection, the ground
// (day/night), and which view is showing. The device clock picks the default
// view; the tabs always let the user override.

import { useEffect, useMemo, useState, useRef } from 'react';
import type { HerrangData } from '@/lib/herrang/types';
import {
  clockStateFor,
  isNightGround,
  type ClockState,
} from '@/lib/herrang/time';
import {
  selectedTrackIds,
  type TrackSelection,
} from '@/lib/herrang/schedule';
import { formatCompactWeekdayDate } from '@/lib/datetime';
import { TodayView } from './TodayView';
import { TonightView } from './TonightView';
import { WeekView } from './WeekView';
import { SettingsSheet, type ThemePref } from './SettingsSheet';

type View = 'today' | 'tonight' | 'week';

const TRACKS_KEY = 'herrang.tracks.v1';
const THEME_KEY = 'herrang.theme.v1';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode etc. — selection just won't persist */
  }
}

const EMPTY_SELECTION: TrackSelection = { levels: [], groups: {} };

export function HerrangApp({ data }: { data: HerrangData }) {
  // Everything time- and storage-dependent renders only after mount, so the
  // statically generated HTML never disagrees with the client.
  const [clock, setClock] = useState<ClockState | null>(null);
  const [selection, setSelection] = useState<TrackSelection>(EMPTY_SELECTION);
  const [themePref, setThemePref] = useState<ThemePref>('auto');
  const [manualView, setManualView] = useState<View | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tick = () => setClock(clockStateFor(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setSelection(readJson<TrackSelection>(TRACKS_KEY, EMPTY_SELECTION));
    setThemePref(readJson<ThemePref>(THEME_KEY, 'auto'));
    // First visit: nothing stored yet → offer the track picker (only once the
    // master schedule actually has tracks to pick).
    try {
      if (localStorage.getItem(TRACKS_KEY) === null && data.week.tracks.length > 0) {
        setSettingsOpen(true);
      }
    } catch {
      /* ignore */
    }
  }, [data.week.tracks.length]);

  // The ground follows the clock (night 20:00–08:00) unless overridden.
  useEffect(() => {
    if (!clock) return;
    const night =
      themePref === 'night' ||
      (themePref === 'auto' && isNightGround(clock.minutes));
    document.documentElement.setAttribute('data-hg', night ? 'night' : 'day');
  }, [clock, themePref]);

  // Offline after one load — camp Wi-Fi is a rumor.
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/herrang-sw.js', { scope: '/herrang' })
        .catch(() => {});
    }
  }, []);

  const trackIds = useMemo(
    () => selectedTrackIds(data.week, selection),
    [data.week, selection]
  );

  const autoView: View = clock?.mode === 'night' ? 'tonight' : 'today';
  const view = manualView ?? autoView;

  const saveSelection = (s: TrackSelection) => {
    setSelection(s);
    writeJson(TRACKS_KEY, s);
  };
  const saveTheme = (t: ThemePref) => {
    setThemePref(t);
    writeJson(THEME_KEY, t);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pb-8">
      <header className="flex items-start justify-between gap-3 pt-5 pb-4">
        <div>
          <h1 className="hg-display text-xl leading-none">A Day in Herräng</h1>
          <p
            className="hg-time mt-1 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--hg-soft)' }}
          >
            {clock ? formatCompactWeekdayDate(clock.posterDate) : ' '}
          </p>
        </div>
        <button
          ref={settingsTriggerRef}
          onClick={() => setSettingsOpen(true)}
          className="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide"
          style={{ border: '1px solid var(--hg-ink)' }}
        >
          Tracks&thinsp;·&thinsp;⚙
        </button>
      </header>

      <nav
        aria-label="View"
        className="mb-5 grid grid-cols-3 gap-2"
      >
        {(['today', 'tonight', 'week'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setManualView(v)}
            aria-current={view === v ? 'page' : undefined}
            className="hg-display rounded-full py-2 text-sm"
            style={
              view === v
                ? { background: 'var(--hg-ink)', color: 'var(--hg-ground)' }
                : { border: '1px solid var(--hg-line)', color: 'var(--hg-ink)' }
            }
          >
            {v}
          </button>
        ))}
      </nav>

      <main className="flex-grow">
        {clock === null ? null : view === 'today' ? (
          <TodayView
            data={data}
            clock={clock}
            trackIds={trackIds}
            onPickTracks={() => setSettingsOpen(true)}
            onGoTonight={() => setManualView('tonight')}
          />
        ) : view === 'tonight' ? (
          <TonightView data={data} clock={clock} />
        ) : (
          <WeekView
            data={data}
            trackIds={trackIds}
            onPickTracks={() => setSettingsOpen(true)}
          />
        )}
      </main>

      <footer
        className="mt-10 pt-4 text-center text-xs"
        style={{ color: 'var(--hg-soft)', borderTop: '1px solid var(--hg-line)' }}
      >
        By dancers, for dancers. Made for a village up north.
      </footer>

      <SettingsSheet
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          setTimeout(() => settingsTriggerRef.current?.focus(), 0);
        }}
        week={data.week}
        selection={selection}
        onSelection={saveSelection}
        themePref={themePref}
        onTheme={saveTheme}
        trackIds={trackIds}
      />
    </div>
  );
}
