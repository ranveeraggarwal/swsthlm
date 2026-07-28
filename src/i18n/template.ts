// Splitting a template around a placeholder, for the handful of sentences
// where the substituted value is rendered as markup — a bold count, a bold
// event title — rather than plain text.
//
// Those can't go through `String.replace`: the value is a React node, not a
// string. Splitting lets the component render `{before}<strong>{value}</strong>
// {after}` while the *sentence* stays in the locale file, which is what keeps
// word order translatable. Swedish putting the count somewhere English doesn't
// is then a change to `sv.ts`, not to a component.

/**
 * Splits `template` around `{token}`, returning the text before and after it.
 *
 * A template missing the token yields `[template, '']` — the sentence renders
 * whole and the value is dropped rather than the component throwing. That's
 * the better failure for a typo in a locale file: visibly incomplete text, not
 * a blank page.
 */
export function splitTemplate(template: string, token: string): [string, string] {
  const marker = `{${token}}`;
  const at = template.indexOf(marker);
  if (at === -1) return [template, ''];
  return [template.slice(0, at), template.slice(at + marker.length)];
}
