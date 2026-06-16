---
name: generate
description: >-
  Produces background PNGs per product via OpenRouter image model or dry-run
  placeholders (Stage 5). Use after plan when creating or refreshing backgrounds.
---

# Generate background images

Call the OpenRouter image model (`OPENROUTER_IMAGE_MODEL`, default `google/gemini-2.5-flash-image`) with each product's background plan, or copy placeholder PNGs in dry-run mode.

## When to use

- After **plan**, before **composite**
- When the user wants new backgrounds without re-running copy/localize
- Use `--dry-run` to avoid image API cost during development

## Agent workflow

1. Confirm `background_plans` exists in pipeline state (run **plan** if empty).
2. For live runs: confirm `OPENROUTER_API_KEY` and `OPENROUTER_IMAGE_MODEL` in `.env`.
3. Run generate (with `--dry-run` if user wants zero image API spend).
4. Terminal logs each product → `outputs/backgrounds/[slug].png`.
5. On success, `background_paths` is updated. Proceed to **composite**.

## Command

```bash
npm run generate
npm run generate -- --dry-run   # copy placeholders from inputs/fixtures/
```

## Flags

| Flag | Description |
|------|-------------|
| `--dry-run` | Copy placeholder PNGs from `inputs/fixtures/` — no image API calls |

## Prerequisites

- `npm run plan` completed (`background_plans` in state)
- `OPENROUTER_API_KEY` set (live runs only)

## Inputs (from state)

- `background_plans[].prompt` — sent to the image model

## Outputs

- `outputs/backgrounds/[product-slug].png` — one per product
- `background_paths` map in pipeline state

## Approval gate

None — runs to completion automatically.

## Cost note

Live image generation incurs OpenRouter/Gemini charges. Prefer `--dry-run` or `npm run demo` for offline iteration.

## Troubleshooting

| Error | Fix |
|-------|-----|
| Background plans missing | Run `npm run plan` |
| HTTP 401 / API errors | Set valid keys or use `--dry-run` |
| Placeholder not found (dry-run) | Run `npm run placeholders` |

## Next stage

`npm run composite`
