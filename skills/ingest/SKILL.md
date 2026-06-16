---
name: ingest
description: >-
  Validates the campaign brief JSON and initializes pipeline state (Stage 1).
  Use when starting a new run, after editing inputs/briefs/campaign.json, or when
  pipeline state is missing or stale.
---

# Ingest campaign brief

Validate the JSON campaign brief against the Zod schema and initialize `outputs/.state/pipeline-state.json`.

## When to use

- Start of every pipeline run
- After editing `inputs/briefs/campaign.json`
- When another stage fails with "No pipeline state found. Run `npm run ingest` first."

## Agent workflow

1. Confirm `inputs/briefs/campaign.json` exists (copy from `inputs/briefs/campaign.example.json` if needed).
2. Confirm `inputs/assets/` has logo and product hero PNGs referenced in the brief.
3. Run ingest.
4. On success, state file is created with empty `copy_by_locale`, `background_plans`, and `manifest`.
5. Proceed to **copy** (or **pipeline** for a full run).

## Command

```bash
npm run ingest
npm run ingest -- --brief inputs/briefs/campaign.json
```

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `-b, --brief <path>` | `inputs/briefs/campaign.json` | Path to campaign JSON |

## Prerequisites

- Node ≥ 20, `npm install` completed
- Valid campaign brief (≥2 products, locales, UTM block, legal disclaimer)

## Inputs

- `inputs/briefs/campaign.json` — campaign schema (see README §3 or `campaign.example.json`)
- `inputs/assets/` — logo (`brand.logo_path`), optional badge, product hero PNGs

## Outputs

- `outputs/.state/pipeline-state.json` — validated brief plus empty stage arrays

## Validation behavior

- Zod schema parse fails fast with a human-readable error on malformed briefs
- Missing hero images → warning (does not block)
- Missing logo → warning suggesting `npm run placeholders`

## Approval gate

None — schema validation only, auto-pass.

## Troubleshooting

| Error | Fix |
|-------|-----|
| Zod validation error | Compare brief to `inputs/briefs/campaign.example.json` |
| Logo missing warning | Run `npm run placeholders` or add `inputs/assets/logo.png` |

## Next stage

`npm run copy` or `npm run pipeline -- --auto`
