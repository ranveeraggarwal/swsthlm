# SEO & AI discoverability

How stockholmswing.com gets found — by search engines and by AI assistants
(ChatGPT, Claude, Perplexity, Gemini). The on-site half is code in this repo;
the off-site half is a one-time operational checklist for the maintainer.

## On-site (implemented in this repo)

| Piece | Where | What it does |
|---|---|---|
| Sitemap | `src/app/sitemap.ts` → `/sitemap.xml` | Lists home, about, and every event permalink — **twice, once per locale**, each entry carrying its `xhtml:link` alternates. Regenerated on each deploy. |
| Robots | `src/app/robots.ts` → `/robots.txt` | Allows all crawlers (including AI crawlers — deliberate, see below) and points to the sitemap. |
| Canonical URLs | `alternates.canonical` in each page's metadata | Prevents duplicate-content dilution across URL variants. **Each locale is canonical to itself** — `/sv` must never canonicalise to `/`, or the Swedish tree leaves the index. |
| hreflang | `src/lib/i18n/alternates.ts` | `en` / `sv` / `x-default` on every page in both trees. Both sides are derived from one function so the annotations stay reciprocal — Google discards one-directional hreflang. |
| Structured data | `src/features/events/jsonld.ts` | `WebSite` node + schema.org `DanceEvent` per event, embedded as JSON-LD on the homepage and permalinks. This is what makes Google event rich results and AI answers possible. |
| Per-page metadata | `metadata` / `generateMetadata` exports | Unique, descriptive `<title>` and `<meta description>` per page. |
| `llms.txt` | `public/llms.txt` | Plain-language site summary for AI crawlers ([llmstxt.org](https://llmstxt.org) convention). |

Keep these in sync: a new page type needs a canonical, a sitemap entry, and
metadata — **in both locale trees**. Route metadata should call
`localeAlternates(locale, path)` rather than hand-writing an `alternates`
object; passing the same English path from both trees is what guarantees the
hreflang pair points both ways. Validate structured data after changes with
[Google's Rich Results Test](https://search.google.com/test/rich-results).

### The two locale trees

English is unprefixed at `/`; Swedish is prerendered at `/sv/*` (issue #259).
For search, the two are separate indexable sites that happen to share data:

- **Titles and descriptions are translated for search intent, not calqued.**
  `src/lib/i18n/{en,sv}.ts` → the `meta` namespace. Swedish dancers google
  *socialdans*, *swingdans*, *lindy hop stockholm* — matching those queries is
  the entire reason `/sv` is prerendered rather than a client-side toggle.
- **Event titles and descriptions stay in the organizer's language** in both
  trees. Only the chrome is translated, so a Swedish permalink legitimately
  shows an English event title and vice versa.
- **`jsonld.ts`'s `inLanguage` is not localised.** It describes event content,
  which is mixed Swedish and English regardless of which tree you're on.
  Emitting `sv` on the Swedish page would be a false claim about the data.
- **One `calendar.ics`, one set of OG images.** The Swedish permalinks point
  `og:image` at the English permalink's satori route.

## Off-site checklist (maintainer, one-time)

A new domain is invisible until search engines are told about it and other
sites link to it. Roughly in order of impact:

1. **Google Search Console** — <https://search.google.com/search-console>.
   Verify the domain (DNS TXT record where the domain is registered, or via
   Vercel's Search Console integration), submit `https://stockholmswing.com/sitemap.xml`,
   then use *URL Inspection → Request indexing* on the homepage. This is the
   single biggest lever; without it a small new site can take months to be
   crawled. **Request indexing on `/sv` too**, and spot-check one Swedish
   permalink — the Swedish tree is a separate set of URLs and gets discovered
   separately. Search Console's *International Targeting → Language* report is
   where broken hreflang shows up ("no return tags" means the reciprocity
   check failed); it should stay empty.
2. **Bing Webmaster Tools** — <https://www.bing.com/webmasters>. Can import
   the verified Search Console property in one click. **Bing's index feeds
   DuckDuckGo and is a major retrieval source for ChatGPT and Copilot**, so
   this covers three of the surfaces we care about.
3. **Check nothing is blocking indexing.** On the *production* deployment,
   confirm `curl -sI https://stockholmswing.com` shows no `X-Robots-Tag: noindex`
   header (Vercel adds it to *preview* deployments only — if the apex domain is
   accidentally serving a preview branch, it will never be indexed). Also
   confirm Vercel "Deployment Protection" / password protection is off for
   production.
4. **Backlinks from places that already rank.** Search engines and AI models
   both learn about sites from links and mentions. Highest-value, all free:
   - Ask local organizers/studios whose events we list to link back to us.
   - Swing-dance event directories and wikis (e.g. swingplanit.com and
     similar), the r/SwingDancing subreddit wiki, local Facebook groups.
   - The GitHub repo already links to the site — keep that.
5. **AI assistant discoverability.** There is no submission form for chatbots;
   they learn from (a) their live web-search tools, which mostly ride on
   Bing/Google — covered by 1–2 — and (b) training crawls. Our `robots.txt`
   deliberately allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.
   Do not block them: being crawlable and being *linked from pages they trust*
   (see 4) is the whole strategy. `public/llms.txt` gives them a canonical
   plain-language summary to quote.

## Expectations

For a niche local query set — "swing dance stockholm", "lindy hop stockholm",
and on the Swedish side "socialdans stockholm", "swingdans stockholm",
"lindy hop stockholm ikväll" —
steps 1–3 typically get the site indexed within days and ranking within weeks;
AI assistants that use live search pick it up as soon as Bing/Google do.
Appearing in *training data* (so chatbots know the site without searching)
takes months and follows from the backlink work, not from anything in this
repo.
