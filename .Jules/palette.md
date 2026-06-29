## 2024-06-23 - Add Skip to Content Link
**Learning:** Adding a basic "Skip to content" link requires ensuring both the anchor link and the target container have matching `href` and `id` tags. Since the layout is generated in Next.js `layout.tsx`, adding it there guarantees it's present across all routes. Visually hiding the link until focus using Tailwind's `sr-only focus:not-sr-only` is a standard, robust pattern.
**Action:** Always check the main layout component (`layout.tsx`, `App.js`, etc.) for a skip link. If missing, this is a high-value, low-effort global accessibility win.

## 2024-06-24 - Empty States Should Be Actionable
**Learning:** A static "No events match your filters" empty state provides poor UX if the filters are hidden or collapsed. Adding a contextual "Clear all filters" call-to-action directly in the empty state allows users a one-click path to recovery, lowering friction.
**Action:** Whenever designing or improving an empty state caused by filtering or searching, always include an actionable button to clear or reset the active constraints.

## 2024-06-24 - Accessible Read-Only Inputs
**Learning:** Read-only inputs used for displaying copyable text (like URLs) often lack an associated `<label>` because they are purely functional UI elements. Without an `aria-label`, screen readers announce "text, read only", leaving users confused about the content.
**Action:** Always add descriptive `aria-label` attributes to read-only inputs that lack visible labels.
