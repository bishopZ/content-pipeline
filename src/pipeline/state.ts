import { readFile, writeFile } from 'fs/promises';
import { CampaignBrief, PipelineState } from '../types.js';
import { ensureDir, STATE_DIR, STATE_FILE } from '../utils/paths.js';

const VERSION = '1.0.0';

export const loadState = async (): Promise<PipelineState | null> => {
  try {
    const raw = await readFile(STATE_FILE, 'utf8');
    return JSON.parse(raw) as PipelineState;
  } catch {
    return null;
  }
};

export const requireState = async (): Promise<PipelineState> => {
  const state = await loadState();
  if (!state) {
    throw new Error('No pipeline state found. Run `npm run ingest` first.');
  }
  return state;
};

export const saveState = async (state: PipelineState) => {
  await ensureDir(STATE_DIR);
  state.updated_at = new Date().toISOString();
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
};

export const initState = (briefPath: string, brief: CampaignBrief): PipelineState => ({
  version: VERSION,
  brief_path: briefPath,
  brief,
  copy_by_locale: [],
  background_plans: [],
  background_paths: {},
  manifest: [],
  verify_issues: [],
  updated_at: new Date().toISOString(),
});
