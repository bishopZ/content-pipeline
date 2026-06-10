import { writeFile } from 'fs/promises';
import { join } from 'path';
import { ensureDir } from '../utils/paths.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

type ImageResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type: string; image_url?: { url: string }; text?: string }>;
      images?: Array<{ image_url?: { url: string } }>;
    };
  }>;
  data?: Array<{ url?: string; b64_json?: string }>;
};

const getApiKey = () => {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('OPENROUTER_API_KEY is missing. Copy .env.example to .env and add your key.');
  }
  return key;
};

const imageModel = () => process.env.OPENROUTER_IMAGE_MODEL ?? 'google/gemini-2.5-flash-image';

const extractImageBuffer = async (data: ImageResponse): Promise<Buffer> => {
  const choice = data.choices?.[0]?.message;

  if (choice?.images?.[0]?.image_url?.url) {
    return fetchImageUrl(choice.images[0].image_url.url);
  }

  if (Array.isArray(choice?.content)) {
    for (const part of choice.content) {
      if (part.type === 'image_url' && part.image_url?.url) {
        return fetchImageUrl(part.image_url.url);
      }
    }
  }

  if (typeof choice?.content === 'string') {
    const b64Match = choice.content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
    if (b64Match) {
      return Buffer.from(b64Match[1], 'base64');
    }
    const urlMatch = choice.content.match(/https?:\/\/[^\s)"']+/);
    if (urlMatch) {
      return fetchImageUrl(urlMatch[0]);
    }
  }

  if (data.data?.[0]?.b64_json) {
    return Buffer.from(data.data[0].b64_json, 'base64');
  }

  if (data.data?.[0]?.url) {
    return fetchImageUrl(data.data[0].url);
  }

  throw new Error('Could not extract image from OpenRouter response. Check model and response format.');
};

const fetchImageUrl = async (url: string): Promise<Buffer> => {
  if (url.startsWith('data:image')) {
    const b64 = url.split(',')[1];
    return Buffer.from(b64, 'base64');
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download image: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export const generateBackgroundImage = async (
  prompt: string,
  outputPath: string,
  dryRun = false,
): Promise<string> => {
  await ensureDir(join(outputPath, '..'));

  if (dryRun) {
    const sharp = (await import('sharp')).default;
    const placeholder = await sharp({
      create: {
        width: 1080,
        height: 1080,
        channels: 3,
        background: { r: 45, g: 106, b: 79 },
      },
    })
      .png()
      .toBuffer();
    await writeFile(outputPath, placeholder);
    return outputPath;
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/bishopZ/content-pipeline',
      'X-Title': 'Harvest Lane Creative Pipeline',
    },
    body: JSON.stringify({
      model: imageModel(),
      messages: [
        {
          role: 'user',
          content: `Generate a photorealistic social ad background scene. No products, bottles, packaging, or text in the image.\n\n${prompt}`,
        },
      ],
      modalities: ['image', 'text'],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter image request failed (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as ImageResponse;
  const buffer = await extractImageBuffer(data);
  await writeFile(outputPath, buffer);
  return outputPath;
};
