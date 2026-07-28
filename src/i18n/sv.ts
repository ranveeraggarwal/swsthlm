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
} satisfies LocaleBundle;
