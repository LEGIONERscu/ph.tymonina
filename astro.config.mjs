import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Cloudflare Pages задає CF_PAGES_URL автоматично під час збірки —
// тому тут не треба хардкодити домен.
const site = process.env.CF_PAGES_URL || 'http://localhost:4321';

export default defineConfig({
  site,
  integrations: [sitemap()],
});
