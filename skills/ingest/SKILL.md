# Ingest campaign brief

Validate the JSON campaign brief and initialize pipeline state.

## When to use

Start of every run, or after editing `inputs/briefs/campaign.json`.

## Command

```bash
npm run ingest -- --brief inputs/briefs/campaign.json
```

## Inputs

- `inputs/briefs/campaign.json` — campaign schema (≥2 products, locales, UTM block, legal disclaimer)
- `inputs/assets/` — logo, badge, product PNGs (transparent recommended)

## Outputs

- `outputs/.state/pipeline-state.json`

## Approval gate

Schema validation only — auto-pass.
