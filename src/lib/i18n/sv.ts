// Swedish chrome copy. `satisfies Dictionary` means a key missing here (or
// misspelled, or wrongly nested) fails `tsc` — deleting a key to test this is
// part of #260's acceptance criteria.
//
// S1 (#260) mirrored the English values verbatim so `/sv` could prerender and
// round-trip before a single Swedish word shipped. S5 (#264) replaces the
// About-page surfaces with real translations; `meta.home` is still English and
// belongs to #262.
//
// Register: informal, second person, dancer to dancer — the same voice as the
// English copy, not a literal calque of it. Where a sentence doesn't survive
// the crossing it has been rewritten rather than transliterated (#264 says so
// explicitly). Dance vocabulary follows what Stockholm dancers actually say:
// *socialdans*, *tedans*, *danskola*, *event*.
//
// The leading and trailing spaces in the link fragments are load-bearing — see
// `en.ts`'s header for why they live in the string and not in the JSX.
import type { Dictionary } from './en';

export const sv = {
  meta: {
    home: {
      title: 'Stockholm Swing Dance Calendar | Lindy Hop, Balboa & Blues Events',
      description:
        'The complete guide to swing dancing in Stockholm. Find upcoming Lindy Hop, Balboa, Shag, and Blues socials, live music, and workshops across the city.',
    },
    about: {
      title: 'Om oss | Stockholm Swing',
      description:
        'Ett ställe för alla socialdanser, workshops och jams i Stockholm — Lindy Hop, Balboa, Blues och Shag.',
    },
  },

  common: {
    opensInNewTab: '(öppnas i en ny flik)',
  },

  about: {
    titleLead: 'Om ',
    tagline: 'Ett ställe för alla socialdanser, workshops och jams i Stockholm.',

    organizer: {
      heading: 'Är du arrangör?',
      introLead:
        'Anordnar du ett enstaka Lindy Hop-, Balboa-, Blues- eller Shag-event i Stockholm, eller något som händer då och då? Fyll i vårt ',
      formLink: 'eventformulär',
      introMid: ' eller ',
      emailLink: 'mejla oss',
      introTail:
        '. En bot gör om formulärsvaren till pull requests, som någon av oss granskar och lägger in. Du behöver inget GitHub-konto.',
      seriesLead: 'Har du något som återkommer varje vecka? ',
      seriesLink: 'Hör av dig direkt',
      seriesTail: ', så lägger vi in det.',
    },

    corrections: {
      heading: 'Har något blivit fel?',
      bodyLead:
        'Priser ändras, DJ:ar byts ut och ibland blir en återkommande kväll helt enkelt inte av. Varje event har en ',
      flagButton: 'flaggknapp',
      bodyTail:
        ' som öppnar ett kort rättelseformulär: vad som är fel, vad det ska stå och hur du vet. När du skickar det får vi ett mejl med eventets nuvarande uppgifter bifogade, så att vi hittar raden och rättar den.',
      emailLead: 'Du kan också mejla oss direkt på ',
      emailTail: '.',
    },

    mission: {
      heading: 'Vårt uppdrag',
      body: 'Stockholm Swing kom till för att samla stadens swingdansscen på ett enda ställe — tydligt, snabbt och lätt att använda. I stället för att leta igenom spridda flöden i sociala medier, olika danskolors sidor och nyhetsbrev samlar vi allt i ett gemensamt schema.',
    },

    community: {
      heading: 'Gemenskapen först',
      body: 'Sajten byggs och sköts av dansare i Stockholm, för dansare i Stockholm. Vi är inte knutna till någon enskild danskola eller förening, och visar därför event, socialdanser, tedanser och workshops från alla arrangörer i stan på lika villkor.',
      link: 'Diskussioner på GitHub',
    },

    open: {
      heading: 'Öppen kod, öppna data',
      body: 'Hela sajten, all data och verktygen som håller den uppdaterad ligger i ett publikt GitHub-repo. Vill du rätta ett event, bygga en ny funktion eller bara se hur det fungerar? Koden finns där, och alla bidrag är välkomna.',
      link: 'Se koden på GitHub',
    },
  },

  changelog: {
    heading: 'Nytt på sajten',
    subheading: 'Större uppdateringar, månad för månad',
    entriesLanguageNote: 'Posterna nedan är på engelska — de skrivs tillsammans med koden.',
  },

  contributors: {
    heading: 'Bidragsgivare',
    subheading: 'Personerna som byggt och underhåller sajten',
    onGitHub: 'på GitHub',
  },
} satisfies Dictionary;
