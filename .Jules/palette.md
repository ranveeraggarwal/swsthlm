## YYYY-MM-DD - [Title]
**Learning:** [UX/a11y insight]
**Action:** [How to apply next time]

## 2026-08-05 - Prevent Redundant Announcements for Decorative Icons
**Learning:** When decorative icons (e.g., from `lucide-react`) are placed inside interactive components (like buttons or links) that already have descriptive text or an `aria-label`, they are read aloud by screen readers if not explicitly hidden. This leads to redundant and confusing announcements for visually impaired users.
**Action:** Always explicitly apply `aria-hidden="true"` to decorative icons (or icons that merely reinforce the text they accompany) to ensure they are ignored by screen readers, maintaining a clean and focused accessibility tree.
