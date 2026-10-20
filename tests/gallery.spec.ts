import { test, expect, type Page } from '@playwright/test';
import { galleries } from './helpers/content';

async function pswpIndex(page: Page): Promise<number> {
  return page.evaluate(() => (window as any).__pswp.pswp.currIndex);
}

// Клавіатура/свайп у PhotoSwipe прив'язуються лише після завершення
// анімації відкриття — чекаємо прапорець готовності, а не фіксовану паузу.
async function waitForPswpReady(page: Page) {
  await page.waitForFunction(() => (window as any).__pswpReady === true);
}

// PhotoSwipe слухає Pointer Events (не touch), якщо браузер їх підтримує —
// тому свайп симулюємо через pointerdown/pointermove/pointerup на скрол-обгортці.
async function swipe(page: Page, startX: number, endX: number, y: number) {
  const target = '.pswp__scroll-wrap';
  const pointerInit = (clientX: number) => ({
    pointerId: 1,
    pointerType: 'touch',
    isPrimary: true,
    clientX,
    clientY: y,
  });
  await page.dispatchEvent(target, 'pointerdown', pointerInit(startX));
  for (let step = 1; step <= 6; step += 1) {
    const x = startX + ((endX - startX) * step) / 6;
    await page.dispatchEvent(target, 'pointermove', pointerInit(x));
  }
  await page.dispatchEvent(target, 'pointerup', pointerInit(endX));
}

for (const gallery of galleries) {
  test.describe(`Галерея «${gallery.title}»`, () => {
    test('сторінка категорії показує фото', async ({ page }) => {
      await page.goto(`/portfolio/${gallery.slug}`);
      await expect(page.getByTestId('gallery-item').first()).toBeVisible();
    });

    test('лайтбокс: відкриття, → вперед, ← назад, Esc закриває', async ({ page }) => {
      await page.goto(`/portfolio/${gallery.slug}`);
      await page.getByTestId('gallery-item').first().click();

      const lightbox = page.getByRole('dialog');
      await expect(lightbox).toBeVisible();
      await waitForPswpReady(page);

      const startIndex = await pswpIndex(page);
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => pswpIndex(page)).toBe(startIndex + 1);

      await page.keyboard.press('ArrowLeft');
      await expect.poll(() => pswpIndex(page)).toBe(startIndex);

      await page.keyboard.press('Escape');
      await expect(lightbox).toBeHidden();
    });

    test('свайп гортає фото на мобільному', async ({ page, isMobile, hasTouch }) => {
      test.skip(!isMobile || !hasTouch, 'Свайп перевіряємо лише на мобільних в’юпортах з touch');

      await page.goto(`/portfolio/${gallery.slug}`);
      await page.getByTestId('gallery-item').first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await waitForPswpReady(page);

      const startIndex = await pswpIndex(page);
      await swipe(page, 300, 40, 400);
      await expect.poll(() => pswpIndex(page)).toBe(startIndex + 1);
    });
  });
}
