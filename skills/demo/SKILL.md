---
name: demo
description: >-
  Runs the full pipeline offline with fixture copy, placeholder backgrounds, and no
  OpenRouter API calls. Use when the user wants a dry demo, has no API key, or asks
  to "run demo".
---

# Run offline demo

Zero API key, zero OpenRouter spend. Loads fixture copy and background plans, copies placeholder PNGs, composites all finals, verifies, and writes manifest/HTML.

## When to use

- First-time setup verification after `npm install`
- No `OPENROUTER_API_KEY` available
- README walkthrough or demo video
- CI or agent smoke test of the compositing/report path

## Agent workflow

1. Confirm `npm install` completed (no `.env` required, but copying `.env.example` is fine).
2. Run demo — single command, fully unattended.
3. On success, verify outputs exist:
   - `outputs/campaign-report.html` — open in browser
   - `outputs/campaign-manifest.json` — 24 rows
   - `outputs/*/en/1x1/final.png` (and other locale/ratio paths)
4. Point the user to `outputs/campaign-report.html` for visual preview.

## Command

```bash
npm run demo
```

Equivalent to:

```bash
npm run pipeline -- --auto --dry-run --fixture
```

## What demo skips

| Stage | Demo behavior |
|-------|---------------|
| copy | Loads EN copy from `src/fixtures/demo.ts` |
| localize | Loads FR/ZH/AR fixture copy |
| plan | Loads fixture background plans |
| generate | Copies placeholders from `inputs/fixtures/` |
| verify | Skips OpenRouter brand-voice review (`PIPELINE_FIXTURE=1`) |

## Flags

Demo is a fixed npm script — no additional flags. For partial offline behavior, use **pipeline** with `--fixture` and/or `--dry-run` separately.

## Prerequisites

- Node ≥ 20, `npm install`
- Default brief at `inputs/briefs/campaign.json` (or change via pipeline `-b`)
- Placeholder assets in `inputs/fixtures/` and `inputs/assets/`

## Outputs

Same layout as a full pipeline run — see **pipeline** skill. Expect **24** `final.png` files for the default campaign.

## Approval gate

None — `--auto` is implicit.

## Troubleshooting

| Error | Fix |
|-------|-----|
| Placeholder PNG missing | Run `npm run placeholders` |
| Brief validation failed | Compare to `inputs/briefs/campaign.example.json` |
| Composite hero missing | Ensure product PNGs exist under `inputs/assets/` |

## Next step

For a live run with real copy and images: configure `.env` and run `npm run pipeline -- --auto`.
