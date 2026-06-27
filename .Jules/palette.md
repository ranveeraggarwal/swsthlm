## 2024-06-23 - Add Skip to Content Link
**Learning:** Adding a basic "Skip to content" link requires ensuring both the anchor link and the target container have matching `href` and `id` tags. Since the layout is generated in Next.js `layout.tsx`, adding it there guarantees it's present across all routes. Visually hiding the link until focus using Tailwind's `sr-only focus:not-sr-only` is a standard, robust pattern.
**Action:** Always check the main layout component (`layout.tsx`, `App.js`, etc.) for a skip link. If missing, this is a high-value, low-effort global accessibility win.
## 2025-02-14 - UX Pattern: Empty State Recovery
**Learning:** Adding a "Clear all filters" CTA within an empty state provides a critical escape hatch for users, preventing dead ends when their search or filter yields zero results.
**Action:** Always include a mechanism for resetting active constraints when rendering empty states caused by filtering or searching.
## 2025-02-14 - CI Failure: Validation script temporal integrity
**Learning:** The project's data validation script (`scripts/validate-data.mjs`) correctly flags when past events are still marked as `status: live` in the CSV files. The validation rule failed because rows 18, 28, and 52 in `data/oneoffs.csv` were incorrectly marked `live` after their respective dates (2026-06-25 and 2026-06-26) compared to the current runner date (2026-06-27).
**Action:** Always ensure you review data file errors during automated validation checks and correct the dataset temporal states (`status: ended`) accordingly.
