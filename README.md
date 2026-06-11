# Harvest Lane Creative Pipeline

Staged creative-automation CLI. Turns one a JSON brief into **localized, multi-ratio social ads** with human-in-the-loop governance, configurable compliance checks, and analytics-ready campaign metadata.

**2 products × 4 locales × 3 ratios = 24 final PNGs per run.**

---

## 1. Setup and prerequisites

**Requirements:** Node ≥ 20, npm ≥ 9.

```bash
git clone https://github.com/bishopZ/content-pipeline.git
cd content-pipeline
npm install
cp .env.example .env
```

Edit `.env` and add your OpenRouter key:

```
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_TEXT_MODEL=anthropic/claude-sonnet-4
OPENROUTER_IMAGE_MODEL=google/gemini-2.5-flash-image
```

---

## 2. Dry-run instructions

Run the full pipeline offline with no API keys.

```bash
npm run demo
```

This runs `pipeline --auto --dry-run --fixture`, which:

- Loads copy and background plans from fixture data (no OpenRouter calls)
- Skips image generation and copies placeholder PNGs from `inputs/fixtures/`
- Composites all 24 final PNGs via Sharp
- Writes `outputs/campaign-manifest.json` and `outputs/campaign-report.html`

Open `outputs/campaign-report.html` in any browser (no server required) to preview thumbnails and the manifest table.

For a live run with real API keys:

```bash
npm run pipeline -- --auto
```

Individual stages can be run in sequence for a code walkthrough:

```bash
npm run ingest
npm run copy       # pauses for review; use --auto to skip
npm run localize
npm run plan
npm run generate   # add --dry-run to skip image API
npm run composite
npm run verify
npm run report
```

---

## 3. Brief field descriptions

All campaign configuration lives in `inputs/briefs/campaign.json`. See `inputs/briefs/campaign.example.json` for a copy template.


| Field                        | Type     | Description                                                                          |
| ---------------------------- | -------- | ------------------------------------------------------------------------------------ |
| `campaign_name`              | string   | Human-readable campaign label (appears in HTML report title)                         |
| `campaign_id`                | string   | Machine-readable ID used in UTM and `creative_id` fields                             |
| `message`                    | string   | Core campaign message; given to LLM as brand direction                               |
| `target_region`              | string   | Geographic scope (e.g. `"multi"`, `"US"`)                                            |
| `target_audience`            | string   | Audience description used in copy prompts                                            |
| `legal_disclaimer`           | string   | Rendered verbatim on every composite — never LLM-generated (ADR-GAI-03)              |
| `utm.source`                 | string   | UTM source tag (e.g. `"meta"`)                                                       |
| `utm.medium`                 | string   | UTM medium tag (e.g. `"paid_social"`)                                                |
| `utm.campaign`               | string   | UTM campaign tag — usually matches `campaign_id`                                     |
| `brand.name`                 | string   | Brand name used in copy prompts                                                      |
| `brand.tone`                 | string   | Tone instruction for LLM copy generation                                             |
| `brand.logo_path`            | string   | Relative path to logo PNG (`inputs/assets/logo.png`)                                 |
| `brand.badge_path`           | string   | Optional promo badge PNG overlaid top-right                                          |
| `brand.colors`               | string[] | Hex palette used in brand-rules verification                                         |
| `aspect_ratios`              | string[] | Subset of `["1:1", "9:16", "16:9"]` — one composite per ratio per locale per product |
| `locales`                    | string[] | Subset of `["en", "fr", "zh", "ar"]` — Stage 3 generates copy for non-EN locales     |
| `products[].slug`            | string   | URL-safe slug; used in file paths and `creative_id`                                  |
| `products[].name`            | string   | Product display name passed to LLM copy prompts                                      |
| `products[].description`     | string   | Product description for copy context                                                 |
| `products[].features`        | string[] | Feature bullets passed to copy prompts                                               |
| `products[].hero_image_path` | string   | Optional path to product PNG (`inputs/assets/[slug]-product.png`)                    |


---

## 4. Pipeline stage descriptions

**Stage 1 — ingest (`npm run ingest`)**
Reads and validates the campaign brief JSON against a Zod schema. Initializes `outputs/.state.json` with the validated brief, blank copy arrays, and an empty manifest. Fails fast with a human-readable error if any required field is missing or malformed. All subsequent stages require a valid state file.

**Stage 2 — copy (`npm run copy`)**
Calls the OpenRouter text model to generate English ad headlines and body copy for each product. Uses the brief's `message`, `target_audience`, and `brand.tone` as context. When run without `--auto`, prints a preview of each headline and pauses for terminal approval before saving. In fixture mode, loads pre-written EN copy from `src/fixtures/demo.ts`.

**Stage 3 — localize (`npm run localize`)**
Calls the OpenRouter text model once per locale per product (FR, ZH, AR) to produce culturally adapted copy. Prompts include the EN headline as a reference and locale-specific cultural guidance. In fixture mode, loads pre-written locale copy from `src/fixtures/demo.ts`. Pauses for spot-check approval unless `--auto` is set.

**Stage 4 — plan (`npm run plan`)**
Calls the OpenRouter text model to generate a background art-direction prompt and mood palette for each product. Prompts intentionally omit product names to avoid interfering with generated imagery. Pauses for prompt review unless `--auto` is set.

**Stage 5 — generate (`npm run generate`)**
Calls the OpenRouter image model (`google/gemini-2.5-flash-image`) with each product's background plan to produce a background PNG per product. In `--dry-run` mode, copies placeholder PNGs from `inputs/fixtures/` without any API call. Saves resulting background paths to state.

**Stage 6 — composite (`npm run composite`)**
Uses Sharp to produce 24 final PNGs (2 products × 4 locales × 3 ratios). For each combination, layers: resized background, product hero PNG, SVG text overlay (headline + body + legal disclaimer), logo, and optional badge. Text rendering uses Noto Sans CJK SC (bundled OTF, `assets/fonts/`) for ZH locale. Writes all PNGs to `outputs/[product-slug]/[locale]/[ratio]/final.png` and saves the manifest to state.

**Stage 7 — verify (`npm run verify`)**
Checks all copy against `config/brand-rules.json`: prohibited word scan, legal disclaimer presence, logo file existence, headline/body character limits, and em-dash policy. In non-fixture mode, also calls the OpenRouter text model for a brand-voice review. Reports `error`-level violations (which block advancement) and `warning`-level issues. Edit `config/brand-rules.json` to tune rules without code changes.

**Stage 8 — report (`npm run report`)**
Writes two output files: `outputs/campaign-manifest.json` (24 rows, one per final PNG, with all UTM and `creative_id` fields) and `outputs/campaign-report.html` (self-contained HTML with base64-embedded 200px-wide thumbnails and a full manifest table). The HTML file opens in any browser without a server.

---

## 5. Known limitations

- **Arabic RTL layout** - AR locale composites render text left-to-right. Sharp's SVG renderer does not support full bidirectional text. Native Arabic readers will see incorrect layout (ADR-GAI-05).
- **CJK font bundled as OTF** - `assets/fonts/NotoSansCJKsc-Regular.otf` is committed to the repo (15.6 MB). This keeps setup zero-config but increases clone size. A production build would load the font from a CDN or system path.
- **No production DAM integration** - `inputs/assets/` is a local folder. S3, Azure Blob, Dropbox, and Workfront integrations are out of PoC scope.
- **Placeholder API keys produce errors, not silent empty output** - Running `npm run pipeline` without a real `OPENROUTER_API_KEY` throws an HTTP 401 from Stage 2 onward. Use `npm run demo` for zero-key offline runs.
- **No production test suite** - `tsc --noEmit` enforces type correctness. There are no unit tests for individual stage logic; manual verification steps are in the build log.
- **PoC pixel fidelity** - Compositing layers are functional but not pixel-perfect ad design. Layouts are not optimized for each ratio's platform-specific safe zone guidelines.
- `**--seed` flag not implemented** - `creative_id` hashes are deterministic per campaign+product+locale+ratio, but image generation does not pass a seed to the image model; repeated live runs may produce different backgrounds.

---

## Output layout

```
outputs/
├── backgrounds/
│   ├── suncrisp-chili-mango.png
│   └── purepour-coconut-electrolyte.png
├── suncrisp-chili-mango/
│   ├── en/1x1/final.png       (1080×1080)
│   ├── en/9x16/final.png      (1080×1920)
│   ├── en/16x9/final.png      (1920×1080)
│   ├── fr/  zh/  ar/          (same three ratios each)
│   └── ...
├── purepour-coconut-electrolyte/
│   └── ...  (same structure)
├── campaign-manifest.json     (24 rows)
├── campaign-report.html       (self-contained, base64 thumbnails)
└── .state/pipeline-state.json
```

## Compliance config

Edit `config/brand-rules.json` to adjust verification rules without code changes:

```json
{
  "prohibited_words": ["guaranteed", "miracle", "cure"],
  "required_logo": true,
  "brand_colors_hex": ["#2D6A4F", "#F4A261"],
  "legal_disclaimer_required": true,
  "no_em_dashes": true,
  "max_headline_chars": 48,
  "max_body_chars": 120
}
```

## Cursor / agent skills

`skills/` contains per-stage `SKILL.md` files for agent-native reruns in Cursor, Cowork, or Copilot.

## License

MIT