import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { galleries } from './helpers/content';

const pages = ['/', '/portfolio', '/prices', ...galleries.map((g) => `/portfolio/${g.slug}`)];

for (const url of pages) {
  test(`${url}: 0 critical/serious порушень доступності`, async ({ page }) => {
    await page.goto(url);
    const results = await new AxeBuilder({ page }).analyze();
    const severe = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(severe, JSON.stringify(severe, null, 2)).toEqual([]);
  });

  test(`${url}: усі <img> мають непорожній alt`, async ({ page }) => {
    await page.goto(url);
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i += 1) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt, `зображення #${i} на ${url} без alt`).not.toBeNull();
      expect(alt?.trim().length ?? 0, `зображення #${i} на ${url} має порожній alt`).toBeGreaterThan(0);
    }
  });
}
