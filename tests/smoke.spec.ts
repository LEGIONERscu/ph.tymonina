import { test, expect } from '@playwright/test';
import { galleries } from './helpers/content';

const staticPages = ['/', '/portfolio', '/prices'];
const categoryPages = galleries.map((g) => `/portfolio/${g.slug}`);

for (const url of [...staticPages, ...categoryPages]) {
  test(`${url}: відкривається без помилок у консолі`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    const response = await page.goto(url);
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('неіснуюча сторінка повертає 404', async ({ page }) => {
  const response = await page.goto('/ця-сторінка-не-існує');
  expect(response?.status()).toBe(404);
});

test('/admin/: адмінка Decap CMS відкривається без помилок у консолі', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  const response = await page.goto('/admin/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('button', { name: /login with github/i })).toBeVisible();
  expect(errors).toEqual([]);
});

test('мобільне меню: кнопка відкриває і закриває список посилань', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Кнопка-бургер показана лише на мобільних в’юпортах');

  await page.goto('/');
  const menuButton = page.getByTestId('menu-button');
  const navLinks = page.getByTestId('nav-links');

  await expect(navLinks).toBeHidden();
  await menuButton.click();
  await expect(navLinks).toBeVisible();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

  await navLinks.getByRole('link', { name: 'Прайс' }).click();
  await expect(page).toHaveURL('/prices');
});
