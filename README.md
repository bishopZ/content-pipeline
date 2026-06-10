# Harvest Lane Creative Pipeline

Staged creative-automation CLI for the Adobe FDE take-home exercise. Turns one FMCG JSON brief into **localized, multi-ratio social ads** with human-in-the-loop governance, configurable compliance checks, and analytics-ready campaign metadata.

**Thesis:** Surface pain is speed and volume; the root cause is missing **modular content architecture**. This PoC models brief-as-data → copy module → locale variants → swappable backgrounds → deterministic compositing → UTM manifest.

## Quick start

```bash
git clone https://github.com/bishopZ/content-pipeline.git
cd content-pipeline
npm install
cp .env.example .env
# Add OPENROUTER_API_KEY to .env

npm run placeholders          # create demo product/logo PNGs
npm run pipeline -- --auto    # full run with live checklist
npm run demo                  # offline demo (no API keys): fixture copy + dry-run backgrounds
```

**Demo video (owner):** Record `npm run pipeline -- --auto` with README visible. Placeholder link: _TBD — Bishop records separately._

## Staged workflow

| Command | Stage | API | Approval gate |
|---|---|---|---|
| `npm run ingest` | Validate brief + assets | — | auto |
| `npm run copy` | English ad copy | OpenRouter | preview headlines |
| `npm run localize` | FR, ZH, AR copy | OpenRouter | spot-check samples |
| `npm run plan` | Background art direction | OpenRouter | review prompts |
| `npm run generate` | Background images | OpenRouter Gemini | — |
| `npm run composite` | Layer ads (24 files) | Sharp | auto |
| `npm run verify` | Brand + legal checks | rules + OpenRouter | blocks on errors |
| `npm run report` | Manifest + HTML | — | auto |
| `npm run pipeline -- --auto` | All stages | OpenRouter | `--auto` skips prompts |

Use `--dry-run` on `generate` or `pipeline` to create placeholder backgrounds without image API spend:

```bash
npm run pipeline -- --auto --dry-run
```

## API setup (step-by-step)

### 1. Create `.env`

```bash
cp .env.example .env
```

Never commit `.env`.

### 2. OpenRouter (all LLM calls)

1. Use your existing [OpenRouter](https://openrouter.ai) account
2. Create an API key
3. Add to `.env`:

```
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_TEXT_MODEL=anthropic/claude-sonnet-4
OPENROUTER_IMAGE_MODEL=google/gemini-2.5-flash-image
```

### 3. Validate before spending

```bash
npm run ingest
npm run copy -- --auto    # confirms OpenRouter text model
npm run generate -- --dry-run   # confirms compositing path without image cost
```

**Cost estimate:** ~4 background images + ~10 OpenRouter text calls per full run.

## Input format

See `inputs/briefs/campaign.json`. Required fields:

- `campaign_name`, `campaign_id`, `message`
- `target_region`, `target_audience`
- `legal_disclaimer` — rendered verbatim on every asset (not LLM-generated)
- `utm` — `source`, `medium`, `campaign`
- `brand` — `name`, `tone`, `logo_path`, `colors`
- `products` — ≥2 items with `slug`, `name`, `description`, optional `hero_image_path`
- `aspect_ratios` — `["1:1", "9:16", "16:9"]`
- `locales` — `["en", "fr", "zh", "ar"]`

Copy `inputs/briefs/campaign.example.json` as a template.

## Asset preparation

Place transparent PNGs in `inputs/assets/`:

| File | Purpose |
|---|---|
| `logo.png` | Brand logo (RGBA) |
| `badge.png` | Promo bug (optional) |
| `suncrisp-product.png` | Product cutout |
| `purepour-product.png` | Product cutout |

Run `npm run placeholders` to generate simple demo assets.

## Output layout

```
outputs/
├── backgrounds/
│   ├── suncrisp-chili-mango.png
│   └── purepour-coconut-electrolyte.png
├── suncrisp-chili-mango/
│   ├── en/1_1/campaign.png
│   ├── en/9_16/campaign.png
│   ├── fr/...
│   └── ar/...
├── purepour-coconut-electrolyte/
│   └── ...
├── campaign-manifest.json
├── campaign-report.html
└── .state/pipeline-state.json
```

**Volume:** 2 products × 4 locales × 3 ratios = **24 PNG files**

## Trackability (proving ROI)

Each manifest row includes:

- `creative_id` — stable ID for analytics joins
- `utm_campaign`, `utm_source`, `utm_medium`, `utm_content`
- `headline_hash` — tie creative text to performance
- `background_model`, `pipeline_version`, `approved_at`

Pipe `utm_content` + `creative_id` into your existing stack to compare modular automation vs manual baselines. Good analytics fails when variants lack metadata, not when dashboards are missing.

## Compliance config

Edit `config/brand-rules.json` to match client requirements:

```json
{
  "prohibited_words": ["guaranteed", "miracle", "cure"],
  "required_logo": true,
  "brand_colors_hex": ["#2D6A4F", "#F4A261"],
  "legal_disclaimer_required": true,
  "max_headline_chars": 48,
  "max_body_chars": 120
}
```

Re-run `npm run verify` after edits — no code changes required.

## Design decisions

| Choice | Rationale |
|---|---|
| **Staged CLI** vs one-shot | Human-in-the-loop gates for enterprise credibility; `--auto` for fast demo |
| **OpenRouter** for all LLM calls | Single API key; text + image models via one gateway |
| **OpenRouter Gemini** for images | No separate GCP/OpenAI setup for background generation |
| **Sharp + SVG text** | Deterministic overlays; no hallucinated packaging |
| **Separate background layer** | README2 pattern — planner omits product nouns from prompts |
| **Legal verbatim from brief** | README1 pattern — compliance not LLM-generated |
| **Local `outputs/`** | Matches successful candidates; cloud storage documented as extension |

## Cursor / agent skills

`skills/` contains per-stage `SKILL.md` files for agent-native reruns in Cursor, Cowork, or Copilot.

## Production extensions (out of PoC scope)

- Swap `outputs/` for S3, Azure Blob, or Dropbox SDK
- DAM integration for asset discovery
- RASCI approval routing to regional stakeholders
- DCO optimizer feeding manifest performance back into copy/scene modules

## Assumptions and limitations

- **PoC scope** — pipeline proof, not pixel-perfect design
- **Arabic RTL** — simplified text alignment; not full bidi layout engine
- **API billing** — OpenRouter charges apply
- **Assignment inputs** — brief and assets are self-authored (not supplied by Adobe)

## License

MIT
