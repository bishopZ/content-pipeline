import { planBackgrounds } from '../../services/openrouter.js';
import { demoBackgroundPlans } from '../../fixtures/demo.js';
import { requireState, saveState } from '../state.js';
import { promptContinue } from '../../utils/gate.js';

export const runPlan = async (auto: boolean, fixture = false) => {
  const state = await requireState();
  if (!fixture) {
    console.log('  Calling OpenRouter for background art direction...');
  }
  const plans = fixture ? demoBackgroundPlans : await planBackgrounds(state.brief);

  for (const plan of plans) {
    console.log(`  • ${plan.slug}: ${plan.mood}`);
    console.log(`    ${plan.prompt.slice(0, 100)}...`);
  }

  await promptContinue('Review background art direction. Continue?', auto);
  state.background_plans = plans;
  await saveState(state);
  return state;
};
