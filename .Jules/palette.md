## 2026-07-26 - [Form Field Required Indicator]
**Learning:** Required form fields must visually indicate their necessity (e.g., with a red asterisk) and use the `required` or `aria-required` attribute to programmatically announce this to screen readers, preventing confusing error states upon submission attempts.
**Action:** Always ensure that fields essential to a form's function carry both visual markers and semantic `required` attributes.

## 2026-07-27 - [Decorative Icons in Reusable Components]
**Learning:** Reusable UI components that accept icon props (like `IconButton` or `Modal`) must explicitly apply `aria-hidden="true"` to the instantiated icon element (e.g. `<Icon aria-hidden="true" />`). This ensures that all usages across the application remain hidden from screen readers, preventing redundant or confusing announcements since the parent container already provides proper `aria-label`s.
**Action:** When creating or updating a reusable component that renders an icon prop, always add `aria-hidden="true"` to the rendered icon.
## 2023-11-20 - Decorative Icons inside Actionable Elements
**Learning:** Decorative icons (like Lucide's `Ticket`, `Moon`, `Music`) that sit beside descriptive text inside an actionable component (link, button, chip) will be read redundantly or confusingly by screen readers unless explicitly marked as hidden. This is particularly noticeable in dense data displays like event rows and cards where many small icon+text pairs are used.
**Action:** Always append `aria-hidden="true"` to generic icons used for visual flair next to text, especially in reusable micro-components like chips and small fact rows.

## 2026-08-05 - Prevent Redundant Announcements for Decorative Icons
**Learning:** When decorative icons (e.g., from `lucide-react`) are placed inside interactive components (like buttons or links) that already have descriptive text or an `aria-label`, they are read aloud by screen readers if not explicitly hidden. This leads to redundant and confusing announcements for visually impaired users.
**Action:** Always explicitly apply `aria-hidden="true"` to decorative icons (or icons that merely reinforce the text they accompany) to ensure they are ignored by screen readers, maintaining a clean and focused accessibility tree.
## 2026-08-05 - [Appended strings missing space]
**Learning:** When appending a translation string like `bundle.card.opensInNewTab` (which already has a leading space) to another attribute, it works without a space. However, it's generally best to explicitly evaluate if the string needs a space when doing string interpolation to avoid runtime string bugs in visual tooltips.
**Action:** When adding attributes via string interpolation, review the exact translation string source to confirm leading spaces.
## 2026-08-12 - Explicit button types
**Learning:** Reusable UX Pattern: Explicitly set `type="button"` on interactive `<button>` elements (e.g., toggles, resets) to prevent them from implicitly acting as submit buttons if ever nested inside a form.
**Action:** Always verify that `<button>` elements that trigger client-side interactions have `type="button"`.

## 2026-08-17 - Localize Global Control ARIA Labels
**Learning:** Hardcoded English ARIA labels on global UI controls (like theme toggles) make the site inaccessible for non-English screen reader users, even when they've switched the site language.
**Action:** Use `useLocale().bundle` to dynamically fetch and apply localized ARIA labels and title attributes for all global UI components to ensure accessibility across supported languages.
## 2026-08-21 - Localized Screen Reader Hints
**Learning:** Hardcoded English strings in visually hidden spans (e.g. `sr-only`) for accessibility hints fail to communicate appropriately when users change their UI language, resulting in mismatched language readouts by screen readers.
**Action:** Use `useLocale().bundle` to inject localized variants (like `bundle.card.opensInNewTab`) dynamically for all visually hidden assistive text.
