import Anthropic from '@anthropic-ai/sdk';
import { CampaignBrief, ProductCopy, BackgroundPlan } from '../types.js';

const getClient = () => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('ANTHROPIC_API_KEY is missing. Copy .env.example to .env and add your key.');
  }
  return new Anthropic({ apiKey: key });
};

const model = () => process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514';

const parseJson = <T>(text: string): T => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1]?.trim() ?? text.trim();
  return JSON.parse(raw) as T;
};

export const generateEnglishCopy = async (brief: CampaignBrief): Promise<ProductCopy[]> => {
  const client = getClient();
  const response = await client.messages.create({
    model: model(),
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are an FMCG social ad copywriter for ${brief.brand.name}.

Campaign message: ${brief.message}
Audience: ${brief.target_audience}
Brand tone: ${brief.brand.tone}

Write punchy ad copy for each product. Return JSON only:
{"products":[{"slug":"...","headline":"max 48 chars","body":"max 120 chars"}]}

Products:
${brief.products.map((p) => `- ${p.slug}: ${p.name} — ${p.description}`).join('\n')}`,
      },
    ],
  });

  const block = response.content.find((c) => c.type === 'text');
  if (!block || block.type !== 'text') {
    throw new Error('Anthropic returned no text for copy generation.');
  }

  const parsed = parseJson<{ products: ProductCopy[] }>(block.text);
  return parsed.products;
};

export const localizeCopy = async (
  brief: CampaignBrief,
  english: ProductCopy[],
  locale: string,
  localeLabel: string,
): Promise<ProductCopy[]> => {
  const client = getClient();
  const response = await client.messages.create({
    model: model(),
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Localize FMCG social ad copy for ${localeLabel} (${locale}) with cultural adaptation.
Keep slug values unchanged. Adapt idioms for the market; do not literal-translate slogans.

Campaign: ${brief.campaign_name}
Region context: ${brief.target_region}
Audience: ${brief.target_audience}

English copy:
${JSON.stringify(english, null, 2)}

Return JSON only:
{"products":[{"slug":"...","headline":"...","body":"..."}]}`,
      },
    ],
  });

  const block = response.content.find((c) => c.type === 'text');
  if (!block || block.type !== 'text') {
    throw new Error(`Anthropic returned no text for ${locale} localization.`);
  }

  const parsed = parseJson<{ products: ProductCopy[] }>(block.text);
  return parsed.products;
};

export const planBackgrounds = async (brief: CampaignBrief): Promise<BackgroundPlan[]> => {
  const client = getClient();
  const response = await client.messages.create({
    model: model(),
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `Art-direct background scenes for social ads. Do NOT mention product names, bottles, chips, drinks, or packaging in prompts — backgrounds only.

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
      },
    ],
  });

  const block = response.content.find((c) => c.type === 'text');
  if (!block || block.type !== 'text') {
    throw new Error('Anthropic returned no text for background planning.');
  }

  const parsed = parseJson<{ plans: BackgroundPlan[] }>(block.text);
  return parsed.plans;
};

export const reviewBrandVoice = async (
  brief: CampaignBrief,
  copyByLocale: Array<{ locale: string; products: ProductCopy[] }>,
): Promise<string[]> => {
  const client = getClient();
  const response = await client.messages.create({
    model: model(),
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Review ad copy for brand voice alignment with ${brief.brand.name}.
Tone: ${brief.brand.tone}

Return JSON only: {"warnings":["..."]} — empty array if none.

Copy:
${JSON.stringify(copyByLocale, null, 2)}`,
      },
    ],
  });

  const block = response.content.find((c) => c.type === 'text');
  if (!block || block.type !== 'text') {
    return [];
  }

  try {
    const parsed = parseJson<{ warnings: string[] }>(block.text);
    return parsed.warnings ?? [];
  } catch {
    return [];
  }
};
