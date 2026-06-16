---
name: composite
description: >-
  Composites final ad PNGs with Sharp — background, product, text, logo, badge
  (Stage 6). Use after generate when producing localized multi-ratio social ads.
---

# Composite final ads

Use Sharp to layer background, product hero, SVG text overlay (headline + body + legal disclaimer), logo, and optional badge for every product × locale × aspect ratio combination.

## When to use

- After **generate**, before **verify**
- When copy or backgrounds changed and finals need rebuilding
- Does not call OpenRouter — safe to re-run without API keys

## Agent workflow

1. Confirm state has `copy_by_locale`, `background_paths`, and product `hero_image_path` values.
2. Run composite (no flags).
3. Terminal reports count of composited assets (default campaign: 2 products × 4 locales × 3 ratios = **24** PNGs).
4. Spot-check a few outputs under `outputs/[slug]/[locale]/[ratio]/final.png`.
5. Proceed to **verify**.

## Command

```bash
npm run composite
```

## Flags

None.

## Prerequisites

- **copy** and **localize** completed (`copy_by_locale` populated)
- **generate** completed (`background_paths` per product slug)
- Hero images at paths in brief (`inputs/assets/...`)
- Logo at `brief.brand.logo_path`

## Inputs (from state + assets)

- Background PNG per product
- Product hero PNG, logo, optional badge
- Copy per locale; `legal_disclaimer` from brief (never LLM-generated)
- `aspect_ratios` from brief (`1:1`, `9:16`, `16:9`)

## Outputs

- `outputs/[product-slug]/[locale]/[folder]/final.png` per combination
  - `1:1` → `1x1` (1080×1080)
  - `9:16` → `9x16` (1080×1920)
  - `16:9` → `16x9` (1920×1080)
- `manifest[]` in pipeline state (24 rows for default brief)

## Text rendering notes

- ZH locale uses bundled Noto Sans CJK SC (`assets/fonts/`)
- AR locale renders LTR (known limitation — see README §5)

## Approval gate

None.

## Troubleshooting

| Error | Fix |
|-------|-----|
| Copy missing | Run copy → localize |
| Background missing for slug | Run `npm run generate` |
| Hero image path missing | Add `hero_image_path` to brief product, re-ingest |

## Next stage

`npm run verify`
