import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

// Тести читають контент напряму з файлів — без Astro/сервера,
// щоб список категорій/прайсу підхоплювався автоматично (CLAUDE.md, розділ 8).
// Парсер навмисно простий: лише пласкі string/number поля в лапках чи без —
// повний YAML (списки, вкладеність) зараз не потрібен.

const GALLERIES_DIR = path.join(process.cwd(), 'src/content/galleries');
const PRICES_FILE = path.join(process.cwd(), 'src/content/prices.json');

export interface Gallery {
  title: string;
  slug: string;
  order: number;
  cover: string;
  description: string;
}

export interface PricePlan {
  id: string;
  title: string;
  price: number;
  currency: string;
  priceFrom?: boolean;
  duration: string;
  includes: string[];
  note?: string;
  category: string;
}

function parseFrontmatter(raw: string): Record<string, string> {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error('Не знайдено frontmatter у .md файлі галереї');

  const fields: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const lineMatch = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (!lineMatch) continue;
    const [, key, rawValue] = lineMatch;
    fields[key] = rawValue.trim().replace(/^"(.*)"$/, '$1');
  }
  return fields;
}

export const galleries: Gallery[] = readdirSync(GALLERIES_DIR)
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const raw = readFileSync(path.join(GALLERIES_DIR, file), 'utf-8');
    const fields = parseFrontmatter(raw);
    return {
      title: fields.title,
      slug: fields.slug,
      order: Number(fields.order),
      cover: fields.cover,
      description: fields.description,
    };
  })
  .sort((a, b) => a.order - b.order);

export const prices: PricePlan[] = JSON.parse(readFileSync(PRICES_FILE, 'utf-8'));
