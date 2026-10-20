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
 * Повертає фото категорії у порядку імен файлів (01.jpg, 02.jpg, …).
 * Якщо в .md є список `photos` з ручними alt — використовує їх,
 * інакше генерує alt за назвою категорії.
 */
export function getCategoryPhotos(
  slug: string,
  title: string,
  manual?: { file: string; alt: string }[]
): CategoryPhoto[] {
  const altByFile = new Map(manual?.map((p) => [p.file, p.alt]));

  return Object.entries(images)
    .filter(([filePath]) => filePath.includes(`/photos/${slug}/`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([filePath, mod], index) => {
      const file = filePath.split('/').pop()!;
      return {
        file,
        image: mod.default,
        alt: altByFile.get(file) ?? `${title} — фото ${index + 1}`,
      };
    });
}

export function getCoverImage(slug: string, cover: string): ImageMetadata | undefined {
  const entry = Object.entries(images).find(([filePath]) =>
    filePath.endsWith(`/photos/${slug}/${cover}`)
  );
  return entry?.[1].default;
}
