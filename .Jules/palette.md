## 2024-06-23 - Add Skip to Content Link
**Learning:** Adding a basic "Skip to content" link requires ensuring both the anchor link and the target container have matching `href` and `id` tags. Since the layout is generated in Next.js `layout.tsx`, adding it there guarantees it's present across all routes. Visually hiding the link until focus using Tailwind's `sr-only focus:not-sr-only` is a standard, robust pattern.
**Action:** Always check the main layout component (`layout.tsx`, `App.js`, etc.) for a skip link. If missing, this is a high-value, low-effort global accessibility win.
## 2024-06-26 - Added "Clear all filters" CTA
**Learning:** The empty states generated when searching/filtering return no results should contain an actionable button allowing the user to reset all parameters.
**Action:** Add "Clear all filters" CTA buttons to 0-state scenarios whenever search and category filters are employed.
