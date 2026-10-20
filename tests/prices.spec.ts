import { test, expect } from '@playwright/test';
import { prices } from './helpers/content';
import { formatPrice } from '../src/lib/format';

test('кількість карток прайсу відповідає prices.json', async ({ page }) => {
  await page.goto('/prices');
  await expect(page.getByTestId('price-card')).toHaveCount(prices.length);
});

for (const plan of prices) {
  test(`«${plan.title}»: ціна відформатована правильно`, async ({ page }) => {
    await page.goto('/prices');
    const expected = formatPrice({
      price: plan.price,
      currency: plan.currency,
      priceFrom: plan.priceFrom,
    });
    await expect(page.getByText(expected, { exact: true })).toBeVisible();
  });
}

test('назва пакета не ламає верстку (без горизонтального скролу)', async ({ page }) => {
  await page.goto('/prices');
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});
