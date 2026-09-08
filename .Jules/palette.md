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
## 2026-08-18 - [Localize Screen Reader Texts]
**Learning:** Hardcoded English text like '(opens in a new tab)' for screen readers must be replaced by localized strings using `bundle.card.opensInNewTab` to ensure the site is fully accessible to non-English screen reader users. Also noting that `bundle.card.opensInNewTab` already contains a leading space so no extra space is needed before it in text nodes.
**Action:** Use `useLocale().bundle` to dynamically fetch and apply localized screen reader text.
## 2026-08-19 - [Read-only URL copy inputs]
**Learning:** Reusable UX Pattern: Read-only `<input>` elements used for displaying copyable text (e.g., URLs) should include an `onClick` handler to trigger the copy action, a `cursor-pointer` utility class, and a localized `title` tooltip to provide an intuitive shortcut for users.
**Action:** Enhance read-only URL inputs with copy-on-click functionality to reduce user friction.
## 2026-08-20 - Search input Escape handler
**Learning:** Reusable UX Pattern: When a search input is housed within a dismissible component (like a panel or modal), pressing the `Escape` key should clear the input's text and stop event propagation (`e.stopPropagation()`), rather than immediately closing the parent component.
**Action:** Always intercept `Escape` on search inputs to clear them before allowing the event to bubble up.

## 2026-08-20 - Shortcut Hints in Tooltips
**Learning:** Reusable UX Pattern: Interactive elements with associated keyboard shortcuts (e.g., a 'Clear search' button triggered by `Escape`) should append a text hint like `(Esc)` to their `title` attribute to aid discoverability for pointer users.
**Action:** When adding keyboard shortcuts to specific actions, update the corresponding button's `title` (but not necessarily the `aria-label`, to avoid verbose announcements) to indicate the shortcut.
