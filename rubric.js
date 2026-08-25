/* Two axes, computed from the run. Do not hardcode a vibe. Do not forecast.
   Test outcome (what this run proved):
     works               — passed the test
     works-with-controls — works with a human or constraints
     failed              — failed the current test
     untested            — no data
   Readiness (separate axis, not a forecast):
     deployable-now
     requires-integration
     research-stage
   Holding a disputed item is a correct result. */

const MATERIAL_CENTS = 100000; /* $1,000 */
const MESSY = new Set(["fuzzy", "offset", "fee", "fx", "split", "many-one", "partial", "duplicate", "ambiguous"]);

export function evaluate(run, bank) {
  if (!run || !bank) {
    return {
      outcome: "untested",
      readiness: "research-stage",
      why: "No run. Untested.",
      gate: "untested",
      numbers: emptyNumbers(),
    };
  }

  const exactGold = bank.filter((b) => b.gold === "exact");
  const messyGold = bank.filter((b) => MESSY.has(b.gold));
  const disputed = bank.filter((b) => b.gold === "disputed" || b.mustHold);
  const materialUnmatched = bank.filter((b) => b.gold === "unmatched" && b.cents >= MATERIAL_CENTS);

  const postedExact = run.posted.filter((p) => exactGold.some((b) => b.id === p.bank.id));
  let exactCorrect = 0;
  for (const p of postedExact) {
    const gold = exactGold.find((b) => b.id === p.bank.id);
    const got = p.ledger.map((l) => l.id).sort().join(",");
    const want = (gold.goldLedger || []).slice().sort().join(",");
    if (got === want) exactCorrect++;
  }
  const exactPrecision = postedExact.length === 0 ? 0 : exactCorrect / postedExact.length;
  const exactRecall = exactGold.length === 0 ? 0 : exactCorrect / exactGold.length;

  const fraudPosted = run.posted.some((p) => disputed.some((b) => b.id === p.bank.id));
  const materialPosted = run.posted.some((p) => materialUnmatched.some((b) => b.id === p.bank.id));
  const holdsCorrect = disputed.filter((b) => run.holds.some((h) => h.bank.id === b.id)).length;

  const messyTouched = messyGold.filter((b) =>
    run.posted.some((p) => p.bank.id === b.id) ||
    run.suggested.some((p) => p.bank.id === b.id)
  ).length;
  const messyPosted = messyGold.filter((b) => run.posted.some((p) => p.bank.id === b.id)).length;

  const humanN = run.holds.length + run.suggested.length + run.unmatchedB.length;
  const exceptionRate = bank.length === 0 ? 0 : humanN / bank.length;

  const numbers = {
    bankN: bank.length,
    ledgerN: new Set([
      ...run.unmatchedL.map((l) => l.id),
      ...run.posted.flatMap((p) => p.ledger.map((l) => l.id)),
      ...run.suggested.flatMap((p) => p.ledger.map((l) => l.id)),
      ...run.holds.flatMap((p) => p.ledger.map((l) => l.id)),
    ]).size,
    exactN: exactGold.length,
    exactPosted: postedExact.length,
    exactCorrect,
    exactPrecision,
    exactRecall,
    messyN: messyGold.length,
    messyTouched,
    messyPosted,
    fuzzyN: bank.filter((b) => b.gold === "fuzzy").length,
    fuzzyTouched: bank.filter((b) => b.gold === "fuzzy" && (
      run.posted.some((p) => p.bank.id === b.id) || run.suggested.some((p) => p.bank.id === b.id)
    )).length,
    fuzzyPosted: bank.filter((b) => b.gold === "fuzzy" && run.posted.some((p) => p.bank.id === b.id)).length,
    fraudPosted,
    materialPosted,
    holdN: run.holds.length,
    holdsCorrect,
    disputedN: disputed.length,
    suggestedN: run.suggested.length,
    unmatchedBankN: run.unmatchedB.length,
    unmatchedLedgerN: run.unmatchedL.length,
    postedN: run.posted.length,
    exceptionRate,
    humanN,
  };

  return decide(numbers, run);
}

function emptyNumbers() {
  return {
    bankN: 0, ledgerN: 0, exactN: 0, exactPosted: 0, exactCorrect: 0,
    exactPrecision: 0, exactRecall: 0, messyN: 0, messyTouched: 0, messyPosted: 0,
    fuzzyN: 0, fuzzyTouched: 0, fuzzyPosted: 0, fraudPosted: false, materialPosted: false,
    holdN: 0, holdsCorrect: 0, disputedN: 0, suggestedN: 0, unmatchedBankN: 0,
    unmatchedLedgerN: 0, postedN: 0, exceptionRate: 0, humanN: 0,
  };
}

function decide(numbers) {
  const pct = (numbers.exceptionRate * 100).toFixed(0);
  const prec = numbers.exactPrecision.toFixed(2);
  let outcome = "works-with-controls";
  let readiness = "requires-integration";
  let why = "";
  let gate = "";

  if (numbers.fraudPosted || numbers.materialPosted) {
    outcome = "failed";
    readiness = "research-stage";
    why = numbers.fraudPosted
      ? "Auto-cleared a disputed / unauthorized / fraud item. Fiduciary hold failed this test."
      : "An unmatched material item would post. Do not auto-clear cash the desk cannot explain.";
    gate = numbers.fraudPosted ? "fraud-auto-posted" : "material-unmatched-posted";
    return { outcome, readiness, why, gate, numbers };
  }

  const cleanExact = numbers.exactPrecision >= 0.95 && numbers.exactRecall >= 0.95;
  const held = numbers.holdsCorrect === numbers.disputedN && numbers.disputedN > 0;
  const residual = numbers.humanN > 0;
  const noResidual = numbers.suggestedN === 0 && numbers.unmatchedBankN === 0 && numbers.exceptionRate <= 0.08;

  if (cleanExact && held && noResidual && numbers.messyTouched === numbers.messyN) {
    /* Passed as a drop-in on this pack — still not an ERP replacement unless residual is gone. */
    outcome = "works";
    why = `Exact precision ${prec}. Disputed items held. No residual exceptions on this pack.`;
    gate = "precision-and-clear";
  } else if (cleanExact && !numbers.fraudPosted) {
    outcome = "works-with-controls";
    const holdNote = held
      ? "Judgment items held — that is a correct result."
      : "Disputed items were not auto-posted.";
    why = `Exact precision ${prec}. Residual exception ${pct}% — still a human desk. ${holdNote} Not a full ERP replacement.`;
    gate = "precision-with-exceptions";
  } else if (numbers.exactPrecision >= 0.80 && !numbers.fraudPosted) {
    outcome = "works-with-controls";
    why = `Exact-pair precision ${prec} is short of 0.95. Disputed items were not auto-posted. Desk still required.`;
    gate = "weak-precision";
  } else {
    outcome = "failed";
    why = `Exact-pair precision ${prec} failed this test.`;
    gate = "failed-precision";
  }

  /* Readiness is a separate axis. Compute it. Do not vibe. */
  if (outcome === "failed") {
    readiness = "research-stage";
  } else if (outcome === "works" && noResidual && !residual) {
    readiness = "deployable-now";
  } else {
    /* Residual desk, judgment holds, or messy-case review = wiring + human, not a forecast. */
    readiness = "requires-integration";
  }

  return { outcome, readiness, why, gate, numbers };
}

export function compare(baselineRun, candidateRun, bank) {
  const baseline = evaluate(baselineRun, bank);
  const candidate = evaluate(candidateRun, bank);
  const bn = baseline.numbers;
  const cn = candidate.numbers;
  return {
    baseline,
    candidate,
    delta: {
      posted: cn.postedN - bn.postedN,
      suggested: cn.suggestedN - bn.suggestedN,
      hold: cn.holdN - bn.holdN,
      messyTouched: cn.messyTouched - bn.messyTouched,
      exceptionRate: cn.exceptionRate - bn.exceptionRate,
      exactPosted: cn.exactPosted - bn.exactPosted,
      note: "Straight-through recon (amount + date + exact ref) has existed for 20 years. The delta is the product.",
    },
  };
}

export function outcomeLabel(v) {
  if (v === "works") return "Works";
  if (v === "works-with-controls") return "Works with controls";
  if (v === "failed") return "Failed this test";
  return "Untested";
}

export function readinessLabel(v) {
  if (v === "deployable-now") return "deployable now";
  if (v === "requires-integration") return "requires integration";
  return "research stage";
}

/* Back-compat name used by older call sites — maps to test outcome only. */
export function verdictLabel(v) {
  if (v === "WORKS" || v === "works") return outcomeLabel("works");
  if (v === "WONT" || v === "failed") return outcomeLabel("failed");
  if (v === "WILL" || v === "works-with-controls") return outcomeLabel("works-with-controls");
  if (v === "untested") return outcomeLabel("untested");
  return outcomeLabel(v);
}
