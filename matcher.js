/* Deterministic matchers. No network. No API keys.
   BASELINE  — classic ERP STP: amount + same date + exact reference/payee only.
   CANDIDATE — date window, fuzzy payee, splits, many-to-one, fee-net, FX,
               duplicate/ambiguous review, fiduciary holds.
   Judgment / disputed / unauthorized / fraud lines are held by the candidate.
   Holding them is a correct result. Baseline leaves them unmatched. */

const STOP = new Set([
  "inc", "llc", "llp", "co", "corp", "ltd", "the", "ach", "wire", "out", "in",
  "and", "of", "for", "to", "a", "an", "us",
]);

const ALIAS = {
  psp: "psp",
  transfer: "transfer",
  payout: "psp",
  processor: "psp",
  cart: "cart",
  mktp: "marketplace",
  marketplace: "marketplace",
  cloudco: "cloudco",
  compute: "compute",
  pos: "pos",
  harbor: "harbor",
  beans: "beans",
  vendor: "vendor",
  settlement: "settlement",
  northwind: "northwind",
  nthwind: "northwind",
  pap: "paper",
  paper: "paper",
  ap: "ap",
  quay: "quay",
  print: "print",
  atelier: "atelier",
  nord: "nord",
  quill: "quill",
  wharf: "wharf",
  ink: "ink",
  storage: "storage",
  backup: "backup",
  cloudnine: "cloudnine",
};

const HOLD_RE = /DISPUTED|UNAUTHORIZED|FRAUD|CHARGEBACK|DO NOT CLEAR|REV-SHARE CLAIM/;
const REF_RE = /\b(INV[- ]?[A-Z0-9-]+|PO[- ]?[A-Z0-9-]+|PR[- ]?[A-Z0-9-]+|BATCH[- ]?[A-Z0-9-]+)\b/i;
const FEE_MIN = 50;
const FEE_MAX = 2500;
const FX_LO = 0.85;
const FX_HI = 1.30;

export function isJudgment(line) {
  if (line.mustHold) return true;
  const t = `${line.payee || ""} ${line.memo || ""}`.toUpperCase();
  return HOLD_RE.test(t);
}

function ccy(row) {
  return row?.ccy || "USD";
}

function tokens(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ALIAS[w] || w)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

function containment(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  if (!A.size || !B.size) return 0;
  let hit = 0;
  for (const x of A) if (B.has(x)) hit++;
  return hit / Math.min(A.size, B.size);
}

function lev(a, b) {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => {
    const row = new Array(n + 1);
    row[0] = i;
    return row;
  });
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i < m + 1; i++) {
    for (let j = 1; j < n + 1; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function pairScore(a, b) {
  const jac = jaccard(a, b);
  const con = containment(a, b);
  const bn = a.join(" ");
  const ln = b.join(" ");
  const maxl = Math.max(bn.length, ln.length) || 1;
  const sim = 1 - lev(bn, ln) / maxl;
  return Math.max(jac, con * 0.92, sim * 0.55);
}

export function payeeScore(bank, led) {
  const payeeOnly = pairScore(tokens(bank.payee), tokens(led.payee));
  const withMemo = pairScore(
    tokens(`${bank.payee} ${bank.memo || ""}`),
    tokens(`${led.payee} ${led.memo || ""}`)
  );
  return Math.max(payeeOnly, withMemo);
}

export function payeesEqual(a, b) {
  return tokens(a).join(" ") === tokens(b).join(" ") && tokens(a).length > 0;
}

export function extractRef(line) {
  if (line.ref) return String(line.ref).toUpperCase().replace(/\s+/g, "");
  const blob = `${line.memo || ""} ${line.payee || ""}`;
  const m = blob.match(REF_RE);
  return m ? m[1].toUpperCase().replace(/\s+/g, "") : "";
}

function refsEqual(a, b) {
  const ra = extractRef(a);
  const rb = extractRef(b);
  return Boolean(ra && rb && ra === rb);
}

function dayNum(iso) {
  return Date.parse(iso + "T00:00:00Z") / 86400000;
}

function daysBetween(a, b) {
  return Math.abs(dayNum(a) - dayNum(b));
}

function emptyResult() {
  return { posted: [], suggested: [], holds: [], unmatchedB: [], unmatchedL: [] };
}

function finish(bank, ledger, usedB, usedL, posted, suggested, holds) {
  return {
    posted,
    suggested,
    holds,
    unmatchedB: bank.filter((b) => !usedB.has(b.id)),
    unmatchedL: ledger.filter((l) => !usedL.has(l.id)),
  };
}

/* ── BASELINE: amount + same date + exact reference or exact payee. Unique. ── */
export function matchBaseline(bank, ledger) {
  const usedB = new Set();
  const usedL = new Set();
  const posted = [];
  const suggested = [];
  const holds = [];

  for (const b of bank) {
    if (usedB.has(b.id)) continue;
    const cands = ledger.filter((l) => {
      if (usedL.has(l.id)) return false;
      if (l.cents !== b.cents) return false;
      if (l.date !== b.date) return false;
      if (ccy(l) !== ccy(b)) return false;
      return refsEqual(b, l) || payeesEqual(b.payee, l.payee);
    });
    if (cands.length !== 1) continue;
    const led = cands[0];
    const twins = bank.filter((other) => {
      if (usedB.has(other.id) || other.id === b.id) return false;
      if (other.cents !== led.cents || other.date !== led.date) return false;
      if (ccy(other) !== ccy(led)) return false;
      return refsEqual(other, led) || payeesEqual(other.payee, led.payee);
    });
    if (twins.length) continue;
    posted.push({
      bank: b,
      ledger: [led],
      method: "baseline-exact",
      posted: true,
      payeeScore: payeeScore(b, led),
      matcher: "baseline",
    });
    usedB.add(b.id);
    usedL.add(led.id);
  }

  return finish(bank, ledger, usedB, usedL, posted, suggested, holds);
}

/* ── CANDIDATE: richer matcher ── */
export function match(bank, ledger) {
  const usedB = new Set();
  const usedL = new Set();
  const posted = [];
  const suggested = [];
  const holds = [];

  /* Stage 0 — fiduciary hold. Never auto-post. Holding is correct. */
  for (const b of bank) {
    if (!isJudgment(b)) continue;
    const trap = ledger.filter((l) => l.cents === b.cents && l.date === b.date);
    holds.push({
      bank: b,
      ledger: trap,
      method: "hold-judgment",
      posted: false,
      reason: "Disputed / unauthorized / fraud — fiduciary hold. Human only.",
      payeeScore: trap[0] ? payeeScore(b, trap[0]) : 0,
      matcher: "candidate",
    });
    usedB.add(b.id);
    for (const l of trap) usedL.add(l.id);
  }

  /* Stage 1 — exact amount + same date + unique + strong payee/ref.
     Skip when a same-amount/date twin exists (duplicates stay for review). */
  for (const b of bank) {
    if (usedB.has(b.id)) continue;
    const cands = ledger.filter((l) => !usedL.has(l.id) && l.cents === b.cents && l.date === b.date && ccy(l) === ccy(b));
    if (cands.length !== 1) continue;
    const twins = bank.filter((o) => !usedB.has(o.id) && o.id !== b.id && o.cents === b.cents && o.date === b.date && ccy(o) === ccy(b));
    if (twins.length) continue;
    const led = cands[0];
    const score = payeeScore(b, led);
    const same = payeesEqual(b.payee, led.payee);
    const ref = refsEqual(b, led);
    if (same || ref || score >= 0.84) {
      posted.push({
        bank: b,
        ledger: [led],
        method: "exact-amount-date",
        posted: true,
        payeeScore: score,
        matcher: "candidate",
      });
      usedB.add(b.id);
      usedL.add(led.id);
    }
  }

  /* Stage 2 — amount + ±3d + fuzzy payee. Auto only if very strong / same payee.
     Two close scores → ambiguous, suggest both, do not post. */
  for (const b of bank) {
    if (usedB.has(b.id)) continue;
    const cands = ledger
      .filter((l) => !usedL.has(l.id) && l.cents === b.cents && ccy(l) === ccy(b) && daysBetween(l.date, b.date) <= 3)
      .map((l) => ({ l, score: payeeScore(b, l) }))
      .filter((x) => x.score >= 0.28)
      .sort((a, b2) => b2.score - a.score);
    if (!cands.length) continue;
    const top = cands[0];
    const close = cands.length >= 2 && top.score - cands[1].score < 0.10;
    if (close) {
      suggested.push({
        bank: b,
        ledger: cands.slice(0, 2).map((x) => x.l),
        method: "ambiguous",
        posted: false,
        payeeScore: top.score,
        reason: "Ambiguous: two ledger candidates, scores too close. Human pick.",
        matcher: "candidate",
      });
      usedB.add(b.id);
      usedL.add(cands[0].l.id);
      usedL.add(cands[1].l.id);
      continue;
    }
    const same = payeesEqual(b.payee, top.l.payee) || refsEqual(b, top.l);
    const row = {
      bank: b,
      ledger: [top.l],
      method: same && daysBetween(b.date, top.l.date) > 0 ? "date-offset" : "fuzzy-payee",
      posted: same || top.score >= 0.78,
      payeeScore: top.score,
      matcher: "candidate",
    };
    if (row.posted) posted.push(row);
    else suggested.push(row);
    usedB.add(b.id);
    usedL.add(top.l.id);
  }

  /* Stage 3 — one bank = two unused ledger lines nearby. Suggest only. */
  for (const b of bank) {
    if (usedB.has(b.id)) continue;
    const near = ledger.filter((l) => !usedL.has(l.id) && ccy(l) === ccy(b) && daysBetween(l.date, b.date) <= 2);
    let found = false;
    for (let i = 0; i < near.length && !found; i++) {
      for (let j = i + 1; j < near.length; j++) {
        if (near[i].cents + near[j].cents === b.cents) {
          suggested.push({
            bank: b,
            ledger: [near[i], near[j]],
            method: "one-to-many",
            posted: false,
            payeeScore: Math.max(payeeScore(b, near[i]), payeeScore(b, near[j])),
            reason: "Split: bank amount = two ledger invoices. Review before post.",
            matcher: "candidate",
          });
          usedB.add(b.id);
          usedL.add(near[i].id);
          usedL.add(near[j].id);
          found = true;
          break;
        }
      }
    }
  }

  /* Stage 4 — many-to-one: two unused bank credits = one ledger. Suggest only. */
  for (const l of ledger) {
    if (usedL.has(l.id)) continue;
    const near = bank.filter((b) => !usedB.has(b.id) && ccy(b) === ccy(l) && daysBetween(l.date, b.date) <= 2);
    let found = false;
    for (let i = 0; i < near.length && !found; i++) {
      for (let j = i + 1; j < near.length; j++) {
        if (near[i].cents + near[j].cents !== l.cents) continue;
        const s = Math.max(payeeScore(near[i], l), payeeScore(near[j], l));
        if (s < 0.22) continue;
        for (const b of [near[i], near[j]]) {
          suggested.push({
            bank: b,
            ledger: [l],
            method: "many-to-one",
            posted: false,
            payeeScore: payeeScore(b, l),
            reason: "Combined: two bank credits = one ledger invoice. Review before post.",
            partner: b.id === near[i].id ? near[j].id : near[i].id,
            matcher: "candidate",
          });
          usedB.add(b.id);
        }
        usedL.add(l.id);
        found = true;
      }
    }
  }

  /* Stage 5 — fee / commission: amounts near, same ccy, nearby date. Suggest only. */
  for (const b of bank) {
    if (usedB.has(b.id)) continue;
    const cands = ledger
      .filter((l) => {
        if (usedL.has(l.id) || ccy(l) !== ccy(b)) return false;
        if (daysBetween(l.date, b.date) > 2) return false;
        const diff = Math.abs(l.cents - b.cents);
        if (diff < FEE_MIN || diff > FEE_MAX) return false;
        const rel = diff / Math.max(l.cents, b.cents, 1);
        return rel <= 0.03 || (diff >= FEE_MIN && diff <= FEE_MAX);
      })
      .map((l) => ({ l, score: payeeScore(b, l) }))
      .filter((x) => x.score >= 0.22)
      .sort((a, b2) => b2.score - a.score);
    if (!cands.length) continue;
    const top = cands[0];
    suggested.push({
      bank: b,
      ledger: [top.l],
      method: "fee-net",
      posted: false,
      payeeScore: top.score,
      reason: `Fee / commission: amounts differ by ${Math.abs(top.l.cents - b.cents)}¢. Review before post.`,
      matcher: "candidate",
    });
    usedB.add(b.id);
    usedL.add(top.l.id);
  }

  /* Stage 6 — FX: different ccy, ratio in a demo band, nearby date. Suggest only. */
  for (const b of bank) {
    if (usedB.has(b.id)) continue;
    const cands = ledger
      .filter((l) => {
        if (usedL.has(l.id) || ccy(l) === ccy(b)) return false;
        if (daysBetween(l.date, b.date) > 3) return false;
        if (!l.cents || !b.cents) return false;
        const ratio = b.cents / l.cents;
        return ratio >= FX_LO && ratio <= FX_HI;
      })
      .map((l) => ({ l, score: payeeScore(b, l) }))
      .filter((x) => x.score >= 0.22)
      .sort((a, b2) => b2.score - a.score);
    if (!cands.length) continue;
    const top = cands[0];
    suggested.push({
      bank: b,
      ledger: [top.l],
      method: "fx",
      posted: false,
      payeeScore: top.score,
      reason: `FX: ${ccy(b)} ${b.cents} vs ${ccy(top.l)} ${top.l.cents} — amounts near, not equal. Human rates.`,
      matcher: "candidate",
    });
    usedB.add(b.id);
    usedL.add(top.l.id);
  }

  /* Stage 7 — partial: bank covers a slice of one nearby invoice. Suggest only. */
  for (const b of bank) {
    if (usedB.has(b.id)) continue;
    const cands = ledger
      .filter((l) => {
        if (usedL.has(l.id) || ccy(l) !== ccy(b)) return false;
        if (daysBetween(l.date, b.date) > 2) return false;
        if (b.cents >= l.cents) return false;
        const part = b.cents / l.cents;
        return part >= 0.35 && part <= 0.80;
      })
      .map((l) => ({ l, score: payeeScore(b, l) }))
      .filter((x) => x.score >= 0.28)
      .sort((a, b2) => b2.score - a.score);
    if (!cands.length) continue;
    const top = cands[0];
    suggested.push({
      bank: b,
      ledger: [top.l],
      method: "partial",
      posted: false,
      payeeScore: top.score,
      reason: "Partial: bank covers part of one ledger invoice. Review before post.",
      matcher: "candidate",
    });
    usedB.add(b.id);
    usedL.add(top.l.id);
  }

  /* Stage 8 — leftover duplicate of an already-posted exact pair. */
  for (const b of bank) {
    if (usedB.has(b.id)) continue;
    const twin = posted.find((p) =>
      p.bank.cents === b.cents &&
      p.bank.date === b.date &&
      (payeesEqual(p.bank.payee, b.payee) || refsEqual(p.bank, b))
    );
    if (!twin) continue;
    suggested.push({
      bank: b,
      ledger: twin.ledger,
      method: "duplicate",
      posted: false,
      payeeScore: twin.payeeScore || 0,
      reason: "Duplicate bank line of an already-posted pair. Do not double-post.",
      matcher: "candidate",
    });
    usedB.add(b.id);
  }

  return finish(bank, ledger, usedB, usedL, posted, suggested, holds);
}

export function llmStub(result) {
  return {
    enabled: false,
    stub: true,
    note: "LLM layer stubbed. No API key. No call. Outcome is the rubric on deterministic matches.",
    result,
  };
}
