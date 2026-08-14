## 2026-08-14 - [Localizing ARIA labels]
**Learning:** Hardcoded English strings in ARIA labels or titles for global UI controls (e.g., Theme toggles) must be replaced with localized strings to ensure accessibility for all supported languages.
**Action:** Always check the localization bundles (e.g., `src/i18n/en.ts`, `sv.ts`) when adding or modifying labels or titles, and use `useLocale().bundle` instead of hardcoding English strings.
