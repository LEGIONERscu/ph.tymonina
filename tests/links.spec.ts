import { test, expect } from '@playwright/test';

const patterns: Record<string, RegExp> = {
  Telegram: /^https:\/\/t\.me\/.+/,
  Viber: /^viber:\/\/.+/,
  Instagram: /^https:\/\/instagram\.com\/.+/,
  Телефон: /^tel:\+380\d{9}$/,
};

test('посилання на месенджери та телефон мають коректний формат', async ({ page }) => {
  await page.goto('/');

  // ContactLinks використовується і у великій секції контактів, і у футері —
  // перевіряємо перший блок, дані в обох однакові (один компонент).
  for (const [label, pattern] of Object.entries(patterns)) {
    const link = page.getByTestId('contact-links').first().getByRole('link', { name: label });
    const href = await link.getAttribute('href');
    expect(href, `${label}: href відсутній`).not.toBeNull();
    expect(href, `${label}: href не відповідає формату ${pattern}`).toMatch(pattern);
  }
});
