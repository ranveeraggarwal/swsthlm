// Swing-relevance filter for bar/club sources whose calendars mix dance nights
// with unrelated programming (pub quizzes, rock gigs, open jams). A candidate
// is relevant iff its text matches an INCLUDE keyword and no EXCLUDE keyword;
// EXCLUDE always wins. This is intentionally coarse — the nightly PR is human
// reviewed, so the job here is only to cut the obvious noise, not to be exact.
//
// Tuning: edit the two lists. Keep them lowercase; matching is substring on the
// lowercased "<title> <genre>" text.

export const INCLUDE = [
  'jazz', 'swing', 'lindy', 'balboa', 'shag', 'blues', 'django', 'manouche',
  'gypsy', 'bop', 'hardbop', 'blue note', 'dixieland', 'big band', 'boogie',
  'hot club', 'charleston',
];

// EXCLUDE wins over INCLUDE. "Trad Jazz Jam" -> jam excludes; "Blues, Soul,
// Rock" -> rock excludes. Open jams are improv sessions, not dance socials.
export const EXCLUDE = [
  'quiz', 'quizz', 'jam', 'open mic', 'karaoke', 'rock', 'folk', 'psych',
  'pop', 'reggae', 'funk', 'soul', 'country', 'metal', 'punk', 'hip hop',
  'techno', 'house', 'disco',
];

// Match whole words only. Substring matching silently drops legit events
// ('jam' in "Jamboree", 'pop' in "Popcorn Jazz") — and because the review PR
// only shows additions, such false-excludes are invisible. Word boundaries
// favour visible false-includes (a human culls them) over invisible misses.
// Boundaries use Latin-letter lookarounds (not \b) so accented Swedish band
// names don't create spurious edges.
const ALPHA = 'a-zà-ÿ';
const wordRe = (k) =>
  new RegExp(`(?<![${ALPHA}])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![${ALPHA}])`, 'i');

const INCLUDE_RE = INCLUDE.map(wordRe);
const EXCLUDE_RE = EXCLUDE.map(wordRe);

export function isSwingRelevant(text) {
  const t = text ?? '';
  if (EXCLUDE_RE.some((re) => re.test(t))) return false;
  return INCLUDE_RE.some((re) => re.test(t));
}

// Just the EXCLUDE half: "is this non-dance noise?" (quiz, jam, rock, folk…).
// Roster-mode sources use this to drop obvious non-music before band-matching,
// WITHOUT requiring a swing keyword (the band roster decides swing-relevance).
export function looksLikeNoise(text) {
  return EXCLUDE_RE.some((re) => re.test(text ?? ''));
}
