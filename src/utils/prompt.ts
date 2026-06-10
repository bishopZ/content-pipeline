import { readFileSync } from 'fs';
import { join } from 'path';
import { ROOT } from './paths.js';

export const loadBrandRules = () => {
  const raw = readFileSync(join(ROOT, 'config', 'brand-rules.json'), 'utf8');
  return JSON.parse(raw) as {
    prohibited_words: string[];
    required_logo: boolean;
    brand_colors_hex: string[];
    legal_disclaimer_required: boolean;
    no_em_dashes: boolean;
    max_headline_chars: number;
    max_body_chars: number;
  };
};

export const loadLocalesConfig = () => {
  const raw = readFileSync(join(ROOT, 'config', 'locales.json'), 'utf8');
  return JSON.parse(raw) as {
    locales: Array<{ code: string; label: string; rtl: boolean }>;
  };
};
