import { join } from 'path';
import { generateBackgroundImage } from '../../services/openrouter.js';
import { requireState, saveState } from '../state.js';
import { ensureDir, OUTPUT_DIR } from '../../utils/paths.js';

export const runGenerate = async (dryRun: boolean) => {
  const state = await requireState();
  if (!state.background_plans.length) {
    throw new Error('Background plans missing. Run `npm run plan` first.');
  }

  const bgDir = join(OUTPUT_DIR, 'backgrounds');
  await ensureDir(bgDir);

  for (const plan of state.background_plans) {
    const outputPath = join(bgDir, `${plan.slug}.png`);
    await generateBackgroundImage(plan.prompt, outputPath, dryRun);
    state.background_paths[plan.slug] = outputPath;
    console.log(`  • ${plan.slug} → ${outputPath}${dryRun ? ' (dry-run placeholder)' : ''}`);
  }

  await saveState(state);
  return state;
};
