## 2024-06-23 - Add Skip to Content Link
**Learning:** Adding a basic "Skip to content" link requires ensuring both the anchor link and the target container have matching `href` and `id` tags. Since the layout is generated in Next.js `layout.tsx`, adding it there guarantees it's present across all routes. Visually hiding the link until focus using Tailwind's `sr-only focus:not-sr-only` is a standard, robust pattern.
**Action:** Always check the main layout component (`layout.tsx`, `App.js`, etc.) for a skip link. If missing, this is a high-value, low-effort global accessibility win.

## 2024-06-24 - Empty States Should Be Actionable
**Learning:** A static "No events match your filters" empty state provides poor UX if the filters are hidden or collapsed. Adding a contextual "Clear all filters" call-to-action directly in the empty state allows users a one-click path to recovery, lowering friction.
**Action:** Whenever designing or improving an empty state caused by filtering or searching, always include an actionable button to clear or reset the active constraints.

## 2024-06-24 - Accessible Read-Only Inputs
**Learning:** Read-only inputs used for displaying copyable text (like URLs) often lack an associated `<label>` because they are purely functional UI elements. Without an `aria-label`, screen readers announce "text, read only", leaving users confused about the content.
**Action:** Always add descriptive `aria-label` attributes to read-only inputs that lack visible labels.
## 2024-06-25 - Maintain Focus During Component Unmount
**Learning:** When a user interacts with a UI element (like a "Clear search" button) that causes the element itself to unmount, keyboard focus is often lost and dropped back to the `<body>`. This forces keyboard users to tab through the entire page again.
**Action:** When creating components that unmount on interaction, always use a `useRef` to explicitly shift focus to a logical neighboring element (e.g., shifting focus back to the search input when the "clear" button is pressed).
## 2026-07-07 - Focus Restoration on Filter Reset
**Learning:** When unmounting interactive elements (like a "Reset" button for filters), keyboard focus drops to the `<body>`. Setting focus back to a logical anchor, like the filter toggle button, requires `setTimeout(() => ref.current?.focus(), 0)` to safely wait for React's re-render cycle.
**Action:** When creating components that unmount on interaction, always use a `useRef` to explicitly shift focus to a logical neighboring element (e.g., shifting focus back to the filter toggle when the "clear" button is pressed). Wrapping the focus call in `setTimeout(() => ref.current?.focus(), 0)` ensures the DOM has updated before focus is applied.
## 2024-07-08 - Modal Focus Restoration
**Learning:** When a modal is closed, if focus is not explicitly managed, it drops back to the `<body>`. This forces keyboard users to start tabbing from the top of the page again.
**Action:** Always maintain a `ref` to the element that triggered the modal. Use this reference to restore focus via `setTimeout(() => triggerRef.current?.focus(), 0)` when the modal unmounts.
## 2024-11-20 - Accessible Accordions
**Learning:** Custom accordions must always pair `aria-expanded` on the toggle button with `aria-controls` pointing to the ID of the collapsible content panel. This programmatic link allows screen readers to correctly interpret the relationship between the trigger and the content it reveals. Additionally, purely decorative icons (like a chevron) inside the button should receive `aria-hidden="true"` to reduce screen reader noise.
**Action:** When implementing or modifying an accordion-style component, verify that the toggle button includes an `aria-controls` attribute linking it to the panel's `id`, and ensure decorative icons are hidden from assistive technology.
## 2026-07-10 - Add `title` tooltips to icon-only buttons
**Learning:** While `aria-label` provides accessibility for screen readers on icon-only interactive elements, sighted mouse users relying on hover to discover function are left guessing without a visual tooltip.
**Action:** Always pair `aria-label` with a `title` attribute of the exact same value for icon-only buttons and links to ensure both assistive technologies and sighted users understand their purpose.
## 2024-07-25 - Search Discoverability & Keyboard Navigation
**Learning:** Adding global keyboard shortcuts (like `/` for search) improves power-user navigation, but they are invisible by default. Without a visual `<kbd>` hint, users will never discover them. Additionally, the event listener must strictly check the `e.target` to ignore `INPUT` and `TEXTAREA` elements, otherwise it blocks normal typing in forms.
**Action:** Always pair a global keyboard shortcut with a visual `<kbd>` hint in the corresponding UI element. When implementing a shortcut, use `e.target instanceof HTMLElement` and check `.tagName` to ensure typing within existing inputs isn't intercepted.
## 2024-07-26 - Add Escape Handler and Focus Restoration for Collapsible Panels
**Learning:** When expanding collapsible panels (like search or filters) using a global keyboard shortcut, it's essential to allow users to easily reverse the action. Closing the panel by pressing `Escape` and immediately restoring focus back to the original trigger (the toggle button) preserves context and prevents keyboard users from losing their place in the document.
**Action:** Always implement an `Escape` key listener alongside global activation shortcuts. When reversing the state, explicitly shift focus back to the triggering element using a `useRef` and `setTimeout(() => triggerRef.current?.focus(), 0)`.
## 2024-07-28 - Active Navigation Links Require aria-current
**Learning:** While using styling (like highlighting or bolding) visually indicates to sighted users which navigation link corresponds to the current page, this information is not conveyed to screen reader users. The `aria-current="page"` attribute is the standard way to programmatically expose this state.
**Action:** Always check that active navigation links (e.g., `<Link>` components) conditionally include the `aria-current="page"` attribute based on the current pathname.
