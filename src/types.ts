import { z } from 'zod';

export const productSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  hero_image_path: z.string().optional(),
});

export const campaignBriefSchema = z.object({
  campaign_name: z.string(),
  campaign_id: z.string(),
  message: z.string(),
  target_region: z.string(),
  target_audience: z.string(),
  legal_disclaimer: z.string(),
  utm: z.object({
    source: z.string(),
    medium: z.string(),
    campaign: z.string(),
  }),
  brand: z.object({
    name: z.string(),
    tone: z.string(),
    logo_path: z.string(),
    badge_path: z.string().optional(),
    colors: z.array(z.string()),
  }),
  aspect_ratios: z.array(z.enum(['1:1', '9:16', '16:9'])),
  locales: z.array(z.string()),
  products: z.array(productSchema).min(2),
});

export type CampaignBrief = z.infer<typeof campaignBriefSchema>;
export type Product = z.infer<typeof productSchema>;

export type ProductCopy = {
  slug: string;
  headline: string;
  body: string;
};

export type LocaleCopy = {
  locale: string;
  products: ProductCopy[];
};

export type BackgroundPlan = {
  slug: string;
  prompt: string;
  mood: string;
  palette: string[];
};

export type ManifestEntry = {
  creative_id: string;
  product_slug: string;
  locale: string;
  aspect_ratio: string;
  file_path: string;
  utm_campaign: string;
  utm_source: string;
  utm_medium: string;
  utm_content: string;
  headline_hash: string;
  background_model: string;
  pipeline_version: string;
  approved_at: string;
};

export type VerifyIssue = {
  level: 'error' | 'warning';
  code: string;
  message: string;
  context?: string;
};

export type PipelineState = {
  version: string;
  brief_path: string;
  brief: CampaignBrief;
  copy_by_locale: LocaleCopy[];
  background_plans: BackgroundPlan[];
  background_paths: Record<string, string>;
  manifest: ManifestEntry[];
  verify_issues: VerifyIssue[];
  updated_at: string;
};

export const ASPECT_DIMENSIONS: Record<string, { width: number; height: number; folder: string }> = {
  '1:1': { width: 1080, height: 1080, folder: '1x1' },
  '9:16': { width: 1080, height: 1920, folder: '9x16' },
  '16:9': { width: 1920, height: 1080, folder: '16x9' },
};
