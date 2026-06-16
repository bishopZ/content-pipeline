---
name: localize
description: >-
  Adapts English copy for non-EN locales (FR, ZH, AR) via OpenRouter with cultural
  context (Stage 3). Use after copy when generating localized headlines and body text.
---

# Localize ad copy

Adapt English copy for each non-EN locale in the brief using OpenRouter with locale-specific cultural guidance.

## When to use

- After **copy**, before **plan**
- When the user wants to regenerate or spot-check localized copy
- When adding a new locale to the brief (re-run ingest, then copy, then localize)

## Agent workflow

1. Confirm pipeline state has English copy (`copy_by_locale` with `locale: "en"`).
2. Confirm `.env` has `OPENROUTER_API_KEY` (or use **demo** for fixture copy).
3. Run localize. Terminal prints sample headlines per locale as each completes.
4. At the approval gate, wait for user unless `--auto`.
5. On success, `copy_by_locale` contains all brief locales. Proceed to **plan**.

## Command

```bash
npm run localize
npm run localize -- --auto   # skip approval prompt
```

## Flags

| Flag | Description |
|------|-------------|
| `--auto` | Skip the localized copy review gate |

## Prerequisites

- `npm run copy` completed (English copy in state)
- `OPENROUTER_API_KEY` set (live runs)

## Inputs (from state)

- English `copy_by_locale` entry — headlines used as reference
- `brief.locales` — only non-`en` codes are translated (e.g. `fr`, `zh`, `ar`)
- Locale metadata from `config/locales.json` (labels, cultural notes)

## Outputs

- `copy_by_locale` extended with one entry per target locale in pipeline state

## Approval gate

After all locales: `Review localized copy samples above. Continue? [Y/n]`

Use `--auto` for unattended runs.

## Fixture mode

Fixture localized copy loads only via `npm run pipeline -- --fixture` (or `npm run demo`). Standalone `localize` always calls OpenRouter.

## Troubleshooting

| Error | Fix |
|-------|-----|
| English copy missing | Run `npm run copy` first |
| HTTP 401 | Set `OPENROUTER_API_KEY` or use `npm run demo` |
| Wrong locale set | Edit `brief.locales`, re-run **ingest**, then copy → localize |

## Next stage

`npm run plan`
