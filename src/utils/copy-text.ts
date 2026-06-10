import { ProductCopy } from '../types.js';

const EMOJI_PATTERN = /\p{Extended_Pictographic}/gu;
const EM_DASH = '\u2014';

export const stripEmojis = (text: string): string =>
  text
    .replace(EMOJI_PATTERN, '')
    .replace(/ {2,}/g, ' ')
    .trim();

export const containsEmDash = (text: string): boolean => text.includes(EM_DASH);

export const sanitizeProductCopy = (products: ProductCopy[]): ProductCopy[] =>
  products.map((product) => ({
    ...product,
    headline: stripEmojis(product.headline),
    body: stripEmojis(product.body),
  }));
