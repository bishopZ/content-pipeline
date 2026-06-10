import { localizeCopy } from '../../services/openrouter.js';
import { demoLocalizedCopy } from '../../fixtures/demo.js';
import { requireState, saveState } from '../state.js';
import { loadLocalesConfig } from '../../utils/prompt.js';
import { promptContinue } from '../../utils/gate.js';

export const runLocalize = async (auto: boolean, fixture = false) => {
  const state = await requireState();

  if (fixture) {
    state.copy_by_locale = demoLocalizedCopy;
    await promptContinue('Review fixture localized copy. Continue?', auto);
    await saveState(state);
    return state;
  }

  const english = state.copy_by_locale.find((c) => c.locale === 'en');
  if (!english) {
    throw new Error('English copy missing. Run `npm run copy` first.');
  }

  const { locales } = loadLocalesConfig();
  const targets = state.brief.locales.filter((code) => code !== 'en');

  for (const code of targets) {
    const meta = locales.find((l) => l.code === code);
    const label = meta?.label ?? code;
    const products = await localizeCopy(state.brief, english.products, code, label);
    console.log(`  • ${code}: ${products.map((p) => p.headline).join(' | ')}`);

    const rest = state.copy_by_locale.filter((c) => c.locale !== code);
    state.copy_by_locale = [...rest, { locale: code, products }];
  }

  await promptContinue('Review localized copy samples above. Continue?', auto);
  await saveState(state);
  return state;
};
