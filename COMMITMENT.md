# Pre-run commitment: Harbor Ledger Demo

**Pack `rec.bank-ledger.v1` · surface P01-PUBLIC · Role Exposure**

Published before the run it describes, so that the freeze can be checked by a third party
instead of taken on our word. Nothing here is edited after publication. A change is issued as a
new file that names this one as superseded.

## 1. Sample data

The fixture is a demonstration set: `Harbor Ledger Demo (SAMPLE, fictional desk)`. It contains
no institution's data and no personal data. Its composition is invented. Its structure
reproduces the kinds of discrepancy that arise in bank-to-ledger reconciliation, which is what
makes it usable for measurement, and it is offered on that basis alone.

## 2. What is frozen

Frozen under law 05 of the doctrine, which fixes tasks, rubric, fatal conditions and
eligibility rules before execution begins. Three further items are frozen at the same moment as
a matter of execution, not of law: the vintage of any list the pack draws on, any coverage
threshold, and the identity and version of the grader.

| Item | Identity | SHA-256 |
| --- | --- | --- |
| Runner | `run.mjs` | 9e076fe0ab33b8d46d283a1464d9c6bc3bee94575f9f22db0b0430f2e74fadda |
| Candidate | `matcher.js`, graded function `match()` | 2d3a9dc414c5a66362a555021a2fb7bd18a01ebb9f6008bac299c7cde90cb8ee |
| Grader | `rubric.js` | 9acd3d1239ab59cf8ac153936883bfb4e852258cf92e97e2d3df7616f175dc35 |
| Fixture | `data.js` | d4e95579cd0b896d5bc637705d12a871ee93bf7e66dd18a06f51cb269f3198e1 |
| Earlier run record | `runs/2026-08-19-self-asserted.json` | 7d13b03c6e2a32730e661f0a245cb2e042855eb22bd21ba5f96b9c5a38af0ce1 |
| Reference list vintage | *[list name and dated edition]* | n/a |
| Coverage threshold | Not applicable. This pack produces a task-level cell, not a role score. | n/a |

Truncated digests are not verifiable. Publish the full values.

## 3. Candidate and baseline

The candidate is a deterministic rules matcher. It is not a language model. The baseline is a
deterministic rules baseline matching on amount, date and exact reference.

The candidate for this run is the matcher as it stood on 19 August 2026, without reason codes.
A later version adds a reason code to every line that stays with the desk. That version is a
different candidate with a different digest, and it will be run separately under its own
commitment, whose expectation will be agreement on every line with a difference only in whether
the reason field is populated.

What this run tests is whether the measurement circuit executes and reproduces. It says nothing
about whether AI can reconcile a bank book, and no reading of that kind is supported.

## 3a. Decision thresholds and weights

Every number below moves the outcome, so every number is named here. All of them are already
present in the 19 August bytes of `matcher.js`; publishing the list adds no parameter and
changes no behaviour. It removes the possibility of explaining a future divergence by a value
nobody had declared.

| Parameter | Value | What it decides |
| --- | --- | --- |
| Exact-stage payee score | 0.84 | Auto-post on amount+date when payee or ref is not exact |
| Fuzzy-stage admit score | 0.28 | Admit a ledger line to the 3-day fuzzy stage, and to the partial stage |
| Ambiguity gap | 0.10 | If the top two fuzzy scores differ by less than this, do not post; suggest both |
| Fuzzy auto-post score | 0.78 | Posted versus suggested on one fuzzy candidate, unless payee is exact |
| Weak-payee floor | 0.22 | Drop many-to-one, fee-net, and FX suggestions below this score |
| Fuzzy and FX date window | 3 days | How far a ledger date may sit from the bank date in those stages |
| Split, combine, fee, and partial date window | 2 days | Same for one-to-many, many-to-one, fee-net, and partial |
| Fee difference, min | 50 cents | Below this, fee-net does not fire |
| Fee difference, max | 2500 cents | Above this, fee-net does not fire |
| Fee relative difference | 0.03 | Alternate fee-net admit: 3 percent of the larger amount |
| FX ratio, low | 0.85 | Bank to ledger amount ratio, floor |
| FX ratio, high | 1.30 | Bank to ledger amount ratio, ceiling |
| Partial cover, low | 0.35 | Bank must cover at least this share of one invoice |
| Partial cover, high | 0.80 | Bank must cover at most this share of one invoice |
| Payee score, containment weight | 0.92 | Weight inside pairScore; feeds every score above |
| Payee score, edit-distance weight | 0.55 | Weight inside pairScore; feeds every score above |

Some values apply at more than one stage and appear once. The fuzzy-stage admit score also
governs admission to the partial stage; the weak-payee floor applies to many-to-one, fee-net and
FX alike. The last two rows are weights inside the pair-scoring function, not gates. They decide
nothing on their own and feed every score above them, which is why omitting them would leave
the list incomplete.

There is no minimum-amount threshold in these bytes. A bank line is left unmatched when no
ledger line survives any stage, whatever the amount. That is why a wire of $4,999 and a card
payment of $22.50 fall in the same bucket.

## 3b. Payee dictionaries

Payee scoring normalises each name before comparison, using two dictionaries hard-coded in
`matcher.js`. They move the outcome exactly as the thresholds do, so they are listed in full.
Both are already in the 19 August bytes; naming them adds nothing and hides nothing.

Alias map, 29 entries. Twenty-four map a token to itself and are listed because they are in the
file. Five change the token: `payout` and `processor` to `psp`, `mktp` to `marketplace`,
`nthwind` to `northwind`, `pap` to `paper`.

| Token | Maps to | Token | Maps to | Token | Maps to |
| --- | --- | --- | --- | --- | --- |
| `psp` | `psp` | `transfer` | `transfer` | `payout` | `psp` |
| `processor` | `psp` | `cart` | `cart` | `mktp` | `marketplace` |
| `marketplace` | `marketplace` | `cloudco` | `cloudco` | `compute` | `compute` |
| `pos` | `pos` | `harbor` | `harbor` | `beans` | `beans` |
| `vendor` | `vendor` | `settlement` | `settlement` | `northwind` | `northwind` |
| `nthwind` | `northwind` | `pap` | `paper` | `paper` | `paper` |
| `ap` | `ap` | `quay` | `quay` | `print` | `print` |
| `atelier` | `atelier` | `nord` | `nord` | `quill` | `quill` |
| `wharf` | `wharf` | `ink` | `ink` | `storage` | `storage` |
| `backup` | `backup` | `cloudnine` | `cloudnine` |  |  |

Stop-words, removed before scoring: `inc`, `llc`, `llp`, `co`, `corp`, `ltd`, `the`, `ach`,
`wire`, `out`, `in`, `and`, `of`, `for`, `to`, `a`, `an`, `us`.

**What the aliases changed.** Two of the 21 postings exist because of this map. B15 scored 0.92
instead of 0.46 through `mktp` to `marketplace`; B31 scored 1.00 instead of 0.40 through
`nthwind` to `northwind` and `pap` to `paper`. Both crossed the exact-stage threshold of 0.84
and posted. In two further lines, B14 and B27, `payout` to `psp` raised the score without
changing the bucket.

**What that means for reading the result.** This map was written for this fixture. The tokens in
it are the tokens in `data.js`. On another book it would not fire, and those two postings would
stay with the desk. The dictionaries are frozen with the fixture and belong to it. No result
here transfers to any other data set, and this is the concrete form of that limit.

## 4. Gates and scoring, fixed before execution

A posting made where no correct counterpart exists is a fatal error. It fails the candidate
outright and is never offset by correct postings elsewhere.

A hold placed on an item the pack seeds as requiring judgement is scored as correct behaviour.

A proposed match is not a posting. It stays with the desk and counts toward the residual
exception rate.

Refusing to post across the whole file is not a passing result.

## 5. Expected result, recorded before execution

This run re-executes a pack executed on 19 August 2026 at 17:33 PT. That earlier record carries
a self-asserted timestamp and no external confirmation. Its figures appear below as a
prediction, so that agreement becomes a fact anyone can check instead of a claim we make about
ourselves.

| Measure | Expected |
| --- | --- |
| Bank lines / ledger lines | 36 / 33 |
| Posted | 21 |
| Proposed matches left with the desk | 9 |
| Holds on seeded judgement items | 2 of 2 |
| Bank lines with no counterpart proposed | 4 |
| Ledger lines unmatched | 1 of 33 |
| Residual exception rate, candidate | 42% (15 of 36) |
| Residual exception rate, baseline | 56% (20 of 36) |
| Postings in error | none observed |
| Verdict | works with controls |
| Readiness | requires integration |

Any departure from these figures is a finding. It will be published as one, and the divergence
will be stated before any explanation of it is offered.

## 6. Limits of this commitment

The digests fix the bytes. They say nothing about when those bytes came into existence, and
they cannot establish the date of the earlier execution, which no external timestamp records.

Freezing a file does not make it correct. It makes it identifiable.

Nothing here supports a conclusion about another fixture, another process, or any institution's
own data.

## 7. Publication and timestamping

This file, the manifest and the digests go to a public repository and are signed, so that the
time of publication is attested by a party other than Role Exposure. The verifiable history of
this pack starts there.

The freeze kit carries `.gitattributes` containing `* -text`. Git will not rewrite line endings,
and the published SHA-256 is of the bytes as stored. The 19 August files are not converted to
LF, so a clone hashes identically to the working copy.

*Issued before execution. Role Exposure, roleexposure.com*
