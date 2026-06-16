---
name: copy
description: >-
  Generates English ad headlines and body copy via OpenRouter (Stage 2). Use after
  ingest when the user wants EN copy only, or as part of a staged pipeline walkthrough.
---

# Generate English copy

Call the OpenRouter text model to produce English headlines and body copy for each product in the brief.

## When to use

- After **ingest**, before **localize**
- When the user wants to review or regenerate EN copy only
- During a code walkthrough of individual stages

## Agent workflow

1. Confirm `outputs/.state/pipeline-state.json` exists (run **ingest** if not).
2. Confirm `.env` has `OPENROUTER_API_KEY` and `OPENROUTER_TEXT_MODEL` (or use **demo** / **pipeline --fixture** for offline copy).
3. Run copy. Terminal prints each product headline.
4. At the approval gate, wait for user confirmation unless `--auto` was requested.
5. On success, `copy_by_locale` gains an `en` entry. Proceed to **localize**.

## Command

```bash
npm run copy
npm run copy -- --auto   # skip approval prompt
```

## Flags

| Flag | Description |
|------|-------------|
| `--auto` | Skip the "Review EN copy" approval gate |

## Prerequisites

- `npm run ingest` completed
- `OPENROUTER_API_KEY` set in `.env` (live runs)

## Inputs (from state)

- `brief.message`, `brief.target_audience`, `brief.brand.tone`
- `brief.products[]` — name, description, features per product

## Outputs

- `copy_by_locale` updated with `{ locale: "en", products: [...] }` in pipeline state

## Approval gate

Terminal shows each product headline. Prompt: `Review EN copy above. Continue? [Y/n]`

- Default **Y** → saves and continues
- **n** → throws "Stopped by user at approval gate."
- `--auto` → logs "(auto — continuing)" and skips the prompt

## Fixture mode

Fixture copy is only loaded when running **pipeline** with `--fixture` (sets `PIPELINE_FIXTURE=1`). The standalone `copy` command always calls OpenRouter.

## Troubleshooting

| Error | Fix |
|-------|-----|
| No pipeline state | Run `npm run ingest` |
| HTTP 401 from OpenRouter | Set a valid `OPENROUTER_API_KEY`, or use `npm run demo` |
| User rejected gate | Re-run with edits to brief, or use `--auto` if approved |

## Next stage

`npm run localize`
