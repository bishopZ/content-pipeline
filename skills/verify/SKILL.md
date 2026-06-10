# Verify brand and legal compliance

Run deterministic checks from `config/brand-rules.json` plus optional OpenRouter brand-voice review.

## Command

```bash
npm run verify
```

## Config (user-editable)

Edit `config/brand-rules.json`:

- `prohibited_words` — block list
- `required_logo` — fail if logo file missing
- `brand_colors_hex` — reference palette
- `legal_disclaimer_required` — require brief disclaimer
- `max_headline_chars` / `max_body_chars`

## Outputs

- `verify_issues` in pipeline state
- Blocks pipeline on **error** level issues
