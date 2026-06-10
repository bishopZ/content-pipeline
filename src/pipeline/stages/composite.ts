import { join } from 'path';
import { compositeAd, resolveAsset } from '../../composite/renderer.js';
import { requireState, saveState } from '../state.js';
import { ASPECT_DIMENSIONS, ManifestEntry } from '../../types.js';
import { creativeId, sha256 } from '../../utils/hash.js';
import { ensureDir, OUTPUT_DIR } from '../../utils/paths.js';

const PIPELINE_VERSION = '1.0.0';

export const runComposite = async () => {
  const state = await requireState();
  if (!state.copy_by_locale.length) {
    throw new Error('Copy missing. Run copy and localize first.');
  }

  const manifest: ManifestEntry[] = [];
  const imageModel = process.env.OPENROUTER_IMAGE_MODEL ?? 'google/gemini-2.5-flash-image';
  const now = new Date().toISOString();

  for (const localeCopy of state.copy_by_locale) {
    for (const product of localeCopy.products) {
      const briefProduct = state.brief.products.find((p) => p.slug === product.slug);
      if (!briefProduct?.hero_image_path) {
        throw new Error(`Hero image path missing for ${product.slug}`);
      }

      const backgroundPath = state.background_paths[product.slug];
      if (!backgroundPath) {
        throw new Error(`Background missing for ${product.slug}. Run generate first.`);
      }

      for (const ratio of state.brief.aspect_ratios) {
        const folder = ASPECT_DIMENSIONS[ratio].folder;
        const outDir = join(OUTPUT_DIR, product.slug, localeCopy.locale, folder);
        await ensureDir(outDir);
        const outFile = join(outDir, 'campaign.png');

        await compositeAd(
          {
            backgroundPath,
            productPath: resolveAsset(briefProduct.hero_image_path),
            logoPath: resolveAsset(state.brief.brand.logo_path),
            badgePath: state.brief.brand.badge_path
              ? resolveAsset(state.brief.brand.badge_path)
              : undefined,
            headline: product.headline,
            body: product.body,
            legal: state.brief.legal_disclaimer,
            locale: localeCopy.locale,
            aspectRatio: ratio,
            brandColors: state.brief.brand.colors,
          },
          outFile,
        );

        const relPath = outFile.replace(`${process.cwd()}/`, '');
        const utmContent = `${product.slug}_${localeCopy.locale}_${ratio.replace(':', 'x')}`;

        manifest.push({
          creative_id: creativeId(
            state.brief.campaign_id,
            product.slug,
            localeCopy.locale,
            ratio,
          ),
          product_slug: product.slug,
          locale: localeCopy.locale,
          aspect_ratio: ratio,
          file_path: relPath,
          utm_campaign: state.brief.utm.campaign,
          utm_source: state.brief.utm.source,
          utm_medium: state.brief.utm.medium,
          utm_content: utmContent,
          headline_hash: sha256(product.headline),
          background_model: imageModel,
          pipeline_version: PIPELINE_VERSION,
          approved_at: now,
        });
      }
    }
  }

  state.manifest = manifest;
  await saveState(state);
  console.log(`  • Composited ${manifest.length} assets`);
  return state;
};
