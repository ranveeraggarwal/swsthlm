## 2026-07-26 - [Form Field Required Indicator]
**Learning:** Required form fields must visually indicate their necessity (e.g., with a red asterisk) and use the `required` or `aria-required` attribute to programmatically announce this to screen readers, preventing confusing error states upon submission attempts.
**Action:** Always ensure that fields essential to a form's function carry both visual markers and semantic `required` attributes.

## 2026-07-27 - [Decorative Icons in Reusable Components]
**Learning:** Reusable UI components that accept icon props (like `IconButton` or `Modal`) must explicitly apply `aria-hidden="true"` to the instantiated icon element (e.g. `<Icon aria-hidden="true" />`). This ensures that all usages across the application remain hidden from screen readers, preventing redundant or confusing announcements since the parent container already provides proper `aria-label`s.
**Action:** When creating or updating a reusable component that renders an icon prop, always add `aria-hidden="true"` to the rendered icon.
