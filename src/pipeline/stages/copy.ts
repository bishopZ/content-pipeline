import { generateEnglishCopy } from '../../services/openrouter.js';
import { demoEnglishCopy } from '../../fixtures/demo.js';
import { requireState, saveState } from '../state.js';
import { promptContinue } from '../../utils/gate.js';

export const runCopy = async (auto = false, fixture = false) => {
  const state = await requireState();
  if (!fixture) {
    console.log('  Calling OpenRouter for English copy...');
  }
  const products = fixture
    ? demoEnglishCopy.products
    : await generateEnglishCopy(state.brief);

  for (const item of products) {
    console.log(`  • ${item.slug}: ${item.headline}`);
  }

  await promptContinue('Review EN copy above. Continue?', auto);

  const existing = state.copy_by_locale.filter((c) => c.locale !== 'en');
  state.copy_by_locale = [{ locale: 'en', products }, ...existing];
  await saveState(state);
  return state;
};
