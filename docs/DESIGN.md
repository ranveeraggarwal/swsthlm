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