import { test, expect } from '@playwright/test';
import { galleries } from './helpers/content';

const pages = ['/', '/portfolio', '/prices', ...galleries.map((g) => `/portfolio/${g.slug}`)];

test('lang="uk" на кожній сторінці', async ({ page }) => {
  for (const url of pages) {
    await page.goto(url);
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  }
});

test('title і description унікальні на кожній сторінці', async ({ page }) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();

  for (const url of pages) {
    await page.goto(url);
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content');

    expect(title.length, `${url}: порожній title`).toBeGreaterThan(0);
    expect(description?.length ?? 0, `${url}: порожній description`).toBeGreaterThan(0);

    expect(titles.has(title), `${url}: title «${title}» дублюється`).toBe(false);
    expect(descriptions.has(description ?? ''), `${url}: description дублюється`).toBe(false);

    titles.add(title);
    descriptions.add(description ?? '');
  }
});

test('og:image присутній на кожній сторінці', async ({ page }) => {
  for (const url of pages) {
    await page.goto(url);
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage?.length ?? 0, `${url}: og:image відсутній`).toBeGreaterThan(0);
  }
});

test('robots.txt доступний і посилається на sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain('Sitemap:');
});

test('sitemap-index.xml доступний', async ({ request }) => {
  const response = await request.get('/sitemap-index.xml');
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain('<sitemapindex');
});
