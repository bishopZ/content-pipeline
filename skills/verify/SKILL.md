---
name: verify
description: >-
  Runs brand and legal compliance checks from config/brand-rules.json plus optional
  OpenRouter brand-voice review (Stage 7). Use after composite before publishing outputs.
---

# Verify brand and legal compliance

Run deterministic checks from `config/brand-rules.json` on all localized copy, plus an optional OpenRouter brand-voice review (skipped in fixture/demo mode).

## When to use

- After **composite**, before **report**
- When the user edits `config/brand-rules.json` and wants to re-check
- When copy was manually edited in state and needs re-validation

## Agent workflow

1. Confirm `copy_by_locale` and composited assets exist.
2. Optionally review `config/brand-rules.json` with the user.
3. Run verify.
4. Read terminal output: `✗` = error (blocks), `⚠` = warning (logged, does not block).
5. On success (zero errors), proceed to **report**. On failure, fix copy or rules and re-run from **copy** or **verify**.

## Command

```bash
npm run verify
```

## Flags

None.

## Config (user-editable)

Edit `config/brand-rules.json`:

| Field | Effect |
|-------|--------|
| `prohibited_words` | **error** if any word appears in headline or body |
| `required_logo` | **error** if logo file missing |
| `legal_disclaimer_required` | **error** if brief disclaimer empty |
| `brand_colors_hex` | Reference palette (used in voice review context) |
| `no_em_dashes` | **warning** if copy contains em dashes (—) |
| `max_headline_chars` | **warning** if headline too long |
| `max_body_chars` | **warning** if body too long |

## Prerequisites

- **composite** completed (copy in state)
- Logo file present if `required_logo: true`

## Outputs

- `verify_issues[]` in pipeline state
- Terminal listing of each issue with `[CODE]` and optional `locale/slug` context

## Issue levels

| Level | Pipeline impact |
|-------|-----------------|
| `error` | Throws — pipeline stops; fix and re-run |
| `warning` | Logged only; verify still passes |

## Error codes

- `LEGAL_MISSING`, `LOGO_MISSING`, `PROHIBITED_WORD` — errors
- `HEADLINE_LENGTH`, `BODY_LENGTH`, `EM_DASH`, `BRAND_VOICE` — warnings

## Approval gate

None — errors fail the stage automatically.

## Fixture mode

Brand-voice LLM review is skipped when `PIPELINE_FIXTURE=1` (demo runs).

## Troubleshooting

| Error | Fix |
|-------|-----|
| Verify failed with N error(s) | Read codes in output; edit copy or `brand-rules.json`, re-run copy/localize or verify |
| LOGO_MISSING | Add logo or run `npm run placeholders` |
| PROHIBITED_WORD | Regenerate copy or remove word from `prohibited_words` list |

## Next stage

`npm run report`
