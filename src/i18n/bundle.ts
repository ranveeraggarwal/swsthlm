// The contract: every string a human translates lives on this type, in
// exactly one place. `en.ts` and `sv.ts` each `satisfies LocaleBundle`, so a
// key that's missing or misspelled in either file is a compile error — the
// same enforcement `features/events/model/labels.ts` gets from
// `Record<Style, StylePresentation>`, no lint rule or script involved.
//
// S3 moved the domain vocabulary in: `styles`, `music`, `floors` and
// `temporal` below are keyed by the data contract's own unions
// (`lib/data/types.ts`), so a style or floor type added there is a compile
// error here until it has a word in both `en.ts` and `sv.ts`.

import type { FloorType, Music, Style } from '@/lib/data/types';
import type { Locale } from './locale';

/** Weekday names indexed by `Date.getUTCDay()`, so Sunday is 0. The tuple
 *  length is part of the contract — a locale file with six weekdays is a
 *  compile error, not an `undefined` in the middle of a date string. */
type Weekdays = readonly [string, string, string, string, string, string, string];

/** Month names indexed by `Date.getUTCMonth()`. Twelve, for the same reason. */
type Months = readonly [
  string, string, string, string, string, string,
  string, string, string, string, string, string,
];

/** The two forms every unit needs in English and Swedish alike. A locale
 *  with more plural categories is a change to this type, not to a component. */
interface PluralForms {
  one: string;
  other: string;
}

/**
 * A phrase where one part is set in italics — the hero, the section headings,
 * the filter panel's title.
 *
 * Split rather than marked up inside the string because the emphasis is
 * presentation: the component decides it renders as `<span className="italic">`,
 * and a translator only supplies words. `lead` is empty when the whole phrase
 * is emphasised ("Coming Up"). No locale so far needs text *after* the
 * emphasis; the day one does, this grows a `trail` rather than the components
 * growing a special case.
 */
interface EmphasisedText {
  lead: string;
  em: string;
}

export interface LocaleBundle {
  /** The header: the two primary links plus the mobile menu toggle's label
   *  (used as both `aria-label` and the hover `title`, per Header.tsx). */
  nav: {
    calendar: string;
    about: string;
    openMenu: string;
    closeMenu: string;
    themeLight: string;
    themeDark: string;
  };
  // The language toggle. `code` is this locale's own short form, so the
  // control reads "EN | SV" whichever language you're in — a Swede looking for
  // English shouldn't have to recognise the Swedish word for it. `names` is
  // every language *in this language*, for the accessible labels, which do
  // follow the current locale ("Switch to Swedish" / "Byt till engelska").
  language: {
    /** Names the group for screen readers. */
    label: string;
    /** This locale's short code, e.g. "EN". */
    code: string;
    names: Record<Locale, string>;
    /** Takes `{language}`. */
    switchTo: string;
    /** Announced politely when the language changes. Takes `{language}`. */
    changed: string;
  };
  // The one-time offer shown when the browser prefers a language we ship that
  // isn't the one on screen. Always read from the *offered* locale's bundle —
  // it's addressed to someone who reads that language, so asking in English
  // would defeat the point.
  languagePrompt: {
    /** e.g. "Vill du se sidan på svenska?" — already in this language, so no
     *  interpolation and no language name to decline. */
    question: string;
    accept: string;
    decline: string;
    /** The X. Means the same as `decline`; both are remembered. */
    dismiss: string;
  };
  /** The single-event page's own chrome. */
  permalink: {
    backToAll: string;
  };
  /** Strings for assistive tech that aren't part of the visible chrome above. */
  a11y: {
    skipToContent: string;
  };
  /** The footer's "when was this last updated" line. */
  freshness: {
    /** `{time}` is filled from `relativeTime` below. */
    updated: string;
  };
  // Date formatting is templates plus word lists, never `Intl`. Two bugs have
  // shipped from trusting `toLocaleDateString`: #160 (a date-only string is
  // UTC midnight, so formatting without `timeZone: 'UTC'` rolls the day back
  // west of Greenwich) and #200 (Node's ICU and Chromium's ICU disagreed on
  // punctuation for the identical call, hydration error #418 on every load).
  // A third pair was found writing this block — see `eventDateShort` and
  // `rangeDay`.
  //
  // Templates take `{weekdayShort} {weekdayLong} {day} {monthShort}
  // {monthLong} {year}`. They exist because word order is not a translation:
  // English says "Wednesday, Jun 3", Swedish says "onsdag 3 juni".
  dates: {
    weekdaysShort: Weekdays;
    weekdaysLong: Weekdays;
    monthsShort: Months;
    monthsLong: Months;
    /** The dense row list's date column: "Wed 26 Aug" / "ons 26 aug". */
    compactWeekdayDate: string;
    /** Date-section headings and the permalink: "Wednesday, Jun 3" / "onsdag 3 juni". */
    eventDate: string;
    /** A card's date line: "Wed 24 Jun" / "ons 24 jun". */
    eventDateShort: string;
    /** Month headings: "August 2026" / "augusti 2026". */
    monthHeading: string;
    /** One end of a multi-night run: "Fri 28" / "fre 28". */
    rangeDay: string;
    /** Joins the two ends of a run. */
    rangeSeparator: string;
  };
  /** "Schedule updated 3 minutes ago" / "Schemat uppdaterat för 3 minuter sedan".
   *  `pattern` wraps the count and unit, which is why Swedish's circumfixed
   *  "för … sedan" needs no special case. */
  relativeTime: {
    justNow: string;
    /** Takes `{count}` and `{unit}`. */
    pattern: string;
    units: {
      minute: PluralForms;
      hour: PluralForms;
      day: PluralForms;
      week: PluralForms;
    };
  };
  // Domain vocabulary — S3. Dance style *names* ('Lindy Hop', 'Balboa', 'Shag',
  // 'Blues') are deliberately not here: they're what Swedish dancers call them
  // too, so the union's own keys already double as their Swedish label. Only
  // the sentences built around a style go through this table.
  /** `compact` is the dense row list's shorter form (falls back to `label`);
   *  `filter` is the filter panel's word (falls back to `label`). For 'all'
   *  these read differently on purpose: `label` is "a social that welcomes
   *  every style", `filter` is "don't filter" — see `labels.ts`. */
  styles: Record<Style, { label: string; compact?: string; filter?: string }>;
  /** The `music` column, spelled out. `mixed` never displays on its own —
   *  `musicLines` in `labels.ts` splits it into a live line and a DJ line —
   *  but the table stays `Record<Music, …>` so it can't drift from the data
   *  contract if a third music value is ever added. */
  music: Record<Music, string>;
  /** The venue's floor type badge. */
  floors: Record<FloorType, string>;
  /** The event-card badge's word. Colour, priority and layout stay in
   *  `features/events/model/temporal.ts` / `TemporalBadgeDisplay.tsx`; only
   *  the text moves here. Keys are `TemporalBadge` minus `null` (no badge
   *  needs no word) — duplicated as a literal union rather than imported,
   *  since importing a feature type into the locale contract would run the
   *  `app → features → … → lib` dependency arrow backwards. `temporal.ts`
   *  indexes this record with an actual `TemporalBadge` value, so the two
   *  fail to compile together the moment they drift apart. */
  temporal: Record<'happening-now' | 'ended' | 'tonight' | 'tomorrow' | 'this-week', string>;
  /** "Beginner friendly" for a plain yes; the class start time otherwise. */
  beginnerClass: {
    friendly: string;
    /** Takes `{time}`. */
    atTime: string;
  };
  /** The homepage hero. */
  home: {
    title: EmphasisedText;
    subtitle: string;
  };
  /** The listing's summary bar, its controls, and the section headings. */
  listing: {
    /** Takes `{count}` (rendered bold) and `{noun}` — see `filters.eventNoun`. */
    showingAll: string;
    /** Takes `{description}` (rendered bold) from `summariseFilters`. */
    showingFiltered: string;
    hideFilters: string;
    showFilters: string;
    reset: string;
    sections: {
      comingUp: EmphasisedText;
      thisWeek: EmphasisedText;
      later: EmphasisedText;
      upcoming: EmphasisedText;
    };
  };
  // The words `features/events/model/sections.ts` builds its filter prose
  // from, plus the panel's own controls.
  filters: {
    /** The panel heading. */
    title: EmphasisedText;
    searchLabel: string;
    searchPlaceholder: string;
    clearSearch: string;
    byStyle: string;
    music: string;
    liveMusicOnly: string;
    byVenue: string;
    /** "All Venues" — the venue chip's "don't filter" sentinel, same idea as
     *  the style table's `filter` word. */
    allVenues: string;
    /** The noun in "`{count}` `{noun}`" above the grid. */
    eventNoun: PluralForms;
    /** Appended to the summary when "Live Music Only" is on. */
    liveMusicQualifier: string;
    /** Takes `{description}` and `{venue}`. */
    atVenue: string;
    /** Takes `{description}` and `{search}`. */
    matchingSearch: string;
    /** The empty-state heading, one template per combination of active
     *  filters — see `emptyStateHeading`. */
    emptyState: {
      /** Takes `{style}` and `{venue}`. */
      styleAndVenue: string;
      /** Takes `{style}`. */
      style: string;
      /** Takes `{venue}`. */
      venue: string;
      none: string;
    };
  };
  /** The card and row: the description toggle, the status badge, the outbound
   *  link, and the screen-reader-only text that goes with them. */
  card: {
    readMore: string;
    showLess: string;
    cancelled: string;
    /** "3 nights" — only ever rendered for a merged multi-night run, so `one`
     *  is unreachable today. It's here anyway: the guard lives in a component
     *  and the bundle shouldn't depend on it staying there. */
    nights: PluralForms;
    source: string;
    /** Appended `sr-only` after "Source". */
    sourceHint: string;
    /** Appended `sr-only` to every link that opens a new tab. */
    opensInNewTab: string;
    /** Prefixes a performer line for screen readers. */
    livePrefix: string;
    djPrefix: string;
  };
  /** The three action buttons on a card, and the calendar sheets they open. */
  actions: {
    addToCalendar: string;
    addToCalendarTitle: string;
    /** Takes `{title}` (rendered bold) and `{date}`. */
    addIntro: string;
    downloadIcs: string;
    share: string;
    linkCopied: string;
    subscribe: string;
    subscribeTitle: string;
    subscribeBlurb: string;
    feedUrlLabel: string;
    copy: string;
    copied: string;
    copyFeedLink: string;
  };
  /** The designed empty state — it names what emptied the page (see
   *  `filters.emptyState`) and then offers the two ways to help. */
  empty: {
    body: string;
    clearAll: string;
    subscribeCta: string;
    organizersCta: string;
  };
  footer: {
    tagline: string;
    github: string;
  };
  /** The PWA install prompt. */
  install: {
    title: string;
    body: string;
    action: string;
    dismiss: string;
  };
  /** Shared dialog chrome — one string, used by all three modals. */
  modal: {
    close: string;
  };
  // The "Wrong info?" dialog. The *email* this builds is deliberately not
  // translated: it goes to a maintainer who reads English, and its field
  // labels are what make a report skimmable. Only what the reporter sees
  // while filling the form is localized — see `report.ts`.
  corrections: {
    trigger: string;
    /** Takes `{title}` — the icon button's accessible name. */
    triggerFor: string;
    title: string;
    /** Takes `{title}`, which renders bold. */
    intro: string;
    /** The three field labels. `CORRECTION_PROMPTS` in `report.ts` holds the
     *  English wording the *email* uses; these are what the reporter reads.
     *  Same three, same order — change one and change the other. */
    prompts: {
      whatsWrong: string;
      shouldSay: string;
      howYouKnow: string;
    };
    placeholders: {
      whatsWrong: string;
      shouldSay: string;
      howYouKnow: string;
    };
    currentlySays: string;
    /** Precedes the contact address, for someone with no mail client. */
    noMailApp: string;
    currentlySaysHint: string;
    openEmail: string;
  };
  // The About page. Its sentences carry links and bold runs inside them, so
  // several are templates rendered through `<Interpolate>` — the sentence
  // stays whole here, and the component supplies the nodes. The link *text*
  // is a separate key so it translates too.
  about: {
    title: EmphasisedText;
    subtitle: string;
    organizers: {
      heading: string;
      /** Takes `{form}` and `{email}`. */
      intro: string;
      formLink: string;
      emailLink: string;
      /** Takes `{contact}`. */
      series: string;
      contactLink: string;
    };
    corrections: {
      heading: string;
      /** Takes `{flagButton}`, which renders bold. */
      intro: string;
      flagButton: string;
      /** Takes `{email}`. */
      writeDirectly: string;
    };
    mission: { heading: string; body: string };
    community: { heading: string; body: string; githubLink: string };
    openSource: { heading: string; body: string; githubLink: string };
  };
  changelog: {
    heading: string;
    subheading: string;
    /** A note that the entries below are written in English, shown only where
     *  that isn't already obvious. `null` for English itself — the entries are
     *  hand-written per release and deliberately not translated (#264), so a
     *  Swedish reader gets told rather than left wondering. */
    entriesInEnglish: string | null;
  };
  contributors: {
    heading: string;
    subheading: string;
    /** Takes `{name}`. */
    onGitHub: string;
  };
}
