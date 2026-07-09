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

Typography is the rhythmic engine of this design system. We pair the high-contrast, elegant **Playfair Display** for headlines with the friendly, highly legible **Plus Jakarta Sans** for utility and body text.

**Key Stylistic Rules:**
1. **The Syncopated Headline:** Large headlines should occasionally use *Italic* styles for specific words to create visual "swing" and emphasis.
2. **Uppercase Labels:** All labels and navigation items use uppercase Plus Jakarta Sans with slightly increased letter spacing to create a clean, "organized" look against the more decorative headlines.
3. **Line Height:** Generous line heights are used in body text to ensure accessibility and an open, community-focused feel.

## Layout & Spacing

The layout follows a **fixed-grid philosophy** that centers content to create a focused, editorial experience. 

- **Grid:** A 12-column grid on desktop, transitioning to a 4-column grid on mobile.
- **Asymmetric Balance:** To mirror the improvisation of swing dance, white space should be used generously. Aligning images slightly off-center or allowing text to overlap background shapes (using "paper-layering" logic) is encouraged.
- **Rhythmic Vertical Spacing:** Use multiples of 8px (base) for all padding and margins. Large sections should be separated by significantly more space (80px+) to maintain a clean, uncluttered "Stockholm" aesthetic.

## Elevation & Depth

This design system avoids realistic shadows in favor of **Graphic Layering**. Depth is communicated through color blocking and "sticker-stacking" rather than light sources.

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

### Input Fields
Inputs should feel tactile. Use a solid 2px bottom-border in Deep Navy for a "ledger" look, rather than a full bounding box, to keep the UI feeling light and airy.

### Chips & Badges
Small, pill-shaped tags used for "Beginner," "Intermediate," or "Social Dance" labels. These use the Tertiary Vintage Gold to pop against the Cream background without the aggression of the Primary Orange.

### Navigation
The navigation bar should be a simple, centered list of uppercase labels. It remains fixed to the top but uses a semi-transparent Cream backdrop with a "glass" blur to keep the focus on the content underneath as the user scrolls through the "rhythm" of the page.

## Dark theme

Dark mode is "the ballroom after midnight" — the same paper-stock world as the light theme, just after the house lights go down. Surfaces move to a warm olive-charcoal (`#13140d`, `#1b1c16`, …), never a neutral or clinical black, so the tactile, lived-in feel of the light palette survives the switch. Sunset orange primary softens into **lamplight peach** (`#ffb597`); deep navy secondary lightens into **moonlit steel** (`#b7c7eb`); vintage gold tertiary warms into **brass** (`#e5c273`). None of this is invented on the spot: the light palette in this file's front-matter is already M3-shaped, and the dark primary/secondary/tertiary values are exactly that palette's `inverse-primary` and `*-fixed-dim` roles, even though the front-matter doesn't name them that way. The dark neutrals stay in the same hue family as the light ink (`#1b1c16`) rather than drifting to a different grey.

**It's opt-in, not OS-following.** A first-time visitor always gets the light theme by default, regardless of their OS or browser `prefers-color-scheme` setting. Dark mode only activates when the visitor clicks the header toggle, and that choice then persists in `localStorage` for future visits. There is no `matchMedia('(prefers-color-scheme: dark)')` fallback anywhere in the implementation — an earlier draft of the umbrella issue proposed one, but it was deliberately dropped before the theme shipped.

### Token table

Exact values as merged in `src/app/globals.css` (`:root` vs. `:root[data-theme='dark']`):

| Token | Light | Dark |
|---|---|---|
| `--background` | `#fcfaef` | `#13140d` |
| `--foreground` | `#1b1c16` | `#e4e3d8` |
| `--surface` | `#fcfaef` | `#13140d` |
| `--surface-dim` | `#dcdad0` | `#0e0f08` |
| `--surface-bright` | `#fcfaef` | `#393a32` |
| `--surface-container-lowest` | `#ffffff` | `#0e0f08` |
| `--surface-container-low` | `#f6f4e9` | `#1b1c16` |
| `--surface-container` | `#f0eee3` | `#1f201a` |
| `--surface-container-high` | `#eae8de` | `#2a2b24` |
| `--surface-container-highest` | `#e4e3d8` | `#35362f` |
| `--on-surface` | `#1b1c16` | `#e4e3d8` |
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
| `--ended-surface` | `#fafafa` | `#191a1c` |
| `--ended-surface-outline` | `#d4d4d8` | `#3b3c40` |
| `--shadow-ink` | `#1b1c16` | `#0e0f08` |

`color-scheme` is also set per theme (`light` / `dark`) on the same `:root` blocks, so native form controls and the scrollbar follow automatically.

### Rules future changes must follow

- **Never hardcode a color in a component; always go through a `var(--…)` token.** `text-white` on `bg-[var(--primary)]` is the canonical bug that shipped *twice* in this codebase — once across `EventCard`/`EventFilters` in the Phase 1 refactor, and again in `AddToCalendarButton.tsx`/`SubscribeButton.tsx`, caught only during the Phase 2 QA pass. It works by accident in light mode (`--on-primary` happens to be white) and breaks completely once `--primary` becomes a light peach in dark mode. Always use `text-[var(--on-primary)]`, `text-[var(--on-secondary)]`, etc.
- **Sticker-stack shadows use `--shadow-ink`, never `--on-surface`.** They look identical in light mode (`--shadow-ink` is the same `#1b1c16`), but in dark mode `--on-surface` becomes a light cream — pointing a shadow at it would draw pale shadows on every card.
- **`--live` (the "happening now" red) is theme-invariant by design.** It's an urgency signal, not a surface color, and it reads correctly against both grounds — don't override it in the dark block.
- **Brand provider buttons and OG images are intentionally theme-independent and always light.** The Apple/Google/Outlook buttons inside `AddToCalendarButton.tsx`/`SubscribeButton.tsx` use fixed external brand colors, and `opengraph-image.tsx` files render fixed light-theme social-preview cards — don't theme either.
- **New status colors need a semantic token pair.** Define `--x-container` / `--on-x-container` in both `:root` and `:root[data-theme='dark']`, following the `--success-container`/`--info-container`/`--ended-container` pattern, rather than reaching for a raw Tailwind palette class.

### How theming works mechanically

A `data-theme` attribute on `<html>` (`"light"` or `"dark"`) is stamped **before first paint** by a tiny inline script in `src/app/layout.tsx`'s `<head>`: it reads `localStorage.theme`, defaults to `'light'` if the value is missing or invalid, and sets the attribute synchronously so there's no flash of the wrong theme. `<html>` carries `suppressHydrationWarning` since this mutation happens before React hydrates.

`ThemeToggle` (`src/components/ThemeToggle.tsx`) is a client component rendered in the header (`src/components/Header.tsx`), showing a `Moon` icon (from `lucide-react`) when the site is light — "switch me to dark" — and a `Sun` icon when it's dark. Clicking it flips `data-theme` on `<html>`, writes the choice to `localStorage.theme`, and updates the `<meta name="theme-color">` tag to match (`#a03b00` light / `#13140d` dark), all client-side with no reload. There are no cookies and no server involvement anywhere in this — it fits the same static-site architecture as everything else.