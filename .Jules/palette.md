## 2024-06-23 - Add Skip to Content Link
**Learning:** Adding a basic "Skip to content" link requires ensuring both the anchor link and the target container have matching `href` and `id` tags. Since the layout is generated in Next.js `layout.tsx`, adding it there guarantees it's present across all routes. Visually hiding the link until focus using Tailwind's `sr-only focus:not-sr-only` is a standard, robust pattern.
**Action:** Always check the main layout component (`layout.tsx`, `App.js`, etc.) for a skip link. If missing, this is a high-value, low-effort global accessibility win.
## 2026-06-25 - Add Empty State Reset Action
**Learning:** Adding an actionable button to an empty state is a crucial UX pattern. When users filter down to zero results, giving them a clear, one-click path to clear all filters ('Clear all filters') prevents them from having to manually untoggle everything and significantly reduces frustration.
**Action:** When implementing or reviewing list/grid views with multiple filters, ensure the empty state always includes an actionable way to reset or loosen those filters.
