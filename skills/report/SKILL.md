---
name: report
description: >-
  Writes campaign-manifest.json and self-contained campaign-report.html with
  embedded thumbnails (Stage 8). Use after verify to deliver analytics-ready outputs.
---

# Build campaign manifest and HTML report

Write analytics-ready manifest JSON and a self-contained HTML report with base64-embedded thumbnails. No server required to preview.

## When to use

- After **verify** passes — final stage of the pipeline
- When the user wants to refresh the manifest/HTML after compositing
- To preview deliverables: open `outputs/campaign-report.html` in a browser

## Agent workflow

1. Confirm `manifest` in pipeline state is non-empty (run **composite** if empty).
2. Run report.
3. Confirm terminal paths for manifest and HTML.
4. Tell the user to open `outputs/campaign-report.html` locally (file:// or drag into browser).
5. Optionally summarize manifest row count and sample `creative_id` / UTM fields.

## Command

```bash
npm run report
```

## Flags

None.

## Prerequisites

- `npm run composite` completed (`manifest` populated in state)
- Verify recommended but not enforced by this stage

## Outputs

| File | Description |
|------|-------------|
| `outputs/campaign-manifest.json` | One row per final PNG — `creative_id`, UTM fields, `headline_hash`, model metadata |
| `outputs/campaign-report.html` | Self-contained HTML with 200px-wide base64 thumbnails and full manifest table |

## Manifest fields (per row)

- `creative_id` — deterministic hash of campaign + product + locale + ratio
- `utm_campaign`, `utm_source`, `utm_medium`, `utm_content`
- `file_path`, `aspect_ratio`, `locale`, `product_slug`
- `background_model`, `pipeline_version`, `approved_at`

## Approval gate

None.

## Troubleshooting

| Error | Fix |
|-------|-----|
| Manifest empty | Run `npm run composite` |
| Thumbnails missing in HTML | Confirm `final.png` files exist at paths in manifest |

## Next stage

Pipeline complete. For a new campaign, edit the brief and run **ingest** again.
