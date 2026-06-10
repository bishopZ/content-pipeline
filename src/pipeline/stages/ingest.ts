import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { campaignBriefSchema } from '../../types.js';
import { initState, saveState } from '../state.js';
import { fileExists, ROOT } from '../../utils/paths.js';

export const runIngest = async (briefPath: string) => {
  const absolute = resolve(ROOT, briefPath);
  const raw = await readFile(absolute, 'utf8');
  const parsed = campaignBriefSchema.parse(JSON.parse(raw));

  for (const product of parsed.products) {
    if (product.hero_image_path) {
      const exists = await fileExists(resolve(ROOT, product.hero_image_path));
      if (!exists) {
        console.warn(`  ⚠ Hero asset missing for ${product.slug}: ${product.hero_image_path}`);
      }
    }
  }

  const logoExists = await fileExists(resolve(ROOT, parsed.brand.logo_path));
  if (!logoExists) {
    console.warn(`  ⚠ Logo missing: ${parsed.brand.logo_path} — run npm run placeholders`);
  }

  const state = initState(briefPath, parsed);
  await saveState(state);
  return state;
};
