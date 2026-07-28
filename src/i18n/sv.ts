// Swedish chrome copy. Real translations, not English placeholders — a
// mistranslated label is a bug report; an English label under a Swedish
// heading is a bug nobody can find by reading the site.

import type { LocaleBundle } from './bundle';

export const sv = {
  nav: {
    calendar: 'Kalender',
    about: 'Om',
    openMenu: 'Öppna menyn',
    closeMenu: 'Stäng menyn',
  },
  a11y: {
    skipToContent: 'Hoppa till innehållet',
  },
  freshness: {
    updated: 'Schemat uppdaterat {time}',
  },
  // Swedish weekday and month names are lowercase — "onsdag", "juni", never
  // "Onsdag". The templates also differ from English in more than word
  // choice: "onsdag 3 juni" has no comma and puts the day before the month.
  dates: {
    weekdaysShort: ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör'],
    weekdaysLong: [
      'söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag',
    ],
    monthsShort: [
      'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
      'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
    ],
    monthsLong: [
      'januari', 'februari', 'mars', 'april', 'maj', 'juni',
      'juli', 'augusti', 'september', 'oktober', 'november', 'december',
    ],
    compactWeekdayDate: '{weekdayShort} {day} {monthShort}',
    eventDate: '{weekdayLong} {day} {monthLong}',
    eventDateShort: '{weekdayShort} {day} {monthShort}',
    monthHeading: '{monthLong} {year}',
    rangeDay: '{weekdayShort} {day}',
    // Kept as "&" rather than "och": it sits in the card's date line and the
    // row list's fixed-width column, where a three-letter word costs space
    // that a symbol reads just as clearly in.
    rangeSeparator: '&',
  },
  relativeTime: {
    // Swedish circumfixes it — "för 3 minuter sedan" — which is why the
    // count and unit go through a pattern instead of being concatenated.
    justNow: 'nyss',
    pattern: 'för {count} {unit} sedan',
    units: {
      minute: { one: 'minut', other: 'minuter' },
      hour: { one: 'timme', other: 'timmar' },
      day: { one: 'dag', other: 'dagar' },
      week: { one: 'vecka', other: 'veckor' },
    },
  },
  // Dance style names stay in English — "Lindy Hop", "Balboa", "Shag",
  // "Blues" are what Swedish dancers say, not translations waiting to happen.
  styles: {
    'lindy-hop': { label: 'Lindy Hop' },
    balboa: { label: 'Balboa' },
    blues: { label: 'Blues' },
    shag: { label: 'Shag' },
    // The event data already calls a style-agnostic social "socialdans" — see
    // e.g. data/oneoffs.csv — so the label matches rather than inventing a
    // second word for the same thing.
    all: { label: 'Socialdans – alla stilar', compact: 'Alla stilar', filter: 'Alla stilar' },
  },
  music: {
    live: 'Livemusik',
    dj: 'DJ-set',
    mixed: 'Livemusik & DJ-set',
  },
  floors: {
    studio: 'Dansstudio',
    hall: 'Danssal',
    bar: 'Bar/restaurang',
    outdoor: 'Utomhus',
  },
  temporal: {
    'happening-now': 'Pågår nu',
    ended: 'Avslutad',
    tonight: 'Ikväll',
    tomorrow: 'Imorgon',
    'this-week': 'Denna vecka',
  },
  beginnerClass: {
    friendly: 'Nybörjarvänlig',
    atTime: 'Nybörjarkurs {time}',
  },
  filters: {
    allVenues: 'Alla lokaler',
    // "Evenemang" doesn't inflect for number, so both plural forms are the
    // same word — the interface still asks for both, for the locales where
    // they'd differ.
    eventNoun: { one: 'evenemang', other: 'evenemang' },
    liveMusicQualifier: 'Livemusik',
    atVenue: '{description} på {venue}',
    matchingSearch: '{description} som matchar "{search}"',
    emptyState: {
      styleAndVenue: 'Inga {style}-evenemang på {venue} just nu',
      style: 'Inga {style}-evenemang just nu',
      venue: 'Inga evenemang på {venue} just nu',
      none: 'Inga evenemang matchar dina filter',
    },
  },
} satisfies LocaleBundle;
