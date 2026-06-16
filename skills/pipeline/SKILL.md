---
name: pipeline
description: >-
  Runs all eight pipeline stages end-to-end with optional auto, dry-run, and fixture
  flags. Use for full campaign runs, demos, or when the user says "run the pipeline".
---

# Run full pipeline

Execute all stages in order with a live terminal checklist (Listr2 when `--auto`).

## When to use

- Full campaign run from brief to manifest/HTML
- Demo or video walkthrough of the staged architecture
- Offline zero-key run via **demo** skill

## Agent workflow

1. Confirm setup: `npm install`, `.env` copied from `.env.example` (live runs need `OPENROUTER_API_KEY`).
2. Choose run mode:

   | Goal | Command |
   |------|---------|
   | Offline demo, no API keys | `npm run demo` |
   | Full live run, unattended | `npm run pipeline -- --auto` |
   | Live run with approval gates | `npm run pipeline` (no `--auto`) |
   | Live copy/plans, placeholder images | `npm run pipeline -- --auto --dry-run` |
   | Custom brief path | `npm run pipeline -- --auto -b inputs/briefs/campaign.json` |

3. Run the command. With `--auto`, stages run as a single checklist; without it, each stage pauses at copy/localize/plan gates.
4. On success, confirm `outputs/campaign-manifest.json`, `outputs/campaign-report.html`, and 24 `final.png` files (default brief).
5. If verify fails, read error codes and re-run from the failing stage after fixes.

## Commands

```bash
# Recommended offline demo (no API keys)
npm run demo

# Equivalent explicit flags
npm run pipeline -- --auto --dry-run --fixture

# Live full run
npm run pipeline -- --auto

# Placeholder backgrounds, live OpenRouter text/image planning
npm run pipeline -- --auto --dry-run
```

## Flags

| Flag | Description |
|------|-------------|
| `--auto` | Skip human-in-the-loop gates (copy, localize, plan) |
| `--dry-run` | Placeholder backgrounds only — no image API spend |
| `--fixture` | Offline fixture copy and plans — no OpenRouter text calls |
| `-b, --brief <path>` | Campaign brief (default: `inputs/briefs/campaign.json`) |

Combine `--auto --dry-run --fixture` for the same behavior as `npm run demo`.

## Stages (in order)

| # | Stage | npm script | Approval gate |
|---|-------|------------|---------------|
| 1 | ingest | `ingest` | None |
| 2 | copy | `copy` | EN copy review |
| 3 | localize | `localize` | Localized copy review |
| 4 | plan | `plan` | Art direction review |
| 5 | generate | `generate` | None |
| 6 | composite | `composite` | None |
| 7 | verify | `verify` | Fails on errors |
| 8 | report | `report` | None |

Per-stage skills in `skills/` mirror each `npm run` command for staged walkthroughs.

## Prerequisites

- Node ≥ 20, dependencies installed
- Valid brief and assets (or use `npm run demo`)
- `.env` with OpenRouter keys for live runs (stages 2–5 without `--fixture`/`--dry-run`)

## Outputs

```
outputs/
├── backgrounds/
├── [product-slug]/[locale]/[ratio]/final.png
├── campaign-manifest.json
├── campaign-report.html
└── .state/pipeline-state.json
```

Default brief: **2 products × 4 locales × 3 ratios = 24 final PNGs**.

## Demo / presentation tip

Split screen: README on left, terminal on right. Run `npm run demo` and narrate modular stages plus governance gates. For live API narration, use `npm run pipeline -- --auto` with keys configured.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| HTTP 401 mid-pipeline | Use `npm run demo` or set `OPENROUTER_API_KEY` |
| Stopped at approval gate | Re-run with `--auto` or press Enter at prompt |
| Verify errors | Fix copy/rules; re-run from `copy` or `verify` |
| Missing logo warnings at ingest | `npm run placeholders` |

## Individual stages

To run one stage at a time, use the matching skill: **ingest** → **copy** → **localize** → **plan** → **generate** → **composite** → **verify** → **report**.
