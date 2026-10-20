// Тимчасовий скрипт: генерує заглушки-фото (кольорові прямокутники з підписом),
// щоб перевірити галерею/тести, поки нема реальних фото від Ірини.
// Запуск: npm run generate-placeholders
// Видалити категорію/фото просто — видали відповідну папку в src/assets/photos.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const categories = [
  { slug: 'vesillia', label: 'Весілля', color: { r: 196, g: 164, b: 132 }, count: 6 },
  { slug: 'khrestyny', label: 'Хрестини', color: { r: 168, g: 196, b: 180 }, count: 6 },
];

const WIDTH = 1600;
const HEIGHT = 1067;

// OG-картинка для соцмереж (заглушка — заміни на реальне фото пізніше)
const ogSvg = Buffer.from(`
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#242424" />
    <text x="50%" y="50%" font-size="64" font-family="sans-serif" fill="white"
      text-anchor="middle" dominant-baseline="middle">Ірина Тимоніна — фотограф</text>
  </svg>
`);
await sharp(ogSvg).jpeg({ quality: 80 }).toFile('public/og-image.jpg');
console.log('створено public/og-image.jpg');

for (const category of categories) {
  const dir = path.join('src/assets/photos', category.slug);
  await mkdir(dir, { recursive: true });

  for (let i = 1; i <= category.count; i += 1) {
    const file = path.join(dir, `${String(i).padStart(2, '0')}.jpg`);
    const svg = Buffer.from(`
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="rgb(${category.color.r},${category.color.g},${category.color.b})" />
        <text x="50%" y="50%" font-size="72" font-family="sans-serif" fill="white"
          text-anchor="middle" dominant-baseline="middle">${category.label} ${i}</text>
      </svg>
    `);

    await sharp(svg).jpeg({ quality: 80 }).toFile(file);
    console.log(`створено ${file}`);
  }
}
