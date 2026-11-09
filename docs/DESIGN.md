---
name: Rhythmic Heritage
colors:
  surface: '#fcfaef'
  surface-dim: '#dcdad0'
  surface-bright: '#fcfaef'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f4e9'
  surface-container: '#f0eee3'
  surface-container-high: '#eae8de'
  surface-container-highest: '#e4e3d8'
  on-surface: '#1b1c16'
  on-surface-variant: '#594138'
  inverse-surface: '#30312a'
  inverse-on-surface: '#f3f1e6'
  outline: '#8d7166'
  outline-variant: '#e1bfb2'
  surface-tint: '#a43d00'
  primary: '#a03b00'
  on-primary: '#ffffff'
  primary-container: '#c94c00'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb597'
  secondary: '#4f5e7e'
  on-secondary: '#ffffff'
  secondary-container: '#cadaff'
  on-secondary-container: '#505f7f'
  tertiary: '#725813'
  on-tertiary: '#ffffff'
  tertiary-container: '#8d712a'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb597'
  on-primary-fixed: '#360f00'
  on-primary-fixed-variant: '#7d2d00'
  secondary-fixed: '#d7e2ff'
  secondary-fixed-dim: '#b7c7eb'
  on-secondary-fixed: '#091b37'
  on-secondary-fixed-variant: '#374765'
  tertiary-fixed: '#ffdf99'
  tertiary-fixed-dim: '#e5c273'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#5a4300'
  background: '#fcfaef'
  on-background: '#1b1c16'
  surface-variant: '#e4e3d8'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The visual identity of this design system captures the kinetic energy and social warmth of the Stockholm swing dance scene. It draws inspiration from mid-century jazz posters and vintage Scandinavian graphic design, blending **Retro-Modernism** with a clean, functional layout.

The emotional response should be one of immediate inclusion and joyful movement. By utilizing a "paper-stock" aesthetic—avoiding pure blacks or clinical whites—the UI feels tactile and lived-in. The design uses rhythmic repetition, offset elements, and intentional asymmetry to mimic the syncopated steps of Lindy Hop, ensuring the interface feels as dynamic as the dance floor itself.

## Colors

The palette is built on high-contrast, nostalgic tones that evoke a sunset over a wood-floored ballroom.

- **Primary (Sunset Orange):** Used for calls to action, active states, and highlights. It represents the "energy" of the dance.
- **Secondary (Deep Navy):** Used for primary text, deep backgrounds, and grounding elements. It provides a "classic" foundation.
- **Tertiary (Vintage Gold):** Used for accents, badges, and secondary buttons.
- **Neutral (Cream):** The primary surface color. It is softer and warmer than white, reducing eye strain and enhancing the vintage feel.
- **Success/Error:** Muted versions of sage green and brick red to maintain the desaturated, nostalgic atmosphere.

## Typography

Typography is the rhythmic engine of this design system. We pair the high-contrast, elegant **Playfair Display** for headlines with the friendly, highly legible **Plus Jakarta Sans** for utility and body text, and set the printed facts — times, dates, catalogue-style labels — in **IBM Plex Mono**, the way a ticket stub or a record label sets them.

**Key Stylistic Rules:**
1. **The Syncopated Headline:** Large headlines should occasionally use *Italic* styles for specific words to create visual "swing" and emphasis.
2. **Uppercase Labels:** All labels and navigation items use uppercase Plus Jakarta Sans with slightly increased letter spacing to create a clean, "organized" look against the more decorative headlines.
3. **Line Height:** Generous line heights are used in body text to ensure accessibility and an open, community-focused feel.
4. **Mono is for metadata, sparingly.** `font-mono` (IBM Plex Mono, `--font-plex-mono`) sets a card's time, the row list's dates and times, the date block's weekday and month, section kickers ("No. 01 — This week"), and the bandstand's dates and figures' captions. Never body copy, never an event title, never a button label — if it isn't a fact a dancer scans for, it isn't mono.

## Layout & Spacing

The layout follows a **fixed-grid philosophy** that centers content to create a focused, editorial experience. 

- **Grid:** There is no 12-column grid. Page content sits in a centred `max-w-7xl` container (1280px, wider than the `container-max: 1200px` in the front-matter — the code is what ships). The event card grid steps 1 → 2 → 3 columns at `md` and `lg`; the compact list below it is full-width rows.
- **Asymmetric Balance:** To mirror the improvisation of swing dance, white space should be used generously. Aligning images slightly off-center or allowing text to overlap background shapes (using "paper-layering" logic) is encouraged.
- **Rhythmic Vertical Spacing:** Use multiples of 8px (base) for all padding and margins. Large sections should be separated by significantly more space (80px+) to maintain a clean, uncluttered "Stockholm" aesthetic.

## Elevation & Depth

This design system avoids realistic shadows in favor of **Graphic Layering**. Depth is communicated through color blocking and "sticker-stacking" rather than light sources.

**The test: if a shadow has a blur radius, it's wrong.** A blur simulates light falling on a surface, and this system has no light source to fall from — depth comes from one flat shape sitting on another, the way a sticker sits on paper. Every shadow in `src/` today is `Npx Npx 0px` (fifteen of them, no exceptions), so `grep -r 'shadow-\[' src/` is the whole audit.

Pair it with the right token: offsets use `--shadow-ink`, never `--on-surface`. They're identical in light mode, which is what makes the mistake easy to ship and impossible to see — in dark mode `--on-surface` turns the offset into a glowing cream slab.

- **Tonal Layers:** Surfaces are stacked using color. A Cream card sits on a slightly darker "Paper" background. 
- **Low-Contrast Outlines:** Instead of shadows, use 1px solid borders in Deep Navy (at 10-15% opacity) or subtle tonal shifts to define element boundaries.
- **The "Lift" State:** When an element (like a card) is hovered, it should shift its position (e.g., move 4px up and 4px left) with a solid, non-blurred offset "shadow" in Deep Navy to mimic a physical layer being lifted.

## Shapes

The shape language is **Soft (0.25rem)**. This provides enough roundness to feel friendly and approachable without veering into "bubbly" or overly modern territory. It maintains the crisp edges found in vintage printed programs and posters.

- **Interactive Elements:** Buttons and input fields use the standard `rounded` (4px).
- **Large Containers:** Cards and image containers use `rounded-lg` (8px).
- **Decorative Elements:** Occasional circular elements (like badges or profile avatars) provide a "spotlight" contrast to the otherwise rectangular grid.

## Components

### Buttons
- **Primary:** Solid Sunset Orange with Deep Navy text. High contrast, no gradient.
- **Secondary:** Deep Navy outline with Deep Navy text.
- **Tertiary/Ghost:** Text-only with an underline that appears on hover, mimicking a rhythmic "beat."

### Cards
Cards are the primary container for events and classes. They should use a subtle Cream-on-Cream tonal shift with a 1px border. Headlines within cards should always be Playfair Display.

An event card opens with a **header band** carrying the time, a `LIVE BAND` / `DJ SET` badge and the temporal badge, and the whole card is drawn as the night's music. The shapes do the telling, in the card's own ink:

- **Live band → ticket.** The stub is printed on tan stock (`--ticket-stock`: manila in light, kraft in dark — the palette's brass at partial strength on the card), which an ended or cancelled night drops for its own muted surface. Under it runs a 2px dashed perforation, inked in `--shadow-ink` as slots punched through (an umber `--border-ink` dash vanishes into the kraft), with a semicircular punch-out at each end of it and of the actions divider. Across the stub's corner, running off the edge, is a round admission stamp ("Live swing ★ Admit one") inked in `--primary`. Rubber never prints clean, so the stamp is textured — flecks where the ink didn't take, slightly ragged edges, one side pressed harder — and each lands at its own slant and grain, seeded from the event's id. When the card lifts, it squares up and swells as if pressed. A `mixed` night counts as live, as it does in the Live Music Only filter.
- **DJ set → record sleeve.** A solid edge with a flat 78 half tucked behind it; when the card lifts, it pops most of the way out with a quarter-turn spin.

Both motions stay put under `prefers-reduced-motion`. Because the badge already says which kind of night it is, the card's fact list only names performers; an unnamed band or DJ gets no "Live music" / "DJ set" line. The punch-outs' rims follow the card's border in every state, `.lift-card:hover` included — how, and why the card is a grid without `overflow-hidden`, is in the `.ticket-notch` comment in `globals.css`.

### Input Fields
Two treatments are in use, and the difference is deliberate:

- **The search field** is a full bounding box — 2px `--border-ink` border plus an offset `--shadow-ink` block that turns `--primary` on `focus-within`. It's the page's primary control and reads as a physical object.
- **Read-only display fields** (the calendar feed URL in the subscribe dialog) use a 2px bottom border only, for a lighter "ledger" look, since they're there to be copied rather than typed into.

Both go through tokens; neither uses a raw colour.

### Chips & Badges
Small tags carrying the facts a dancer scans for: dance style, floor type, beginner class, price, "3 nights". They are `rounded` (not pill), uppercase, and 10px.

Each chip family has its own semantic token pair rather than one shared accent — beginner uses `--success-container`, the multi-night badge uses `--info-container`, an ended card uses `--ended-container`, and the style chips map per style (Lindy → tertiary, Balboa → secondary, the rest neutral). Adding a new chip family means adding a token pair, not reaching for a Tailwind palette class. The wording and the colour mapping both live in `src/features/events/model/labels.ts`; the chip components are in `src/features/events/components/EventChips.tsx`.

### The homepage, as a magazine

The homepage reads top to bottom as an issue: a cover, then numbered departments.

- **Masthead (`HomeHero`).** A mono kicker over a large Playfair headline with its syncopated italic in `--primary`, the standfirst, and two CTAs — the primary sticker button to `#events`, an outlined secondary to `#music`. From `lg` up, a record slips out of a printed sleeve beside it: `--primary` stock with an `--on-primary` halftone, the site's old "in Full Swing" headline as its album title, the 78 inked like the DJ card's. It's `aria-hidden` and hidden below `lg` — on a phone the listing matters more than the art.
- **Section headings (`SectionHeading`).** A 2px `--border-ink` rule, a mono kicker numbered in render order ("No. 01"), then a Playfair headline. Numbers are assigned as sections render, so a section that steps aside never leaves a gap.
- **This week.** Each night sits under a **date block**: weekday and month in mono, the day numeral large in Playfair. On desktop it's a sticky left rail beside the cards; on a phone it's a single header line. It's the `h3`; the card titles under it are `h4`.
- **The bandstand (`MusicFeature`)** is a record sleeve: a dark navy jacket (`--sleeve`, its own token family) with cream lettering, lamplight-peach and brass spot colours, a halftone corner and a sticker shadow. Side A is a numbered track listing of the next bands to play; Side B is the liner notes — counts of band nights, bands, and DJ nights. Every line comes from the data (`model/highlights.ts`); nothing on it is written by hand, and it doesn't render if no band is listed.
- **Coming up.** The compact row list under month headings set in Playfair italic over a 2px rule, with the month's count in mono.
- **Find your rhythm (`DanceStyles`).** The four dances as newspaper columns, not cards: each under a 4px rule and a small record label in the dance's accent colour (`styleAccentClass` in `labels.ts`), with origin and tempo in mono, a short introduction, the number of nights given to that dance, and a button that applies the real style filter.

The bandstand and the style index step aside while any filter is on; both of their buttons replace the filter with one facet and move focus to the filter toggle, since the button pressed unmounts with its section.

**Photography.** There is none, deliberately: the project has no licensed photos of Stockholm's scene, and stock or generated dancers would be exactly the generic look this system avoids. The record, sleeve and stamp graphics carry the identity instead. If real, credited photographs become available, the hero's art column is where they'd go.

### Navigation
The navigation bar should be a simple, centered list of uppercase labels. It remains fixed to the top but uses a semi-transparent Cream backdrop with a "glass" blur to keep the focus on the content underneath as the user scrolls through the "rhythm" of the page.

## Dark theme

Dark mode is "the ballroom after midnight" — the same paper-stock world as the light theme, just after the house lights go down. Surfaces move to espresso/dark-wood browns (`#211913`, `#2d231c`, …), never a neutral or clinical black — the floor sits high enough that the warmth actually reads, not as an OLED void. Sunset orange primary softens into **lamplight peach** (`#ffb597`); deep navy secondary lightens into **moonlit steel** (`#b7c7eb`); vintage gold tertiary warms into **brass** (`#e5c273`). None of this is invented on the spot: the light palette in this file's front-matter is already M3-shaped, and the dark primary/secondary/tertiary values are exactly that palette's `inverse-primary` and `*-fixed-dim` roles, even though the front-matter doesn't name them that way. The dark neutrals deliberately do NOT reuse the light ink's olive hue family: an olive undertone is imperceptible at cream luminance but becomes the dominant page colour in dark, and green sits outside the sunset palette — an earlier cut shipped olive surfaces and the olive/peach pairing read as a clash. Brown is the hue family the brand's own metaphor names (the wood floor of the ballroom) and keeps peach, brass, and cream as one sunset family.

**After dark, light is elevation.** The light theme is a print metaphor — ink keylines and offset shadows on cream paper — and none of those cues survive naive inversion: shadows can't darken a near-black floor, and cream keylines glow. So the dark theme flips the depth system: the page is the darkest tone and every raised layer steps *visibly lighter* (page `#211913` → card `#2d231c` → chip/hover `#3e322a` → raised paper `#3a2e26`+), the way lamplight catches whatever is closest. Three consequences:

- **Structural keylines are inked with `--border-ink`, not `--on-surface`.** In light mode the two are the same `#1b1c16`, so nothing changes there; in dark, `--border-ink` is a warm low-contrast umber (`#614a3c`) so the 2px linework stays quiet structure instead of becoming the loudest thing on the page. The lifted surface tones do the separating.
- **`--surface-container-lowest` maps to the TOP of the dark ladder (`#3a2e26`), not the bottom.** This deliberately breaks the M3 dark convention, because the codebase uses that token to mean "brightest paper" (modals, the install toast, the search block, the about-page hero). With the M3 mapping those elements rendered as holes darker than the page.
- **Card hover brightens the border to `--on-surface`** (via `.lift-card:hover`). A no-op in light mode (the base border is already that color); in dark, brightness is earned by interaction — the spotlight hits the card you're reaching for.

**It's opt-in, not OS-following.** A first-time visitor always gets the light theme by default, regardless of their OS or browser `prefers-color-scheme` setting. Dark mode only activates when the visitor clicks the header toggle, and that choice then persists in `localStorage` for future visits. There is no `matchMedia('(prefers-color-scheme: dark)')` fallback anywhere in the implementation — an earlier draft of the umbrella issue proposed one, but it was deliberately dropped before the theme shipped.

### Token table

Exact values as merged in `src/app/globals.css` (`:root` vs. `:root[data-theme='dark']`):

| Token | Light | Dark |
|---|---|---|
| `--background` | `#fcfaef` | `#211913` |
| `--foreground` | `#1b1c16` | `#ece3d5` |
| `--surface` | `#fcfaef` | `#211913` |
| `--surface-dim` | `#dcdad0` | `#18110c` |
| `--surface-bright` | `#fcfaef` | `#56473c` |
| `--surface-container-lowest` | `#ffffff` | `#3a2e26` (top of ladder — see above) |
| `--surface-container-low` | `#f6f4e9` | `#2d231c` |
| `--surface-container` | `#f0eee3` | `#332822` |
| `--surface-container-high` | `#eae8de` | `#3e322a` |
| `--surface-container-highest` | `#e4e3d8` | `#4b3d33` |
| `--on-surface` | `#1b1c16` | `#ece3d5` |
| `--on-surface-variant` | `#594138` | `#e1bfb2` |
| `--outline` | `#8d7166` | `#aa8d81` |
| `--outline-variant` | `#e1bfb2` | `#594138` |
| `--primary` | `#a03b00` | `#ffb597` |
| `--on-primary` | `#ffffff` | `#5c1f00` |
| `--primary-container` | `#c94c00` | `#7d2d00` |
| `--on-primary-container` | `#fffbff` | `#ffdbcd` |
| `--secondary` | `#4f5e7e` | `#b7c7eb` |
| `--on-secondary` | `#ffffff` | `#21304c` |
| `--secondary-container` | `#cadaff` | `#374765` |
| `--on-secondary-container` | `#505f7f` | `#d7e2ff` |
| `--tertiary` | `#725813` | `#e5c273` |
| `--on-tertiary` | `#ffffff` | `#3e2e00` |
| `--tertiary-container` | `#8d712a` | `#5a4300` |
| `--on-tertiary-container` | `#fffbff` | `#ffdf99` |
| `--error` | `#ba1a1a` | `#ffb4ab` |
| `--on-error` | `#ffffff` | `#690005` |
| `--error-container` | `#ffdad6` | `#93000a` |
| `--on-error-container` | `#93000a` | `#ffdad6` |
| `--live` | `#dc2626` | `#dc2626` (unchanged — see rules below) |
| `--on-live` | `#ffffff` | `#ffffff` (unchanged) |
| `--success-container` | `#e5f3e6` | `#1f3622` |
| `--on-success-container` | `#2f5934` | `#b3d8b5` |
| `--info-container` | `#eef2ff` | `#2c3254` |
| `--on-info-container` | `#3730a3` | `#c5cdf7` |
| `--ended-container` | `#e4e4e7` | `#2e2f33` |
| `--on-ended-container` | `#52525b` | `#a5a5ad` |
| `--ended-outline` | `#a1a1aa` | `#55555c` |
| `--ended-surface` | `#fafafa` | `#272321` |
| `--ended-surface-outline` | `#d4d4d8` | `#4c4540` |
| `--ticket-stock` | `#edd8a8` | `#52432d` (live-music ticket stub — see Cards) |
| `--border-ink` | `#1b1c16` | `#614a3c` |
| `--shadow-ink` | `#1b1c16` | `#110b07` |
| `--sleeve` | `#232a3d` | `#283149` (the bandstand's navy jacket — a dark object in both themes, lifted a step after dark) |
| `--on-sleeve` | `#f3f1e6` | `#f3f1e6` |
| `--on-sleeve-variant` | `#c9cfdd` | `#c9cfdd` |
| `--sleeve-accent` | `#ffb597` | `#ffb597` (lamplight peach) |
| `--sleeve-brass` | `#e5c273` | `#e5c273` |
| `--sleeve-rule` | `#3d4660` | `#435072` |

`color-scheme` is also set per theme (`light` / `dark`) on the same `:root` blocks, so native form controls and the scrollbar follow automatically.

### Rules future changes must follow

- **Never hardcode a color in a component; always go through a `var(--…)` token.** `text-white` on `bg-[var(--primary)]` is the canonical bug that shipped *twice* in this codebase — once across `EventCard`/the event listing in the Phase 1 refactor, and again in `AddToCalendarButton.tsx`/`SubscribeButton.tsx`, caught only during the Phase 2 QA pass. It works by accident in light mode (`--on-primary` happens to be white) and breaks completely once `--primary` becomes a light peach in dark mode. Always use `text-[var(--on-primary)]`, `text-[var(--on-secondary)]`, etc.
- **Structural keylines (card/button/chip/divider borders) use `--border-ink`, never `--on-surface`.** Identical in light mode (`--border-ink` is the same `#1b1c16`), but in dark mode `--on-surface` becomes a light cream — a 2px cream outline on a dark ground glows, turning quiet structure into the loudest element on the page. This is the border-color analogue of the `text-white` bug above; it shipped across every card and button in the first dark-theme cut.
- **Sticker-stack shadows use `--shadow-ink`, never `--on-surface`.** They look identical in light mode (`--shadow-ink` is the same `#1b1c16`), but in dark mode `--on-surface` becomes a light cream — pointing a shadow at it would draw pale shadows on every card.
- **`--live` (the "happening now" red) is theme-invariant by design.** It's an urgency signal, not a surface color, and it reads correctly against both grounds — don't override it in the dark block.
- **Brand provider buttons and OG images are intentionally theme-independent and always light.** The Apple/Google/Outlook fills live in `src/components/ui/CalendarProviderMarks.tsx` (`PROVIDER_FILL`) and are other companies' marks, not our palette; the `opengraph-image.tsx` files render fixed light-theme social-preview cards because satori can't read CSS custom properties. Don't theme either.
- **New status colors need a semantic token pair.** Define `--x-container` / `--on-x-container` in both `:root` and `:root[data-theme='dark']`, following the `--success-container`/`--info-container`/`--ended-container` pattern, rather than reaching for a raw Tailwind palette class.

### How theming works mechanically

A `data-theme` attribute on `<html>` (`"light"` or `"dark"`) is stamped **before first paint** by a tiny inline script in `src/app/layout.tsx`'s `<head>`: it reads `localStorage.theme`, defaults to `'light'` if the value is missing or invalid, and sets the attribute synchronously so there's no flash of the wrong theme. `<html>` carries `suppressHydrationWarning` since this mutation happens before React hydrates.

`ThemeToggle` (`src/components/layout/ThemeToggle.tsx`) is a client component rendered in the header (`src/components/layout/Header.tsx`), showing a `Moon` icon (from `lucide-react`) when the site is light — "switch me to dark" — and a `Sun` icon when it's dark. Clicking it flips `data-theme` on `<html>`, writes the choice to `localStorage.theme`, and updates the `<meta name="theme-color">` tag to match (`#a03b00` light / `#211913` dark), all client-side with no reload. The same meta sync also runs once on mount: the tag is server-rendered with the light value, so a dark-mode page load needs it corrected as soon as the toggle hydrates. There are no cookies and no server involvement anywhere in this — it fits the same static-site architecture as everything else.