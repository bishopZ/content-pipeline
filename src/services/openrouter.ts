import { writeFile } from 'fs/promises';
import { join } from 'path';
import { ensureDir } from '../utils/paths.js';
import { sanitizeProductCopy } from '../utils/copy-text.js';
import { BackgroundPlan, CampaignBrief, ProductCopy } from '../types.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

type ChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

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

const textModel = () => process.env.OPENROUTER_TEXT_MODEL ?? 'anthropic/claude-sonnet-4';

const imageModel = () => process.env.OPENROUTER_IMAGE_MODEL ?? 'google/gemini-2.5-flash-image';

const openRouterHeaders = () => ({
  Authorization: `Bearer ${getApiKey()}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://github.com/bishopZ/content-pipeline',
  'X-Title': 'Harvest Lane Creative Pipeline',
});

const parseJson = <T>(text: string): T => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1]?.trim() ?? text.trim();
  return JSON.parse(raw) as T;
};

const completeText = async (prompt: string, maxTokens = 1024): Promise<string> => {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: openRouterHeaders(),
    body: JSON.stringify({
      model: textModel(),
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter text request failed (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as ChatResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenRouter returned no text content.');
  }

  return content;
};

export const generateEnglishCopy = async (brief: CampaignBrief): Promise<ProductCopy[]> => {
  const text = await completeText(`You are an FMCG social ad copywriter for ${brief.brand.name}.

Campaign message: ${brief.message}
Audience: ${brief.target_audience}
Brand tone: ${brief.brand.tone}

Write punchy ad copy for each product. Rules:
- No emojis
- No em dashes (use commas or periods instead)

Return JSON only:
{"products":[{"slug":"...","headline":"max 48 chars","body":"max 120 chars"}]}

Products:
${brief.products.map((p) => `- ${p.slug}: ${p.name} — ${p.description}`).join('\n')}`);

  const parsed = parseJson<{ products: ProductCopy[] }>(text);
  return sanitizeProductCopy(parsed.products);
};

export const localizeCopy = async (
  brief: CampaignBrief,
  english: ProductCopy[],
  locale: string,
  localeLabel: string,
): Promise<ProductCopy[]> => {
  const text = await completeText(`Localize FMCG social ad copy for ${localeLabel} (${locale}) with cultural adaptation.
Keep slug values unchanged. Adapt idioms for the market; do not literal-translate slogans.
No emojis. No em dashes (use commas or periods instead).

Campaign: ${brief.campaign_name}
Region context: ${brief.target_region}
Audience: ${brief.target_audience}

English copy:
${JSON.stringify(english, null, 2)}

Return JSON only:
{"products":[{"slug":"...","headline":"...","body":"..."}]}`);

  const parsed = parseJson<{ products: ProductCopy[] }>(text);
  return sanitizeProductCopy(parsed.products);
};

export const planBackgrounds = async (brief: CampaignBrief): Promise<BackgroundPlan[]> => {
  const text = await completeText(
    `Art-direct background scenes for social ads. Do NOT mention product names, bottles, chips, drinks, or packaging in prompts — backgrounds only.

Brand: ${brief.brand.name}
Campaign: ${brief.message}
Audience: ${brief.target_audience}
Region: ${brief.target_region}
Brand colors: ${brief.brand.colors.join(', ')}

For each product slug, return mood, palette, and an image-generation prompt (no product objects in scene).

Return JSON only:
{"plans":[{"slug":"...","mood":"...","palette":["#hex"],"prompt":"..."}]}

Products (for thematic direction only — do not name them in prompt):
${brief.products.map((p) => `- ${p.slug}: ${p.description}`).join('\n')}`,
    1500,
  );

  const parsed = parseJson<{ plans: BackgroundPlan[] }>(text);
  return parsed.plans;
};

export const reviewBrandVoice = async (
  brief: CampaignBrief,
  copyByLocale: Array<{ locale: string; products: ProductCopy[] }>,
): Promise<string[]> => {
  try {
    const text = await completeText(
      `Review ad copy for brand voice alignment with ${brief.brand.name}.
Tone: ${brief.brand.tone}
Brand rules: no emojis; no em dashes in headline or body (flag any em dash usage).

Return JSON only: {"warnings":["..."]} — empty array if none.

Copy:
${JSON.stringify(copyByLocale, null, 2)}`,
      512,
    );

    const parsed = parseJson<{ warnings: string[] }>(text);
    return parsed.warnings ?? [];
  } catch {
    return [];
  }
};

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
    headers: openRouterHeaders(),
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
