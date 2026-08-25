# Harbor P01-PUBLIC — historical replay

Pack: `rec.bank-ledger.v1`
Fixture period: 2026-07-01 → 2026-07-31 (July 2026)
Shelf: PUBLIC SAMPLE. Not a bank. Not HOLDOUT.
Status: historical until a third-party re-execution is recorded under the preservation control.

## What sat

Not an LLM. No model id. No inference parameters.

- BASELINE: rules matcher — amount + same date + exact ref / exact payee (`matchBaseline` in `matcher.js`)
- CANDIDATE: rules matcher — date window, fuzzy payee, splits, fee-net, FX, holds (`match` in `matcher.js`)

Optional LLM stub in the lab README is unused. No key. No call.

Historical run: `runs/v1-harbor-ledger.json` · `when` 2026-08-20T00:33:35.918Z (19 Aug 2026 17:33 PT).

## Dependencies

Node.js 18+ (ESM). No npm packages. Files in one folder: `run.mjs`, `matcher.js`, `rubric.js`, `data.js`.

`rubric.js` is required. `run.mjs` imports it. A kit without it will not run.

## How to run

    node run.mjs

The fixture is imported from `data.js` (BANK + LEDGER). There is no separate upload step.

Writes `runs/v1-harbor-ledger.json` and `runs/latest.json`. A new `when` is stamped. Do not treat the new file as the historical artifact.

## What matcher does

`matchBaseline` and `match` pair bank lines to ledger lines. `compare` in `rubric.js` scores both runs. Hold of a disputed item is a pass. False post is fatal.

## Successful re-execution

Semantic, not byte-for-byte of the whole JSON.

Must match the historical `rubric.candidate.numbers`:

- postedN 21
- humanN 15
- bankN 36
- holdN 2 / holdsCorrect 2
- exactPrecision 1
- outcome works-with-controls
- readiness requires-integration

Posted / hold / unmatched id sets must match. The new `when` will differ. That is not a fail.

## Digests (SHA-256)

See `SHA256SUMS`.

## Label

The runner and matcher for the historical P01-PUBLIC surface are now published. Independent re-execution is possible. The result remains labelled historical until a third-party re-execution has been recorded under the preservation control.
