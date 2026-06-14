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
  'gypsy', 'bop', 'blue note', 'dixieland', 'big band', 'boogie', 'hot club',
  'charleston',
];

// EXCLUDE wins over INCLUDE. "Trad Jazz Jam" -> jam excludes; "Blues, Soul,
// Rock" -> rock excludes. Open jams are improv sessions, not dance socials.
export const EXCLUDE = [
  'quiz', 'quizz', 'jam', 'open mic', 'karaoke', 'rock', 'folk', 'psych',
  'pop', 'reggae', 'funk', 'soul', 'country', 'metal', 'punk', 'hip hop',
  'techno', 'house', 'disco',
];

export function isSwingRelevant(text) {
  const t = (text ?? '').toLowerCase();
  if (EXCLUDE.some((k) => t.includes(k))) return false;
  return INCLUDE.some((k) => t.includes(k));
}
