import { createHash } from 'crypto';

export const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex').slice(0, 12);

export const creativeId = (
  campaignId: string,
  productSlug: string,
  locale: string,
  ratio: string,
) => {
  const base = `${campaignId}-${productSlug}-${locale}-${ratio.replace(':', 'x')}`;
  return `${base}-${sha256(base)}`;
};
