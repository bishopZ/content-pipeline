import { resolve } from 'path';
import { reviewBrandVoice } from '../../services/openrouter.js';
import { requireState, saveState } from '../state.js';
import { containsEmDash } from '../../utils/copy-text.js';
import { loadBrandRules } from '../../utils/prompt.js';
import { fileExists, ROOT } from '../../utils/paths.js';
import { VerifyIssue } from '../../types.js';

export const runVerify = async () => {
  const state = await requireState();
  const rules = loadBrandRules();
  const issues: VerifyIssue[] = [];

  if (rules.legal_disclaimer_required && !state.brief.legal_disclaimer.trim()) {
    issues.push({
      level: 'error',
      code: 'LEGAL_MISSING',
      message: 'Legal disclaimer is required but empty in brief.',
    });
  }

  if (rules.required_logo) {
    const logoPath = resolve(ROOT, state.brief.brand.logo_path);
    if (!(await fileExists(logoPath))) {
      issues.push({
        level: 'error',
        code: 'LOGO_MISSING',
        message: `Logo file not found: ${state.brief.brand.logo_path}`,
      });
    }
  }

  for (const localeCopy of state.copy_by_locale) {
    for (const product of localeCopy.products) {
      if (product.headline.length > rules.max_headline_chars) {
        issues.push({
          level: 'warning',
          code: 'HEADLINE_LENGTH',
          message: `Headline exceeds ${rules.max_headline_chars} chars`,
          context: `${localeCopy.locale}/${product.slug}`,
        });
      }

      if (product.body.length > rules.max_body_chars) {
        issues.push({
          level: 'warning',
          code: 'BODY_LENGTH',
          message: `Body exceeds ${rules.max_body_chars} chars`,
          context: `${localeCopy.locale}/${product.slug}`,
        });
      }

      if (rules.no_em_dashes) {
        for (const [field, value] of [
          ['headline', product.headline],
          ['body', product.body],
        ] as const) {
          if (containsEmDash(value)) {
            issues.push({
              level: 'warning',
              code: 'EM_DASH',
              message: `Em dash not allowed in ${field}`,
              context: `${localeCopy.locale}/${product.slug}`,
            });
          }
        }
      }

      const haystack = `${product.headline} ${product.body}`.toLowerCase();
      for (const word of rules.prohibited_words) {
        if (haystack.includes(word.toLowerCase())) {
          issues.push({
            level: 'error',
            code: 'PROHIBITED_WORD',
            message: `Prohibited word "${word}" found`,
            context: `${localeCopy.locale}/${product.slug}`,
          });
        }
      }
    }
  }

  if (process.env.PIPELINE_FIXTURE !== '1') {
    const voiceWarnings = await reviewBrandVoice(state.brief, state.copy_by_locale);
    for (const warning of voiceWarnings) {
      issues.push({
        level: 'warning',
        code: 'BRAND_VOICE',
        message: warning,
      });
    }
  }

  state.verify_issues = issues;
  await saveState(state);

  const errors = issues.filter((i) => i.level === 'error');
  for (const issue of issues) {
    const icon = issue.level === 'error' ? '✗' : '⚠';
    console.log(`  ${icon} [${issue.code}] ${issue.message}${issue.context ? ` (${issue.context})` : ''}`);
  }

  if (errors.length) {
    throw new Error(`Verify failed with ${errors.length} error(s). Edit config/brand-rules.json or copy and re-run.`);
  }

  return state;
};
