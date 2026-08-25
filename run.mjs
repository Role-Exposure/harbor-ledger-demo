import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BANK, LEDGER, META, money, ccyOf } from "./data.js";
import { match, matchBaseline } from "./matcher.js";
import { compare, outcomeLabel, readinessLabel } from "./rubric.js";

const here = dirname(fileURLToPath(import.meta.url));
const runsDir = join(here, "runs");
mkdirSync(runsDir, { recursive: true });

const candidate = match(BANK, LEDGER);
const baseline = matchBaseline(BANK, LEDGER);
const cmp = compare(baseline, candidate, BANK);

const brief = (p) =>
  `${p.bank.id} ${money(p.bank.cents, ccyOf(p.bank))} → ${p.ledger.map((l) => l.id).join("+")}  [${p.method}] score=${(p.payeeScore || 0).toFixed(2)} posted=${p.posted}`;

function dump(label, run) {
  console.log("\n" + label);
  console.log("POSTED");
  run.posted.forEach((p) => console.log(" ", brief(p)));
  console.log("SUGGESTED");
  run.suggested.forEach((p) => console.log(" ", brief(p), p.reason || ""));
  console.log("HOLDS");
  run.holds.forEach((p) => console.log(" ", brief(p), p.reason || ""));
  console.log("UNMATCHED BANK");
  run.unmatchedB.forEach((b) => console.log(" ", b.id, money(b.cents, ccyOf(b)), b.payee, b.gold));
  console.log("UNMATCHED LEDGER");
  run.unmatchedL.forEach((l) => console.log(" ", l.id, money(l.cents, ccyOf(l)), l.payee, l.gold));
}

console.log("PACK", META.id, "BANK", BANK.length, "LEDGER", LEDGER.length);
dump("BASELINE  (amount + date + exact ref)", baseline);
dump("CANDIDATE (richer matcher)", candidate);

const ev = cmp.candidate;
console.log("\nOUTCOME   ", outcomeLabel(ev.outcome));
console.log("READINESS ", readinessLabel(ev.readiness));
console.log(ev.why);
console.log("GATE", ev.gate);
console.log("\nBASELINE numbers");
console.log(JSON.stringify(cmp.baseline.numbers, null, 2));
console.log("\nCANDIDATE numbers");
console.log(JSON.stringify(cmp.candidate.numbers, null, 2));
console.log("\nDELTA", JSON.stringify(cmp.delta, null, 2));

function slimPair(p) {
  return {
    bank: p.bank.id,
    ledger: p.ledger.map((l) => l.id),
    method: p.method,
    posted: p.posted,
    payeeScore: p.payeeScore ?? 0,
    reason: p.reason || null,
  };
}

function slimRun(run) {
  return {
    posted: run.posted.map(slimPair),
    suggested: run.suggested.map(slimPair),
    holds: run.holds.map(slimPair),
    unmatchedB: run.unmatchedB.map((b) => b.id),
    unmatchedL: run.unmatchedL.map((l) => l.id),
  };
}

const artifact = {
  meta: { ...META, sample: true, banner: META.banner },
  when: new Date().toISOString(),
  input: { bank: BANK, ledger: LEDGER },
  baseline: slimRun(baseline),
  candidate: slimRun(candidate),
  rubric: {
    baseline: cmp.baseline,
    candidate: cmp.candidate,
    delta: cmp.delta,
  },
};

const named = join(runsDir, "v1-harbor-ledger.json");
const latest = join(runsDir, "latest.json");
writeFileSync(named, JSON.stringify(artifact, null, 2));
writeFileSync(latest, JSON.stringify(artifact, null, 2));
console.log("\nWROTE", named);
console.log("WROTE", latest);
