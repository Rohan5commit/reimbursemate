import { checkPolicy, getNextAction, resetDuplicateTracking, trackClaim } from "../engine";
import type { PolicyConfig } from "../../schemas";

beforeEach(() => {
  resetDuplicateTracking();
});

describe("checkPolicy", () => {
  it("returns no warnings for a valid expense", () => {
    const warnings = checkPolicy({
      merchant: "Coffee Shop",
      amount: 12.5,
      date: "2026-06-20",
      category: "meals",
      purpose: "Team coffee meeting",
      hasReceipt: true,
    });
    expect(warnings).toHaveLength(0);
  });

  it("warns when amount exceeds $75", () => {
    const warnings = checkPolicy({
      merchant: "Restaurant",
      amount: 100,
      date: "2026-06-20",
      category: "meals",
      purpose: "Client dinner",
      hasReceipt: true,
    });
    expect(warnings.some((w) => w.code === "HIGH_AMOUNT")).toBe(true);
  });

  it("errors when amount exceeds $150 (approval required)", () => {
    const warnings = checkPolicy({
      merchant: "Airline",
      amount: 385.75,
      date: "2026-06-20",
      category: "travel",
      purpose: "Flight to NYC",
      hasReceipt: true,
    });
    expect(warnings.some((w) => w.code === "APPROVAL_REQUIRED")).toBe(true);
  });

  it("warns when purpose is missing", () => {
    const warnings = checkPolicy({
      merchant: "Store",
      amount: 50,
      date: "2026-06-20",
      category: "office_supplies",
      purpose: "",
      hasReceipt: true,
    });
    expect(warnings.some((w) => w.code === "MISSING_PURPOSE")).toBe(true);
  });

  it("warns when receipt is missing for claims over $25", () => {
    const warnings = checkPolicy({
      merchant: "Store",
      amount: 50,
      date: "2026-06-20",
      category: "office_supplies",
      purpose: "Office supplies",
      hasReceipt: false,
    });
    expect(warnings.some((w) => w.code === "MISSING_RECEIPT")).toBe(true);
  });

  it("does not warn for missing receipt under $25", () => {
    const warnings = checkPolicy({
      merchant: "Cafe",
      amount: 15,
      date: "2026-06-20",
      category: "meals",
      purpose: "Coffee",
      hasReceipt: false,
    });
    expect(warnings.some((w) => w.code === "MISSING_RECEIPT")).toBe(false);
  });

  it("flags unsupported categories", () => {
    const warnings = checkPolicy({
      merchant: "Store",
      amount: 30,
      date: "2026-06-20",
      category: "crypto",
      purpose: "Bitcoin mining rig",
      hasReceipt: true,
    });
    expect(warnings.some((w) => w.code === "UNSUPPORTED_CATEGORY")).toBe(true);
  });

  it("rejects zero amount", () => {
    const warnings = checkPolicy({
      merchant: "Store",
      amount: 0,
      date: "2026-06-20",
      category: "other",
      purpose: "Test",
      hasReceipt: true,
    });
    expect(warnings.some((w) => w.code === "INVALID_AMOUNT")).toBe(true);
  });
});

describe("duplicate detection", () => {
  it("detects duplicates based on merchant + date + amount", () => {
    trackClaim("Blue Bottle", "2026-06-18", 47.25);

    const warnings = checkPolicy({
      merchant: "Blue Bottle",
      amount: 47.25,
      date: "2026-06-18",
      category: "meals",
      purpose: "Lunch",
      hasReceipt: true,
    });
    expect(warnings.some((w) => w.code === "POSSIBLE_DUPLICATE")).toBe(true);
  });

  it("does not flag different amounts as duplicates", () => {
    trackClaim("Blue Bottle", "2026-06-18", 47.25);

    const warnings = checkPolicy({
      merchant: "Blue Bottle",
      amount: 52.0,
      date: "2026-06-18",
      category: "meals",
      purpose: "Lunch",
      hasReceipt: true,
    });
    expect(warnings.some((w) => w.code === "POSSIBLE_DUPLICATE")).toBe(false);
  });
});

describe("custom policy config", () => {
  const strictConfig: PolicyConfig = {
    warningThreshold: 25,
    approvalThreshold: 50,
    missingReceiptThreshold: 10,
  };

  it("uses custom warning threshold", () => {
    const warnings = checkPolicy({
      merchant: "Cafe",
      amount: 30,
      date: "2026-06-20",
      category: "meals",
      purpose: "Coffee",
      hasReceipt: true,
    }, strictConfig);
    expect(warnings.some((w) => w.code === "HIGH_AMOUNT")).toBe(true);
  });

  it("uses custom approval threshold", () => {
    const warnings = checkPolicy({
      merchant: "Store",
      amount: 60,
      date: "2026-06-20",
      category: "office_supplies",
      purpose: "Supplies",
      hasReceipt: true,
    }, strictConfig);
    expect(warnings.some((w) => w.code === "APPROVAL_REQUIRED")).toBe(true);
  });

  it("uses custom missing receipt threshold", () => {
    const warnings = checkPolicy({
      merchant: "Store",
      amount: 15,
      date: "2026-06-20",
      category: "office_supplies",
      purpose: "Supplies",
      hasReceipt: false,
    }, strictConfig);
    expect(warnings.some((w) => w.code === "MISSING_RECEIPT")).toBe(true);
  });

  it("defaults to standard thresholds when no config provided", () => {
    const warnings = checkPolicy({
      merchant: "Cafe",
      amount: 30,
      date: "2026-06-20",
      category: "meals",
      purpose: "Coffee",
      hasReceipt: true,
    });
    expect(warnings.some((w) => w.code === "HIGH_AMOUNT")).toBe(false);
  });
});

describe("getNextAction", () => {
  it("returns approval message when approval required", () => {
    const action = getNextAction([
      { code: "APPROVAL_REQUIRED", severity: "error", message: "test" },
    ]);
    expect(action).toContain("Manager approval");
  });

  it("returns error message when errors exist", () => {
    const action = getNextAction([
      { code: "MISSING_PURPOSE", severity: "error", message: "test" },
    ]);
    expect(action).toContain("Resolve errors");
  });

  it("returns ready message when no errors", () => {
    const action = getNextAction([
      { code: "HIGH_AMOUNT", severity: "warning", message: "test" },
    ]);
    expect(action).toContain("Ready for review");
  });
});
