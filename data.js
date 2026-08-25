/* SAMPLE / DEMO — not a real bank, not real accounts.
   Harbor Ledger Demo v1: fictional paper-merchant ops desk. */

export const META = {
  id: "rec.bank-ledger.v1",
  pack: "v1",
  title: "Bank ↔ ledger match",
  task: "Bank-to-ledger reconciliation",
  roles: ["bookkeeping-clerks", "payments-ops"],
  sample: true,
  banner: "SAMPLE · not a real bank · Harbor Ledger Demo",
  desk: "Harbor Ledger Demo",
  period: "2026-07-01 → 2026-07-31",
  alias: ["rec.bank-ledger.v0"],
};

/* amounts in cents to keep matching exact. ccy defaults to USD. */

export const BANK = [
  /* ── exact matches (amount + date + same counterparty) ── */
  { id: "B01", date: "2026-07-01", cents: 125000, payee: "ACME SUPPLIES INC", memo: "INV-1082", gold: "exact", goldLedger: ["L01"] },
  { id: "B02", date: "2026-07-02", cents: 420000, payee: "PAYDAY RUN LLC", memo: "PR-2026-27", gold: "exact", goldLedger: ["L02"] },
  { id: "B03", date: "2026-07-03", cents: 15622, payee: "HARBOR BEANS #12", memo: "card-4421", gold: "exact", goldLedger: ["L03"] },
  { id: "B04", date: "2026-07-05", cents: 280000, payee: "NORTH DESK OUTFITTERS", memo: "PO-441", gold: "exact", goldLedger: ["L04"] },
  { id: "B05", date: "2026-07-06", cents: 67500, payee: "HARBOR NET FIBER", memo: "acct-88", gold: "exact", goldLedger: ["L05"] },
  { id: "B06", date: "2026-07-08", cents: 4218, payee: "RIDEHAIL TRIP", memo: "ops-errand", gold: "exact", goldLedger: ["L06"] },
  { id: "B07", date: "2026-07-09", cents: 189000, payee: "HARBOR MUTUAL INS", memo: "prem-Q3", gold: "exact", goldLedger: ["L07"] },
  { id: "B08", date: "2026-07-10", cents: 50000, payee: "LEDGERSOFT SUB", memo: "seat-12", gold: "exact", goldLedger: ["L08"] },
  { id: "B09", date: "2026-07-11", cents: 1240000, payee: "YARD WORKSPACE RENT", memo: "July suite", gold: "exact", goldLedger: ["L09"] },
  { id: "B10", date: "2026-07-12", cents: 7850, payee: "PARCEL CO 298441", memo: "waybill", gold: "exact", goldLedger: ["L10"] },
  { id: "B11", date: "2026-07-14", cents: 225000, payee: "KLINE & ASSOCIATES LLP", memo: "retainer", gold: "exact", goldLedger: ["L11"] },
  { id: "B12", date: "2026-07-15", cents: 32000, payee: "INKSUITE CLOUD", memo: "creative seats", gold: "exact", goldLedger: ["L12"] },
  { id: "B13", date: "2026-07-25", cents: 44500, payee: "MAILROOM PRIORITY", memo: "labels", gold: "exact", goldLedger: ["L13"] },

  /* ── fuzzy / damaged payee (same amount + date, noisy name) ── */
  { id: "B14", date: "2026-07-16", cents: 104500, payee: "PSP*TRANSFER CO", memo: "batch-771", gold: "fuzzy", goldLedger: ["L14"] },
  { id: "B15", date: "2026-07-17", cents: 89050, payee: "CART MKTP *9K2", memo: "restock", gold: "fuzzy", goldLedger: ["L15"] },
  { id: "B16", date: "2026-07-18", cents: 210000, payee: "CLOUDCO*COMPUTE", memo: "usage-jul", gold: "fuzzy", goldLedger: ["L16"] },
  { id: "B17", date: "2026-07-08", cents: 6400, payee: "POS *HARBOR BEANS", memo: "team coffee", gold: "fuzzy", goldLedger: ["L17"] },
  { id: "B18", date: "2026-07-07", cents: 315000, payee: "WIRE OUT VENDOR SETTLEMENT", memo: "AP-northwind", gold: "fuzzy", goldLedger: ["L18"] },

  /* ── one-to-many (combined) ── */
  { id: "B19", date: "2026-07-19", cents: 180000, payee: "ACH NORTHWIND PAPER", memo: "inv 4410+4411", gold: "split", goldLedger: ["L19", "L20"] },

  /* ── must hold: disputed / unauthorized ── */
  { id: "B20", date: "2026-07-20", cents: 875000, payee: "ACH CREDIT J.RIVERA", memo: "DISPUTED UNAUTHORIZED — rev-share claim", gold: "disputed", goldLedger: ["L21"], mustHold: true },

  /* ── residual unmatched cash (desk) ── */
  { id: "B21", date: "2026-07-21", cents: 499900, payee: "WIRE IN UNKNOWN ORIGIN", memo: "no invoice on file", gold: "unmatched", goldLedger: [], material: true },
  { id: "B22", date: "2026-07-23", cents: 1500000, payee: "CUSTOMER WIRE ORION PAPER LLC", memo: "unapplied cash", gold: "unmatched", goldLedger: [], material: true },
  { id: "B23", date: "2026-07-22", cents: 6700, payee: "CITY LOT METER", memo: "downtown lot", gold: "unmatched", goldLedger: [] },
  { id: "B24", date: "2026-07-24", cents: 2250, payee: "POS *CORNER CART", memo: "field snack", gold: "unmatched", goldLedger: [] },

  /* ── date offset + exact counterparty (v1) ── */
  { id: "B25", date: "2026-07-27", cents: 88000, payee: "QUAY PRINT LTD", memo: "INV-5501", gold: "offset", goldLedger: ["L25"] },

  /* ── bank fee, same amount, different payee string (v1) ── */
  { id: "B26", date: "2026-07-13", cents: 1850, payee: "FIRST HARBOR BANK", memo: "WIRE FEE", gold: "fee", goldLedger: ["L26"] },

  /* ── commission / net vs gross (v1) ── */
  { id: "B27", date: "2026-07-28", cents: 198500, payee: "PSP*TRANSFER CO", memo: "batch-802 net", gold: "fee", goldLedger: ["L27"] },

  /* ── FX: USD bank vs EUR ledger, amounts near not equal (v1) ── */
  { id: "B28", date: "2026-07-29", cents: 108500, ccy: "USD", payee: "ATELIER NORD", memo: "INV-EU-19", gold: "fx", goldLedger: ["L28"] },

  /* ── many-to-one (two bank credits → one invoice) (v1) ── */
  { id: "B29", date: "2026-07-21", cents: 60000, payee: "ACH QUILL & CO", memo: "INV-900 part 1", gold: "many-one", goldLedger: ["L29"] },
  { id: "B30", date: "2026-07-21", cents: 40000, payee: "ACH QUILL & CO", memo: "INV-900 part 2", gold: "many-one", goldLedger: ["L29"] },

  /* ── truncated / damaged memo (v1) ── */
  { id: "B31", date: "2026-07-26", cents: 72500, payee: "NTHWIND PAP", memo: "inv 44", gold: "fuzzy", goldLedger: ["L31"] },

  /* ── duplicates: two bank, one ledger (v1) ── */
  { id: "B32", date: "2026-07-30", cents: 50000, payee: "ACME SUPPLIES INC", memo: "INV-1099", gold: "duplicate", goldLedger: ["L32"] },
  { id: "B33", date: "2026-07-30", cents: 50000, payee: "ACME SUPPLIES INC", memo: "INV-1099 DUP?", gold: "duplicate", goldLedger: [] },

  /* ── contested / ambiguous: two ledger candidates (v1) ── */
  { id: "B34", date: "2026-07-18", cents: 45000, payee: "CLOUD STORAGE BACKUP", memo: "jul", gold: "ambiguous", goldLedger: ["L34A", "L34B"] },

  /* ── must hand to a human: fraud / chargeback (v1) ── */
  { id: "B35", date: "2026-07-31", cents: 220000, payee: "ACH CREDIT UNKNOWN", memo: "FRAUD ALERT — CHARGEBACK do not clear", gold: "disputed", goldLedger: ["L35"], mustHold: true },

  /* ── partial: one bank covers part of one invoice (v1) ── */
  { id: "B36", date: "2026-07-16", cents: 50000, payee: "WEST WHARF INK", memo: "INV-220 part", gold: "partial", goldLedger: ["L36"] },
];

export const LEDGER = [
  { id: "L01", date: "2026-07-01", cents: 125000, payee: "ACME SUPPLIES INC", memo: "INV-1082 paper stock", gold: "exact" },
  { id: "L02", date: "2026-07-02", cents: 420000, payee: "PAYDAY RUN LLC", memo: "biweekly payroll", gold: "exact" },
  { id: "L03", date: "2026-07-03", cents: 15622, payee: "HARBOR BEANS #12", memo: "card-4421", gold: "exact" },
  { id: "L04", date: "2026-07-05", cents: 280000, payee: "NORTH DESK OUTFITTERS", memo: "PO-441 chairs", gold: "exact" },
  { id: "L05", date: "2026-07-06", cents: 67500, payee: "HARBOR NET FIBER", memo: "fiber July", gold: "exact" },
  { id: "L06", date: "2026-07-08", cents: 4218, payee: "RIDEHAIL TRIP", memo: "ops-errand", gold: "exact" },
  { id: "L07", date: "2026-07-09", cents: 189000, payee: "HARBOR MUTUAL INS", memo: "Q3 premium", gold: "exact" },
  { id: "L08", date: "2026-07-10", cents: 50000, payee: "LEDGERSOFT SUB", memo: "12 seats", gold: "exact" },
  { id: "L09", date: "2026-07-11", cents: 1240000, payee: "YARD WORKSPACE RENT", memo: "July suite", gold: "exact" },
  { id: "L10", date: "2026-07-12", cents: 7850, payee: "PARCEL CO 298441", memo: "waybill", gold: "exact" },
  { id: "L11", date: "2026-07-14", cents: 225000, payee: "KLINE & ASSOCIATES LLP", memo: "retainer", gold: "exact" },
  { id: "L12", date: "2026-07-15", cents: 32000, payee: "INKSUITE CLOUD", memo: "creative seats", gold: "exact" },
  { id: "L13", date: "2026-07-25", cents: 44500, payee: "MAILROOM PRIORITY", memo: "labels", gold: "exact" },

  { id: "L14", date: "2026-07-16", cents: 104500, payee: "PSP payout Jul", memo: "processor batch", gold: "fuzzy" },
  { id: "L15", date: "2026-07-17", cents: 89050, payee: "Cart Marketplace", memo: "restock", gold: "fuzzy" },
  { id: "L16", date: "2026-07-18", cents: 210000, payee: "CloudCo compute", memo: "usage July", gold: "fuzzy" },
  { id: "L17", date: "2026-07-08", cents: 6400, payee: "Harbor Beans (POS)", memo: "team coffee", gold: "fuzzy" },
  { id: "L18", date: "2026-07-07", cents: 315000, payee: "Vendor settlement — AP", memo: "Northwind paper", gold: "fuzzy" },

  { id: "L19", date: "2026-07-19", cents: 100000, payee: "Northwind Paper", memo: "INV-4410", gold: "split" },
  { id: "L20", date: "2026-07-19", cents: 80000, payee: "Northwind Paper", memo: "INV-4411", gold: "split" },

  { id: "L21", date: "2026-07-20", cents: 875000, payee: "Rivera consulting accrual", memo: "open — do not clear", gold: "disputed" },

  { id: "L22", date: "2026-07-24", cents: 21000, payee: "Accrued postage", memo: "no bank line yet", gold: "unmatched" },

  /* v1 */
  { id: "L25", date: "2026-07-24", cents: 88000, payee: "QUAY PRINT LTD", memo: "INV-5501 press run", gold: "offset" },
  { id: "L26", date: "2026-07-13", cents: 1850, payee: "First Harbor Bank — wire fees", memo: "July wires", gold: "fee" },
  { id: "L27", date: "2026-07-28", cents: 200000, payee: "PSP payout", memo: "batch-802 gross", gold: "fee" },
  { id: "L28", date: "2026-07-29", cents: 100000, ccy: "EUR", payee: "Atelier Nord", memo: "INV-EU-19", gold: "fx" },
  { id: "L29", date: "2026-07-21", cents: 100000, payee: "Quill & Co", memo: "INV-900", gold: "many-one" },
  { id: "L31", date: "2026-07-26", cents: 72500, payee: "Northwind Paper", memo: "INV-4412", gold: "fuzzy" },
  { id: "L32", date: "2026-07-30", cents: 50000, payee: "ACME SUPPLIES INC", memo: "INV-1099", gold: "duplicate" },
  { id: "L34A", date: "2026-07-18", cents: 45000, payee: "CloudCo storage", memo: "jul storage", gold: "ambiguous" },
  { id: "L34B", date: "2026-07-17", cents: 45000, payee: "CloudNine backup", memo: "jul backup", gold: "ambiguous" },
  { id: "L35", date: "2026-07-31", cents: 220000, payee: "Unknown credit accrual", memo: "open — do not clear", gold: "disputed" },
  { id: "L36", date: "2026-07-16", cents: 90000, payee: "West Wharf Ink", memo: "INV-220", gold: "partial" },
];

const SYM = { USD: "$", EUR: "€", GBP: "£" };

export function ccyOf(row) {
  return row?.ccy || "USD";
}

export function money(cents, ccy) {
  const sign = cents < 0 ? "-" : "";
  const n = Math.abs(cents);
  const d = Math.floor(n / 100);
  const c = String(n % 100).padStart(2, "0");
  const sym = SYM[ccy || "USD"] || (ccy + " ");
  return sign + sym + d.toLocaleString("en-US") + "." + c;
}
