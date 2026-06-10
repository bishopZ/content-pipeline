import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const ROOT = process.cwd();
const ASSETS = join(ROOT, 'inputs', 'assets');

const writePng = async (path: string, width: number, height: number, color: string, label: string) => {
  const svg = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="10%" y="15%" width="80%" height="70%" rx="24" fill="${color}"/>
    <text x="50%" y="54%" text-anchor="middle" fill="#ffffff" font-size="28" font-family="Arial">${label}</text>
  </svg>`);

  await sharp(svg).ensureAlpha().png().toFile(path);
};

const main = async () => {
  await mkdir(ASSETS, { recursive: true });

  await writePng(join(ASSETS, 'logo.png'), 240, 80, '#2D6A4F', 'Harvest Lane');
  await writePng(join(ASSETS, 'badge.png'), 120, 120, '#F4A261', 'NEW');
  await writePng(join(ASSETS, 'suncrisp-product.png'), 400, 520, '#E76F51', 'SunCrisp');
  await writePng(join(ASSETS, 'purepour-product.png'), 280, 640, '#2A9D8F', 'PurePour');

  console.log('Placeholder assets written to inputs/assets/');
};

main();
