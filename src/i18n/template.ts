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

/** A template broken into literal text and the placeholders between it. */
export type TemplatePart =
  | { kind: 'text'; value: string }
  | { kind: 'token'; name: string };

/**
 * The general form of `splitTemplate`, for prose with more than one
 * substitution — the About page's sentences, which have links inside them
 * ("fill in our {form} or {email}").
 *
 * Splitting those into separate strings per fragment would be the alternative,
 * and it makes them untranslatable: a fragment like "or" carries no meaning on
 * its own, and no translator can move a link to where their language wants it
 * if the sentence has already been cut up. One string with named holes stays a
 * sentence.
 */
export function tokenize(template: string): TemplatePart[] {
  const parts: TemplatePart[] = [];
  const pattern = /\{(\w+)\}/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(template)) !== null) {
    if (match.index > last) {
      parts.push({ kind: 'text', value: template.slice(last, match.index) });
    }
    parts.push({ kind: 'token', name: match[1] });
    last = match.index + match[0].length;
  }
  if (last < template.length) parts.push({ kind: 'text', value: template.slice(last) });

  return parts;
}
