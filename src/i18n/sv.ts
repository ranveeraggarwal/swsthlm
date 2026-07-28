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
  language: {
    label: 'Språk',
    code: 'SV',
    // Language names are lowercase in Swedish — "svenska", never "Svenska".
    names: { en: 'engelska', sv: 'svenska' },
    switchTo: 'Byt till {language}',
    changed: 'Språk: {language}',
  },
  permalink: {
    backToAll: 'Alla evenemang',
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
  home: {
    // "i full swing" is the same idiom in Swedish, which is lucky — the hero
    // keeps its pun without needing a different joke.
    title: { lead: 'Stockholm i ', em: 'full swing' },
    subtitle: 'Din guide till socialdans i Lindy Hop, Balboa, Shag och Blues i Stockholm.',
  },
  listing: {
    showingAll: 'Visar alla {count} {noun}',
    showingFiltered: 'Visar {description}',
    hideFilters: 'Dölj filter',
    showFilters: 'Filtrera & sök',
    reset: 'Återställ',
    sections: {
      comingUp: { lead: '', em: 'På gång' },
      thisWeek: { lead: 'Händer ', em: 'denna vecka' },
      later: { lead: '', em: 'Senare' },
      upcoming: { lead: 'Kommande ', em: 'evenemang' },
    },
  },
  filters: {
    title: { lead: 'Filter ', em: '& sök' },
    searchLabel: 'Sök evenemang',
    searchPlaceholder: 'Sök på band, DJ, lokal, titel...',
    clearSearch: 'Rensa sökningen',
    byStyle: 'Filtrera på stil',
    music: 'Musik',
    liveMusicOnly: 'Endast livemusik',
    byVenue: 'Filtrera på lokal',
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
  card: {
    readMore: 'Läs mer',
    showLess: 'Visa mindre',
    cancelled: 'Inställt',
    nights: { one: 'kväll', other: 'kvällar' },
    // "Källa" would be literal; the link goes to the organizer's own page, so
    // "Arrangörens sida" says what the reader actually gets.
    source: 'Arrangörens sida',
    sourceHint: ' — biljetter och information (öppnas i en ny flik)',
    opensInNewTab: ' (öppnas i en ny flik)',
    livePrefix: 'Live: ',
    djPrefix: 'DJ: ',
  },
  actions: {
    addToCalendar: 'Lägg till i kalendern',
    addToCalendarTitle: 'Lägg till i kalendern',
    addIntro: 'Lägg till {title} den {date} i din kalender.',
    downloadIcs: 'Ladda ner .ics-fil',
    share: 'Dela evenemang',
    linkCopied: 'Länken är kopierad!',
    subscribe: 'Prenumerera',
    subscribeTitle: 'Prenumerera på kalendern',
    subscribeBlurb:
      'Lägg till evenemangsflödet i din kalenderapp — det hålls uppdaterat automatiskt.',
    feedUrlLabel: 'Adress till kalenderflödet',
    copy: 'Kopiera',
    copied: 'Kopierad',
    copyFeedLink: 'Kopiera länken till flödet',
  },
  empty: {
    body: 'Justera sökorden eller filtren för att hitta dansevenemang.',
    clearAll: 'Rensa alla filter',
    subscribeCta: 'Prenumerera för att få veta',
    organizersCta: 'Arrangörer: lägg till ert evenemang',
  },
  footer: {
    tagline: 'Av dansare, för dansare. Gjord i Stockholm 🇸🇪 med ❤️.',
    github: 'GitHub-community (öppnas i en ny flik)',
  },
  install: {
    title: 'Lägg till på hemskärmen',
    body: 'Snabb åtkomst till Stockholms swingevenemang',
    action: 'Installera',
    dismiss: 'Stäng',
  },
  modal: {
    close: 'Stäng',
  },
  corrections: {
    trigger: 'Rapportera fel',
    triggerFor: 'Rapportera fel om {title}',
    title: 'Skicka en rättelse',
    intro:
      'Berätta vad som är fel med {title}, så rättar vi uppgifterna. Det här öppnar ett mejl — ingenting skickas förrän du skickar det.',
    prompts: {
      whatsWrong: 'Vad är fel',
      shouldSay: 'Vad det borde stå i stället',
      howYouKnow: 'Hur jag vet',
    },
    placeholders: {
      whatsWrong: 'Lokalen var stängd, DJ:n har bytts…',
      shouldSay: 'Insläpp 19:30, 120 kr…',
      howYouKnow: 'Jag var där ikväll / jag arrangerar det',
    },
    currentlySays: 'Vad sajten säger just nu',
    noMailApp: 'Ingen mejlapp? Skriv till',
    currentlySaysHint: 'Följer med i mejlet så att vi hittar rätt evenemang.',
    openEmail: 'Öppna mejlet',
  },
  about: {
    title: { lead: 'Om ', em: 'Stockholm Swing' },
    subtitle: 'En plats för alla socialdanser, workshops och jam i Stockholm.',
    organizers: {
      heading: 'Är du arrangör?',
      intro:
        'Arrangerar du ett enstaka eller återkommande evenemang i Lindy Hop, Balboa, Blues eller Shag i Stockholm? Fyll i vårt {form} eller {email}. En bot gör formulärsvaren till pull requests som en underhållare granskar och slår ihop. Du behöver inget GitHub-konto.',
      formLink: 'formulär för evenemang',
      emailLink: 'skicka ett mejl till oss',
      series: 'Driver du en återkommande veckoserie? {contact} så lägger vi upp den.',
      contactLink: 'Hör av dig direkt',
    },
    corrections: {
      heading: 'Har du hittat något fel?',
      intro:
        'Priser ändras, DJ:s byts ut och ibland ställs en vanlig serie in. Varje evenemang har en {flagButton} som öppnar ett kort rättelseformulär — vad som är fel, vad det borde stå och hur du vet. När du skickar det får vi ett mejl med evenemangets nuvarande uppgifter bifogade, så att vi hittar raden och rättar den.',
      flagButton: 'flaggknapp',
      writeDirectly: 'Du kan också skriva direkt till oss på {email}.',
    },
    mission: {
      heading: 'Vårt uppdrag',
      body: 'Stockholm Swing kom till för att samla den lokala swingdansscenen på ett enda tydligt, lättviktigt och lättanvänt ställe. I stället för att leta igenom spridda flöden i sociala medier, olika studiosidor och nyhetsbrev samlar vi allt i ett gemensamt schema.',
    },
    community: {
      heading: 'Gemenskapen först',
      body: 'Sajten byggs och underhålls av dansare i gemenskapen, för gemenskapen. Vi är inte knutna till någon enskild dansstudio eller förening, vilket betyder att vi visar evenemang, socialdanser, tedanser och workshops från alla arrangörer i Stockholm på lika villkor.',
      githubLink: 'GitHub-community',
    },
    openSource: {
      heading: 'Byggd i öppenhet',
      body: 'Hela sajten, dess data och verktygen som underhåller den ligger i ett publikt GitHub-repo. Vill du rätta en uppgift, bygga en funktion eller bara se hur det fungerar så finns koden där. Bidrag är välkomna.',
      githubLink: 'Visa på GitHub',
    },
  },
  changelog: {
    heading: 'Nyheter',
    subheading: 'Större uppdateringar av sajten, månad för månad',
    // The entries themselves stay English by decision (#264) — they're written
    // per release and a bilingual obligation on every future PR isn't worth it.
    // Saying so is better than letting a Swedish reader wonder why this one
    // section didn't translate.
    entriesInEnglish: 'Posterna nedan är skrivna på engelska.',
  },
  contributors: {
    heading: 'Bidragsgivare',
    subheading: 'Personerna som har byggt och underhållit sajten',
    onGitHub: '{name} på GitHub',
  },
} satisfies LocaleBundle;
