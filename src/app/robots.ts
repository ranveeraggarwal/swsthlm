import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Everything on the site is public and we *want* it crawled — by search
// engines and by AI assistants' crawlers (GPTBot, ClaudeBot, PerplexityBot,
// etc. all match the wildcard rule). Do not add per-bot blocks here.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
