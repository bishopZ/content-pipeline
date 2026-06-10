# Run full pipeline

Execute all stages with a live terminal checklist (ideal for demo video).

## Command

```bash
npm run pipeline -- --auto
npm run pipeline -- --auto --dry-run   # placeholder backgrounds, no image API spend
```

## Stages (in order)

1. ingest → 2. copy → 3. localize → 4. plan → 5. generate → 6. composite → 7. verify → 8. report

## Demo video tip

Split screen: README on left, terminal on right. Run `npm run pipeline -- --auto` and narrate modular architecture + governance gates.
