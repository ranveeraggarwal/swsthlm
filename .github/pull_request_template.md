## What changed

<!-- One or two sentences. For data-only PRs, "what changed and why" is enough. -->

<!-- Link the issue if there is one: Closes #N -->

## Checklist

<!-- Tick what applies; delete what doesn't. -->

- [ ] **Changelog** — this PR ships a major, user-visible feature, so it adds a line to the current month in [`src/lib/changelog.ts`](../src/lib/changelog.ts) (the About page's "What's new" timeline). See the rule at the top of that file. Data, fixes, refactors, and dependency bumps skip this.
- [ ] Code changes: `npm run lint`, `npx tsc --noEmit`, and `npm test` pass.
- [ ] Data changes: `npm run validate:data` passes.
- [ ] Visible changes: before/after screenshots below, in **both** light and dark theme.
