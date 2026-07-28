// English chrome copy. `satisfies LocaleBundle` rather than `: LocaleBundle`
// so the exported value keeps its literal (not widened) type, while the
// compiler still checks every key against the contract.

import type { LocaleBundle } from './bundle';

export const en = {
  nav: {
    calendar: 'Calendar',
    about: 'About',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
  a11y: {
    skipToContent: 'Skip to content',
  },
  freshness: {
    updated: 'Schedule updated {time}',
  },
  dates: {
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekdaysLong: [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ],
    monthsShort: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ],
    monthsLong: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    compactWeekdayDate: '{weekdayShort} {day} {monthShort}',
    eventDate: '{weekdayLong}, {monthShort} {day}',
    eventDateShort: '{weekdayShort} {day} {monthShort}',
    monthHeading: '{monthLong} {year}',
    rangeDay: '{weekdayShort} {day}',
    rangeSeparator: '&',
  },
  relativeTime: {
    justNow: 'just now',
    pattern: '{count} {unit} ago',
    units: {
      minute: { one: 'minute', other: 'minutes' },
      hour: { one: 'hour', other: 'hours' },
      day: { one: 'day', other: 'days' },
      week: { one: 'week', other: 'weeks' },
    },
  },
  styles: {
    'lindy-hop': { label: 'Lindy Hop' },
    balboa: { label: 'Balboa' },
    blues: { label: 'Blues' },
    shag: { label: 'Shag' },
    all: { label: 'Social – all styles', compact: 'All styles', filter: 'All Styles' },
  },
  music: {
    live: 'Live music',
    dj: 'DJ set',
    mixed: 'Live music & DJ set',
  },
  floors: {
    studio: 'Dance studio',
    hall: 'Dance hall',
    bar: 'Bar / restaurant',
    outdoor: 'Outdoor',
  },
  temporal: {
    'happening-now': 'Happening Now',
    ended: 'Ended',
    tonight: 'Tonight',
    tomorrow: 'Tomorrow',
    'this-week': 'This Week',
  },
  beginnerClass: {
    friendly: 'Beginner friendly',
    atTime: 'Beginner class {time}',
  },
  filters: {
    allVenues: 'All Venues',
    eventNoun: { one: 'event', other: 'events' },
    liveMusicQualifier: 'Live Music',
    atVenue: '{description} at {venue}',
    matchingSearch: '{description} matching "{search}"',
    emptyState: {
      styleAndVenue: 'No {style} events at {venue} right now',
      style: 'No {style} events right now',
      venue: 'No events at {venue} right now',
      none: 'No events match your filters',
    },
  },
} satisfies LocaleBundle;
