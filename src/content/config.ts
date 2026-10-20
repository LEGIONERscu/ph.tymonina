import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const galleries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/galleries' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    order: z.number(),
    cover: z.string(),
    description: z.string().max(160),
    photos: z
      .array(
        z.object({
          file: z.string(),
          alt: z.string(),
        })
      )
      .optional(),
  }),
});

export const collections = { galleries };
