import { mkdir, access } from 'fs/promises';
import { join, resolve } from 'path';

export const ROOT = resolve(process.cwd());
export const OUTPUT_DIR = process.env.PIPELINE_OUTPUT_DIR ?? join(ROOT, 'outputs');
export const STATE_DIR = process.env.PIPELINE_STATE_DIR ?? join(OUTPUT_DIR, '.state');
export const STATE_FILE = join(STATE_DIR, 'pipeline-state.json');

export const ensureDir = async (dir: string) => {
  await mkdir(dir, { recursive: true });
};

export const fileExists = async (path: string) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

export const ratioFolder = (ratio: string) => ratio.replace(':', '_');
