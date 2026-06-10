import { writeFile } from 'fs/promises';
import { join } from 'path';
import { PipelineState } from '../types.js';
import { OUTPUT_DIR } from '../utils/paths.js';

export const writeManifest = async (state: PipelineState) => {
  const manifestPath = join(OUTPUT_DIR, 'campaign-manifest.json');
  await writeFile(manifestPath, JSON.stringify(state.manifest, null, 2));
  return manifestPath;
};

export const writeHtmlReport = async (state: PipelineState) => {
  const rows = state.manifest
    .map(
      (entry) => `
    <tr>
      <td><img src="../${entry.file_path}" alt="${entry.creative_id}" width="120" /></td>
      <td><code>${entry.creative_id}</code></td>
      <td>${entry.product_slug}</td>
      <td>${entry.locale}</td>
      <td>${entry.aspect_ratio}</td>
      <td><code>${entry.utm_content}</code></td>
      <td><code>${entry.headline_hash}</code></td>
    </tr>`,
    )
    .join('');

  const verifyRows = state.verify_issues
    .map(
      (issue) =>
        `<tr><td>${issue.level}</td><td>${issue.code}</td><td>${issue.message}</td><td>${issue.context ?? ''}</td></tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${state.brief.campaign_name} — Campaign Report</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; background: #f8f9fa; color: #1d3557; }
    h1, h2 { color: #2d6a4f; }
    table { border-collapse: collapse; width: 100%; background: #fff; margin-bottom: 2rem; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; vertical-align: top; font-size: 0.9rem; }
    th { background: #e9ecef; text-align: left; }
    code { font-size: 0.8rem; }
  </style>
</head>
<body>
  <h1>${state.brief.campaign_name}</h1>
  <p><strong>Campaign ID:</strong> ${state.brief.campaign_id} · <strong>Assets:</strong> ${state.manifest.length}</p>
  <h2>Creative manifest</h2>
  <table>
    <thead>
      <tr><th>Preview</th><th>Creative ID</th><th>Product</th><th>Locale</th><th>Ratio</th><th>UTM Content</th><th>Headline hash</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <h2>Verification</h2>
  <table>
    <thead><tr><th>Level</th><th>Code</th><th>Message</th><th>Context</th></tr></thead>
    <tbody>${verifyRows || '<tr><td colspan="4">No issues</td></tr>'}</tbody>
  </table>
</body>
</html>`;

  const reportPath = join(OUTPUT_DIR, 'campaign-report.html');
  await writeFile(reportPath, html);
  return reportPath;
};
