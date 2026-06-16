---
name: plan
description: >-
  Generates background art-direction prompts and mood palettes per product via
  OpenRouter (Stage 4). Use after localize when preparing image generation.
---

# Plan background art direction

Call the OpenRouter text model to produce a background prompt, mood label, and color palette for each product. Prompts intentionally omit product names to avoid interfering with generated imagery.

## When to use

- After **localize**, before **generate**
- When the user wants to review or tweak art direction before spending on image API calls

## Agent workflow

1. Confirm pipeline state has localized copy in `copy_by_locale`.
2. Confirm `.env` has `OPENROUTER_API_KEY` (or use **demo** for fixture plans).
3. Run plan. Terminal prints mood and a truncated prompt per product.
4. At the approval gate, wait for user unless `--auto`.
5. On success, `background_plans` is populated. Proceed to **generate**.

## Command

```bash
npm run plan
npm run plan -- --auto   # skip approval prompt
```

## Flags

| Flag | Description |
|------|-------------|
| `--auto` | Skip the art-direction review gate |

## Prerequisites

- Prior stages through **localize** (copy in state)
- `OPENROUTER_API_KEY` set (live runs)

## Inputs (from state)

- `brief.brand`, `brief.message`, product count and slugs (names excluded from image prompts)

## Outputs

- `background_plans[]` in pipeline state — `{ slug, prompt, mood, palette[] }` per product

## Approval gate

`Review background art direction. Continue? [Y/n]`

Use `--auto` for unattended runs.

## Fixture mode

Fixture plans load only via `npm run pipeline -- --fixture` (or `npm run demo`).

## Troubleshooting

| Error | Fix |
|-------|-----|
| No pipeline state | Run `npm run ingest` |
| HTTP 401 | Set `OPENROUTER_API_KEY` or use `npm run demo` |

## Next stage

`npm run generate` (add `--dry-run` to skip image API spend)
