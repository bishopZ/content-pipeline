import { writeManifest, writeHtmlReport } from '../../report/html.js';
import { requireState } from '../state.js';

export const runReport = async () => {
  const state = await requireState();
  if (!state.manifest.length) {
    throw new Error('Manifest empty. Run `npm run composite` first.');
  }

  const manifestPath = await writeManifest(state);
  const reportPath = await writeHtmlReport(state);
  console.log(`  • Manifest: ${manifestPath}`);
  console.log(`  • Report: ${reportPath}`);
  return state;
};
