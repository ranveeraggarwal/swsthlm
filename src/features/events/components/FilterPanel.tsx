'use client';

// The collapsible search-and-filter panel. Presentational: it renders the current
// filter state and reports changes upward. What the filters *do* is
// `../model/sections.ts`; what the chips are called is `../model/labels.ts`.

import React from 'react';
import { Footprints, MapPin, Music, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import type { Style } from '@/lib/data/types';
import { styleFilterLabel } from '../model/labels';
import { venueFilterLabel, type EventFilters } from '../model/sections';
import { useLocale } from '@/components/providers/LocaleProvider';
import { ScrollFade } from '@/components/ui/ScrollFade';

interface FilterPanelProps {
  id: string;
  filters: EventFilters;
  onChange: (patch: Partial<EventFilters>) => void;
  styles: Style[];
  venues: string[];
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

// A horizontal scroller clips on both axes (CSS turns `overflow-y: visible`
// into `auto` once `overflow-x` scrolls), so the selected chip's lift and its
// focus ring need room inside the box: the padding is offset by an equal
// negative margin so the row still lines up with the labels. `overflow-y-hidden`
// stops the row from also scrolling vertically by a few pixels.
const SCROLLER =
  'flex overflow-x-auto overflow-y-hidden p-1.5 -m-1.5 pb-2 -mb-2 scroll-px-1.5 gap-2.5 snap-x md:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]';

const CHIP_BASE =
  'snap-start whitespace-nowrap px-4 py-2 rounded text-xs font-bold uppercase tracking-wider border-2 border-[var(--border-ink)] transition-all cursor-pointer';

const CHIP_IDLE =
  'bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface)] shadow-[0px_0px_0px_0px_var(--shadow-ink)]';

// The lifted "pressed" look, one variant per facet accent. Written out in full
// rather than interpolated: Tailwind only generates classes it can see as
// literal strings in the source.
const CHIP_SELECTED = {
  primary:
    'bg-[var(--primary)] text-[var(--on-primary)] font-bold shadow-[2px_2px_0px_0px_var(--shadow-ink)] -translate-y-0.5 -translate-x-0.5',
  secondary:
    'bg-[var(--secondary)] text-[var(--on-secondary)] font-bold shadow-[2px_2px_0px_0px_var(--shadow-ink)] -translate-y-0.5 -translate-x-0.5',
} as const;

const FACET_LABEL_BASE =
  'flex items-center gap-2 font-sans text-xs font-bold text-[var(--on-surface-variant)] uppercase mb-3';

const FACET_LABEL = `${FACET_LABEL_BASE} tracking-widest`;

// The switches' labels sit in half-width columns. Below `sm` the tracking
// tightens and the text truncates rather than wrapping: "Dansvänlighet" on a
// 320px phone otherwise pushes its own icon out of the column.
const SWITCH_LABEL = `${FACET_LABEL_BASE} tracking-wider sm:tracking-widest whitespace-nowrap [&>svg]:shrink-0`;

export function FilterPanel({
  id,
  filters,
  onChange,
  styles,
  venues,
  searchInputRef,
}: FilterPanelProps) {
  const { locale, bundle } = useLocale();
  const t = bundle.filters;
  return (
    <div
      id={id}
      className="border border-[var(--surface-container-highest)] bg-[var(--surface-container-low)] rounded-lg p-4 sm:p-6 mb-12 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-[var(--surface-container-highest)] pb-4 mb-2">
          <SlidersHorizontal aria-hidden="true" className="w-5 h-5 text-[var(--secondary)]" />
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--on-surface)]">
            {t.title.lead}
            <span className="italic">{t.title.em}</span>
          </h2>
        </div>

        {/* Search */}
        <div className="relative w-full bg-[var(--surface-container-lowest)] border-2 border-[var(--border-ink)] rounded shadow-[2px_2px_0px_var(--shadow-ink)] transition-all focus-within:shadow-[4px_4px_0px_var(--primary)] focus-within:-translate-x-0.5 focus-within:-translate-y-0.5">
          <Search
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--outline)]"
          />
          <input
            ref={searchInputRef}
            type="text"
            aria-label={t.searchLabel}
            placeholder={t.searchPlaceholder}
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && filters.search) {
                e.stopPropagation();
                onChange({ search: '' });
              }
            }}
            className="w-full pl-11 pr-10 py-3.5 bg-transparent border-0 text-[var(--on-surface)] placeholder-[var(--outline)] focus:outline-none focus:ring-0 font-sans font-body-md"
          />
          {filters.search ? (
            <button
              type="button"
              onClick={() => {
                onChange({ search: '' });
                setTimeout(() => searchInputRef.current?.focus(), 0);
              }}
              aria-label={t.clearSearch}
              title={`${t.clearSearch} (Esc)`}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--outline)] hover:text-[var(--on-surface)] transition-colors cursor-pointer"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
          ) : (
            // The "/" shortcut hint. Hidden on mobile, where there's no keyboard.
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center pointer-events-none">
              <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 font-sans text-xs font-bold text-[var(--on-surface-variant)] bg-[var(--surface-container)] border border-[var(--border-ink)] rounded shadow-[1px_1px_0px_0px_var(--shadow-ink)]">
                /
              </kbd>
            </div>
          )}
        </div>

        {/* Music + danceability: two quick either/or switches, side by side
            even on a phone, ahead of the long scrolling rows. */}
        <div className="grid grid-cols-2 gap-3 md:max-w-lg">
          <FacetSwitch
            id={`${id}-music`}
            label={t.music}
            icon={<Music aria-hidden="true" className="w-3.5 h-3.5 text-[var(--tertiary)]" />}
            offLabel={t.musicAll}
            onLabel={t.musicLive}
            on={filters.liveMusicOnly}
            onChange={(liveMusicOnly) => onChange({ liveMusicOnly })}
            tone="tertiary"
          />
          <FacetSwitch
            id={`${id}-floor`}
            label={bundle.danceability.heading}
            icon={
              <Footprints aria-hidden="true" className="w-3.5 h-3.5 text-[var(--on-success-container)]" />
            }
            offLabel={t.floorAll}
            onLabel={t.floorBest}
            on={filters.bestFloorOnly}
            onChange={(bestFloorOnly) => onChange({ bestFloorOnly })}
            tone="success"
          />
        </div>

        {/* Style */}
        <div>
          <span id={`${id}-style-label`} className={FACET_LABEL}>
            <Sparkles aria-hidden="true" className="w-3.5 h-3.5 text-[var(--primary)]" /> {t.byStyle}
          </span>
          <ScrollFade role="group" aria-labelledby={`${id}-style-label`} className={SCROLLER}>
            {styles.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => onChange({ style })}
                aria-pressed={filters.style === style}
                className={`${CHIP_BASE} ${filters.style === style ? CHIP_SELECTED.primary : CHIP_IDLE}`}
              >
                {styleFilterLabel(style, locale)}
              </button>
            ))}
          </ScrollFade>
        </div>

        {/* Venue */}
        <div>
          <span id={`${id}-venue-label`} className={FACET_LABEL}>
            <MapPin aria-hidden="true" className="w-3.5 h-3.5 text-[var(--secondary)]" /> {t.byVenue}
          </span>
          <ScrollFade role="group" aria-labelledby={`${id}-venue-label`} className={SCROLLER}>
            {venues.map((venue) => (
              <button
                key={venue}
                type="button"
                onClick={() => onChange({ venue })}
                aria-pressed={filters.venue === venue}
                className={`${CHIP_BASE} ${filters.venue === venue ? CHIP_SELECTED.secondary : CHIP_IDLE}`}
              >
                {venueFilterLabel(venue, locale)}
              </button>
            ))}
          </ScrollFade>
        </div>
      </div>
    </div>
  );
}

// The sliding block's colour, and the label text on it. The block is always in
// its facet's accent, on "All" too, the same way the chosen chip in each row is.
const SWITCH_TONE = {
  tertiary: { knob: 'bg-[var(--tertiary)]', text: 'text-[var(--on-tertiary)]' },
  // The inverted success pair, so "Best" reads in the same green as a 5/5
  // danceability meter on the cards (which fills in --on-success-container).
  success: { knob: 'bg-[var(--on-success-container)]', text: 'text-[var(--success-container)]' },
} as const;

interface FacetSwitchProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  offLabel: string;
  onLabel: string;
  on: boolean;
  onChange: (on: boolean) => void;
  tone: keyof typeof SWITCH_TONE;
}

/**
 * A two-option switch — "All | Live" — with a block that slides behind the
 * chosen word.
 *
 * Underneath it's a native radio pair, visually hidden, so the browser gives it
 * radio semantics, arrow-key movement and form behaviour for free. The two
 * labels fill the switch, so a tap anywhere on it lands on one: the other side
 * selects it, the chosen side flips it. The focus ring is drawn on whichever label holds the
 * focused input, since the input itself is invisible.
 */
function FacetSwitch({ id, label, icon, offLabel, onLabel, on, onChange, tone }: FacetSwitchProps) {
  const labelId = `${id}-label`;
  const options = [
    { value: false, text: offLabel },
    { value: true, text: onLabel },
  ];
  return (
    <div className="min-w-0">
      <span id={labelId} className={SWITCH_LABEL}>
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="relative grid grid-cols-2 h-11 p-[3px] rounded-md border-2 border-[var(--border-ink)] bg-[var(--surface-container)]"
      >
        <span
          aria-hidden="true"
          className={`absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%-3px)] rounded-sm border-2 border-[var(--border-ink)] shadow-[2px_2px_0px_0px_var(--shadow-ink)] transition-[translate,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
            on ? 'translate-x-full' : 'translate-x-0'
          } ${SWITCH_TONE[tone].knob}`}
        />
        {options.map(({ value, text }) => {
          const selected = on === value;
          return (
            <label
              key={String(value)}
              className={`relative z-10 flex items-center justify-center min-w-0 px-1 rounded-sm font-sans text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--primary)] ${
                selected
                  ? SWITCH_TONE[tone].text
                  : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
              }`}
            >
              <input
                type="radio"
                name={id}
                className="sr-only"
                checked={selected}
                onChange={() => onChange(value)}
                // The whole switch is one tap target: tapping the side that's
                // already chosen flips it too, the way a physical switch does.
                // A checked radio fires `click` but not `change`, hence here.
                onClick={() => {
                  if (selected) onChange(!value);
                }}
              />
              {text}
            </label>
          );
        })}
      </div>
    </div>
  );
}
