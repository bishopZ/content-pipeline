import { createHash } from 'crypto';

export const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex').slice(0, 12);

export const creativeId = (
  campaignId: string,
  productSlug: string,
  locale: string,
  ratio: string,
) => {
  const ratioCode = ratio.replace(':', 'x');
  const fourCharHash = sha256(campaignId + productSlug + locale + ratio).slice(0, 4);
  return `hl-${productSlug}-${locale}-${ratioCode}-${fourCharHash}`;
};
