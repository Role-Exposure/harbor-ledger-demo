# Harbor P01-PUBLIC: historical replay

Display name: `Harbor Ledger Demo (SAMPLE, fictional desk)`
Pack: `rec.bank-ledger.v1`
Fixture period: 2026-07-01 to 2026-07-31 (July 2026)
Shelf: PUBLIC SAMPLE. Not a bank. Not HOLDOUT.
Status: historical until a third-party re-execution is recorded under the preservation control.

The freeze that preceded any re-execution is published in `COMMITMENT.md`, with the digests,
the sixteen decision thresholds and the two payee dictionaries.

## What sat

Not an LLM. No model id. No inference parameters.

- BASELINE: rules matcher, amount + same date + exact ref / exact payee (`matchBaseline` in `matcher.js`)
- CANDIDATE: rules matcher, date window, fuzzy payee, splits, fee-net, FX, holds (`match` in `matcher.js`)

Optional LLM stub in the lab README is unused. No key. No call.

Historical run: `runs/2026-08-19-self-asserted.json` · `when` 2026-08-20T00:33:35.918Z
(19 Aug 2026 17:33 PT). That timestamp is self-asserted and carries no external confirmation.

## Result

| Measure | Value |
| --- | --- |
| Posted | 21 of 36 bank lines |
| Remained with the desk | 15 of 36 |
| Ledger lines unmatched | 1 of 33 |
| Residual exception rate | 42% candidate, 56% baseline |
| Postings in error | none observed in 21 postings |
| Outcome | works-with-controls |
| Readiness | requires-integration |

The 15 left with the desk are three different costs of human work: 9 proposed matches awaiting
confirmation, 2 holds on seeded judgement items, and 4 bank lines with no counterpart proposed.
Confirming a proposal takes minutes. Investigating a line with no counterpart takes longer, and
there are four of those, 11% of the file.

Holding a disputed item is a pass under the rubric, and the 2 holds are still counted inside
the 42%. The exception rate runs conservative by construction.

Counted by value the picture is harder. The 21 postings carry 47.3% of the money in the file
against 58% of its lines, so the desk retains more than half the value while holding fewer than
half the lines. The four lines with no counterpart proposed are 11% of the file by count and
26.9% by value. Both measures appear here because a line count flatters the candidate and a
value count does not.

On `exactPrecision 1`: no false postings were observed. With no errors across 21 trials that is
consistent at 95% confidence with a true error rate of up to roughly 14%. The value of 1 is
used below as a reproduction check, not as a published claim about accuracy.

Against the baseline the candidate posted five more lines. The nine proposed matches do not
improve the same measure, since the baseline has no such category.

## What the payee dictionaries changed

Two of the 21 postings exist because of the alias map frozen in `matcher.js`. B15 scored 0.92
instead of 0.46 through `mktp` to `marketplace`; B31 scored 1.00 instead of 0.40 through
`nthwind` to `northwind` and `pap` to `paper`. Both crossed the exact-stage threshold of 0.84.
In B14 and B27, `payout` to `psp` raised the score without changing the bucket.

That map was written for this fixture. Its tokens are the tokens in `data.js`. On another book
it would not fire and those two postings would stay with the desk. Full list of aliases,
stop-words and thresholds: `COMMITMENT.md`.

## Dependencies

Node.js 18+ (ESM). No npm packages. Files in one folder: `run.mjs`, `matcher.js`, `rubric.js`,
`data.js`.

`rubric.js` is required. `run.mjs` imports it. A kit without it will not run.

## How to run

    node run.mjs

The fixture is imported from `data.js` (BANK + LEDGER). There is no separate upload step.

Writes `runs/v1-harbor-ledger.json` and `runs/latest.json`. A new `when` is stamped. Do not
treat either new file as the historical artifact: that one is `runs/2026-08-19-self-asserted.json`
and it is never overwritten.

## What matcher does

`matchBaseline` and `match` pair bank lines to ledger lines. `compare` in `rubric.js` scores
both runs. Hold of a disputed item is a pass. False post is fatal.

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

Any other divergence is a finding. It gets published as one, with the difference stated before
any explanation of it is offered.

## Digests (SHA-256)

See `SHA256SUMS`. Verify with:

    shasum -a 256 -c SHA256SUMS

## What this does not establish

The digests fix the released bytes. They do not fix the date those bytes came into existence,
and they do not confirm when the original execution happened. Verifiable history for this pack
begins at its first public commit.

Correctness of the fixture is not established here, and neither is any conclusion about a
different fixture, a different process, or an institution's own data.

This is not an audit. It produces no opinion under assurance standards. It measures one task
under stated conditions.

## Review status

Editorial review inside the project. No independent review has been performed. We state it here.
A reader should not have to infer it.

## Licence

Code and fixture: Apache License 2.0. Modified copies carry notice of modification, so that an
altered runner cannot circulate as this one.

The working paper `RE-WP-2026-01` is published separately under CC BY-ND 4.0 and falls outside
this licence. Role Exposure marks are reserved.

## Corrections

A correction creates a new dated record that supersedes the earlier one. Nothing here is edited
in place. Errors reported to eyal@roleexposure.com are published as corrections whether or not
they favour us.

## Label

The runner and matcher for the historical P01-PUBLIC surface are now published. Independent
re-execution is possible. The result remains labelled historical until a third-party
re-execution has been recorded under the preservation control.
