import sharp from 'sharp';
import { readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { ASPECT_DIMENSIONS } from '../types.js';
import { loadLocalesConfig } from '../utils/prompt.js';
import { ROOT } from '../utils/paths.js';

type CompositeInput = {
  backgroundPath: string;
  productPath: string;
  logoPath: string;
  badgePath?: string;
  headline: string;
  body: string;
  legal: string;
  locale: string;
  aspectRatio: string;
  brandColors: string[];
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const textOverlaySvg = (
  width: number,
  height: number,
  headline: string,
  body: string,
  legal: string,
  rtl: boolean,
  accent: string,
) => {
  const anchor = rtl ? 'end' : 'start';
  const headlineX = rtl ? width - 48 : 48;
  const bodyX = rtl ? width - 48 : 48;
  const legalX = rtl ? width - 48 : 48;

  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="55%" stop-color="rgba(0,0,0,0.15)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.55)"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#fade)"/>
  <text x="${headlineX}" y="${height - 220}" fill="#ffffff" font-size="42" font-weight="700" font-family="Arial, Helvetica, sans-serif" text-anchor="${anchor}">${escapeXml(headline)}</text>
  <text x="${bodyX}" y="${height - 160}" fill="${accent}" font-size="26" font-family="Arial, Helvetica, sans-serif" text-anchor="${anchor}">${escapeXml(body)}</text>
  <text x="${legalX}" y="${height - 48}" fill="#dddddd" font-size="14" font-family="Arial, Helvetica, sans-serif" text-anchor="${anchor}">${escapeXml(legal)}</text>
</svg>`);
};

const productScale = (ratio: string, productWidth: number, productHeight: number) => {
  const dims = ASPECT_DIMENSIONS[ratio];
  const maxW = dims.width * (ratio === '9:16' ? 0.55 : 0.45);
  const maxH = dims.height * 0.42;
  const scale = Math.min(maxW / productWidth, maxH / productHeight);
  return Math.max(scale, 0.2);
};

export const compositeAd = async (input: CompositeInput, outputPath: string) => {
  const dims = ASPECT_DIMENSIONS[input.aspectRatio];
  const { locales } = loadLocalesConfig();
  const localeMeta = locales.find((l) => l.code === input.locale);
  const rtl = localeMeta?.rtl ?? false;
  const accent = input.brandColors[1] ?? '#F4A261';

  const background = await sharp(input.backgroundPath)
    .resize(dims.width, dims.height, { fit: 'cover' })
    .toBuffer();

  const productMeta = await sharp(input.productPath).metadata();
  const scale = productScale(
    input.aspectRatio,
    productMeta.width ?? 400,
    productMeta.height ?? 400,
  );
  const productW = Math.round((productMeta.width ?? 400) * scale);
  const productH = Math.round((productMeta.height ?? 400) * scale);

  const product = await sharp(input.productPath)
    .resize(productW, productH, { fit: 'inside' })
    .toBuffer();

  const productLeft = Math.round((dims.width - productW) / 2);
  const productTop = Math.round(dims.height * 0.12);

  const logoMeta = await sharp(input.logoPath).metadata();
  const logoW = 120;
  const logoH = Math.round(((logoMeta.height ?? 40) / (logoMeta.width ?? 120)) * logoW);
  const logo = await sharp(input.logoPath).resize(logoW, logoH).toBuffer();

  const layers: sharp.OverlayOptions[] = [
    { input: product, left: productLeft, top: productTop },
    { input: logo, left: 36, top: 36 },
    {
      input: textOverlaySvg(
        dims.width,
        dims.height,
        input.headline,
        input.body,
        input.legal,
        rtl,
        accent,
      ),
      top: 0,
      left: 0,
    },
  ];

  if (input.badgePath) {
    const badge = await sharp(input.badgePath).resize(100, 100).toBuffer();
    layers.push({ input: badge, left: dims.width - 136, top: 36 });
  }

  await sharp(background)
    .composite(layers)
    .png()
    .toFile(outputPath);
};

export const resolveAsset = (relativePath: string) => resolve(ROOT, relativePath);
