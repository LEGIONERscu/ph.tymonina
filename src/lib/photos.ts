import type { ImageMetadata } from 'astro';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/photos/**/*.{jpeg,jpg,png}',
  { eager: true }
);

export interface CategoryPhoto {
  file: string;
  image: ImageMetadata;
  alt: string;
}

/**
 * Повертає фото категорії.
 * Якщо в .md є список `photos` (адмінка: порядок і підписи) — порядок і alt
 * беруться звідти (решта незгаданих файлів додається в кінець за алфавітом).
 * Якщо список порожній — усі фото за алфавітом імені файлу з авто-alt.
 * `photos[].file` може бути як голим ім'ям файлу, так і повним шляхом
 * (саме так Decap CMS записує значення image-поля).
 */
export function getCategoryPhotos(
  slug: string,
  title: string,
  manual?: { file: string; alt: string }[]
): CategoryPhoto[] {
  const files = Object.entries(images)
    .filter(([filePath]) => filePath.includes(`/photos/${slug}/`))
    .sort(([a], [b]) => a.localeCompare(b));

  const byFileName = new Map(files.map(([filePath, mod]) => [filePath.split('/').pop()!, mod]));

  if (!manual || manual.length === 0) {
    return files.map(([filePath, mod], index) => ({
      file: filePath.split('/').pop()!,
      image: mod.default,
      alt: `${title} — фото ${index + 1}`,
    }));
  }

  const ordered: CategoryPhoto[] = [];
  const mentioned = new Set<string>();

  for (const entry of manual) {
    const file = entry.file.split('/').pop()!;
    const mod = byFileName.get(file);
    if (!mod) continue; // файл ще не завантажений / видалений — пропускаємо
    mentioned.add(file);
    ordered.push({ file, image: mod.default, alt: entry.alt });
  }

  const rest = files
    .filter(([filePath]) => !mentioned.has(filePath.split('/').pop()!))
    .map(([filePath, mod], index) => ({
      file: filePath.split('/').pop()!,
      image: mod.default,
      alt: `${title} — фото ${ordered.length + index + 1}`,
    }));

  return [...ordered, ...rest];
}

export function getCoverImage(slug: string, cover: string): ImageMetadata | undefined {
  const entry = Object.entries(images).find(([filePath]) =>
    filePath.endsWith(`/photos/${slug}/${cover}`)
  );
  return entry?.[1].default;
}

/**
 * Пошук фото за повним шляхом від кореня проєкту (напр. "/src/assets/photos/about/portrait.jpg") —
 * саме так Decap CMS записує значення image-поля в site.json.
 */
export function getPhotoByPath(path: string): ImageMetadata | undefined {
  return images[path]?.default;
}
