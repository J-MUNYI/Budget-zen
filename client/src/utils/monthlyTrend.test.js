import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { buildMonthlyBuckets, currentMonthSpent } from "./monthlyTrend";

// Pin "now" to 15 March 2024 so month windows are deterministic.
const FIXED_NOW = new Date(2024, 2, 15);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

const EXPENSES = [
  { amount: 100, date: "2024-01-10" },
  { amount: 50, date: "2024-01-20" },
  { amount: 200, date: "2024-03-05" },
  { amount: 999, date: "2023-12-31" }, // before the window
  { amount: "oops", date: "2024-03-06" }, // non-numeric amount -> counts as 0
];

describe("buildMonthlyBuckets", () => {
  it("creates one row per requested month, oldest first", () => {
    const rows = buildMonthlyBuckets(EXPENSES, 3, 50000);
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.key)).toEqual(["2024-0", "2024-1", "2024-2"]);
  });

  it("aggregates spend into the correct month and ignores out-of-window expenses", () => {
    const rows = buildMonthlyBuckets(EXPENSES, 3, 50000);
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r.spent]));
    expect(byKey["2024-0"]).toBe(150); // Jan: 100 + 50
    expect(byKey["2024-1"]).toBe(0); // Feb: none
    expect(byKey["2024-2"]).toBe(200); // Mar: 200 + NaN(->0)
  });

  it("attaches a non-empty month label for each row", () => {
    const rows = buildMonthlyBuckets(EXPENSES, 3, 50000);
    for (const row of rows) {
      expect(typeof row.month).toBe("string");
      expect(row.month).toContain("'24");
    }
  });

  it("includes income on every row when a valid monthlyIncome is given", () => {
    const rows = buildMonthlyBuckets(EXPENSES, 3, 50000);
    expect(rows.every((r) => r.income === 50000)).toBe(true);
  });

  it("sets income to null when monthlyIncome is missing", () => {
    const rows = buildMonthlyBuckets(EXPENSES, 2);
    expect(rows.every((r) => r.income === null)).toBe(true);
  });

  it("sets income to null when monthlyIncome is negative", () => {
    const rows = buildMonthlyBuckets(EXPENSES, 2, -10);
    expect(rows.every((r) => r.income === null)).toBe(true);
  });

  it("treats a zero income as a tracked value", () => {
    const rows = buildMonthlyBuckets(EXPENSES, 1, 0);
    expect(rows[0].income).toBe(0);
  });
});

describe("currentMonthSpent", () => {
  it("sums only expenses that fall in the current month", () => {
    expect(currentMonthSpent(EXPENSES)).toBe(200);
  });

  it("returns 0 when there are no expenses this month", () => {
    expect(currentMonthSpent([{ amount: 500, date: "2024-01-01" }])).toBe(0);
  });

  it("returns 0 for an empty list", () => {
    expect(currentMonthSpent([])).toBe(0);
  });
});
