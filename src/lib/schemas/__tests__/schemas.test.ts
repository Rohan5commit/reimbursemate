import {
  ParsedReceiptSchema,
  PolicyWarningSchema,
  ReimbursementDraftSchema,
  FinalSubmissionNoteSchema,
  ExpenseInputSchema,
} from "../index";

describe("ParsedReceiptSchema", () => {
  it("accepts valid receipt data", () => {
    const result = ParsedReceiptSchema.safeParse({
      merchant: "Coffee Shop",
      amount: 12.5,
      date: "2026-06-20",
      currency: "USD",
      tax: 1.0,
      probableCategory: "meals",
      probablePurpose: "Team coffee",
      confidence: 0.9,
      missingFields: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing merchant", () => {
    const result = ParsedReceiptSchema.safeParse({
      amount: 12.5,
      date: "2026-06-20",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative confidence", () => {
    const result = ParsedReceiptSchema.safeParse({
      merchant: "Shop",
      amount: 12.5,
      date: "2026-06-20",
      confidence: -0.1,
      missingFields: [],
      probableCategory: "meals",
      probablePurpose: "test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects confidence above 1", () => {
    const result = ParsedReceiptSchema.safeParse({
      merchant: "Shop",
      amount: 12.5,
      date: "2026-06-20",
      confidence: 1.5,
      missingFields: [],
      probableCategory: "meals",
      probablePurpose: "test",
    });
    expect(result.success).toBe(false);
  });
});

describe("PolicyWarningSchema", () => {
  it("accepts valid warning", () => {
    const result = PolicyWarningSchema.safeParse({
      code: "HIGH_AMOUNT",
      severity: "warning",
      message: "Amount is high",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid severity", () => {
    const result = PolicyWarningSchema.safeParse({
      code: "HIGH_AMOUNT",
      severity: "critical",
      message: "Amount is high",
    });
    expect(result.success).toBe(false);
  });
});

describe("ReimbursementDraftSchema", () => {
  it("accepts valid draft", () => {
    const result = ReimbursementDraftSchema.safeParse({
      id: "REIMB-123",
      submitterName: "Alex",
      merchant: "Coffee",
      date: "2026-06-20",
      amount: 12.5,
      currency: "USD",
      category: "meals",
      purpose: "Team coffee",
      notes: "",
      tax: null,
      warnings: [],
      status: "draft",
      nextAction: "Ready",
      createdAt: "2026-06-20T10:00:00Z",
      confidence: 0.9,
      aiExtracted: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = ReimbursementDraftSchema.safeParse({
      id: "REIMB-123",
      submitterName: "Alex",
      merchant: "Coffee",
      date: "2026-06-20",
      amount: 12.5,
      category: "meals",
      purpose: "Team coffee",
      notes: "",
      warnings: [],
      status: "pending",
      nextAction: "Ready",
      createdAt: "2026-06-20T10:00:00Z",
      confidence: 0.9,
      aiExtracted: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("ExpenseInputSchema", () => {
  it("accepts valid input", () => {
    const result = ExpenseInputSchema.safeParse({
      merchant: "Store",
      amount: 25.0,
      date: "2026-06-20",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty merchant", () => {
    const result = ExpenseInputSchema.safeParse({
      merchant: "",
      amount: 25.0,
      date: "2026-06-20",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = ExpenseInputSchema.safeParse({
      merchant: "Store",
      amount: -10,
      date: "2026-06-20",
    });
    expect(result.success).toBe(false);
  });
});

describe("FinalSubmissionNoteSchema", () => {
  it("accepts valid note", () => {
    const result = FinalSubmissionNoteSchema.safeParse({
      draftId: "REIMB-123",
      summary: "Test summary",
      checklist: [{ item: "Test", status: "complete" }],
      approvalStatus: "approved",
      exportableNote: "Full note text",
      submittedAt: "2026-06-20T10:00:00Z",
    });
    expect(result.success).toBe(true);
  });
});
