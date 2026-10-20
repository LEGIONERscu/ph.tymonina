import { test, expect } from '@playwright/test';
import { readdirSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';
import exifr from 'exifr';

const MAX_DIST_IMAGE_BYTES = 1024 * 1024; // 1 МБ
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

test('немає фото більших за 1 МБ у dist/', async () => {
  const distDir = path.join(process.cwd(), 'dist');
  const oversized = walk(distDir)
    .filter((file) => IMAGE_EXT.test(file))
    .map((file) => ({ file, size: statSync(file).size }))
    .filter(({ size }) => size > MAX_DIST_IMAGE_BYTES);

  expect(oversized, JSON.stringify(oversized, null, 2)).toEqual([]);
});

test('немає GPS у EXIF вихідних фото', async () => {
  const photosDir = path.join(process.cwd(), 'src/assets/photos');
  const files = walk(photosDir).filter((file) => IMAGE_EXT.test(file));

  const withGps: string[] = [];
  for (const file of files) {
    const exif = await exifr.parse(readFileSync(file), { gps: true });
    if (exif?.latitude || exif?.longitude) {
      withGps.push(file);
    }
  }

  expect(withGps, `Фото з GPS в EXIF: ${withGps.join(', ')}`).toEqual([]);
});
