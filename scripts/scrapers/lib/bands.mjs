// The band-trust roster matcher. Reads data/bands.csv and classifies a scraped
// band name as trusted / rejected / pending / new, so the runner knows whether
// to propose an event (trusted), drop it (rejected/pending), or surface the act
// for vetting (new). Matching is normalize + fuzzy because scraped names vary
// (accents, ensemble suffixes, word order) and a human reviews every PR — so we
// lean toward recall over precision.

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';

const BANDS_PATH = path.join(process.cwd(), 'data', 'bands.csv');

// Dice-coefficient threshold for a match. Moderate on purpose (human reviews).
export const MATCH_THRESHOLD = 0.72;

// Ensemble nouns that don't carry identity — stripped before comparing, so
// "Tommy Löbel Swing Band" and "Tommy Löbel" collapse together. Genre words
// (swing/jazz/blues) are kept; they can be part of a name.
const NOISE_WORDS = new Set([
  'the', 'band', 'orchestra', 'orkester', 'orkestern', 'trio', 'quartet',
  'quartett', 'kvartett', 'kvartetten', 'quintet', 'quintett', 'kvintett',
  'sextet', 'septet', 'group', 'grupp', 'combo', 'ensemble',
]);

const stripDiacritics = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

// Name → comparable token string: accents removed, punctuation gone, ensemble
// nouns dropped, whitespace collapsed.
export function normalizeBand(name) {
  return stripDiacritics((name ?? '').toLowerCase())
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !NOISE_WORDS.has(w))
    .join(' ')
    .trim();
}

// Name → slug for a new bands.csv id.
export function slugifyBand(name) {
  return stripDiacritics((name ?? '').toLowerCase())
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function bigrams(s) {
  const out = new Map();
  for (let i = 0; i < s.length - 1; i += 1) {
    const g = s.slice(i, i + 2);
    out.set(g, (out.get(g) ?? 0) + 1);
  }
  return out;
}

// Sørensen–Dice coefficient over character bigrams. 1 = identical, 0 = nothing
// shared. No dependency.
export function similarity(a, b) {
  if (a === b) return a.length ? 1 : 0;
  if (a.length < 2 || b.length < 2) return 0;
  const A = bigrams(a);
  let inter = 0;
  let total = 0;
  for (const n of A.values()) total += n;
  for (const [g, n] of bigrams(b)) {
    total += n;
    inter += Math.min(n, A.get(g) ?? 0);
  }
  return (2 * inter) / total;
}

export function loadBands(file = BANDS_PATH) {
  if (!existsSync(file)) return [];
  const parsed = Papa.parse(readFileSync(file, 'utf-8'), { header: true, skipEmptyLines: true });
  return (parsed.data ?? [])
    .filter((r) => (r.id ?? '').trim())
    .map((r) => ({
      id: r.id.trim(),
      name: (r.name ?? '').trim(),
      aliases: (r.aliases ?? '').split('|').map((a) => a.trim()).filter(Boolean),
      style: (r.style ?? '').trim(),
      swing: (r.swing ?? '').trim(),
    }));
}

const SWING_STATUS = { yes: 'trusted', no: 'rejected', unknown: 'pending' };

/**
 * Classify a scraped band name against the roster (matched on name + aliases).
 * @returns {{status:'trusted'|'rejected'|'pending'|'new', band?:object, score?:number}}
 */
export function classify(bandName, roster, threshold = MATCH_THRESHOLD) {
  const q = normalizeBand(bandName);
  if (!q) return { status: 'new' };
  let best = null;
  let bestScore = 0;
  for (const band of roster) {
    for (const form of [band.name, ...band.aliases]) {
      const f = normalizeBand(form);
      if (!f) continue;
      const s = f === q ? 1 : similarity(q, f);
      if (s > bestScore) { bestScore = s; best = band; }
    }
  }
  if (best && bestScore >= threshold) {
    return { status: SWING_STATUS[best.swing] ?? 'pending', band: best, score: bestScore };
  }
  return { status: 'new', score: bestScore };
}
