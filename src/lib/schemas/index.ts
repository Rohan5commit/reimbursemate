import { z } from "zod";

// ── Core expense input ──────────────────────────────────────────────
export const ExpenseInputSchema = z.object({
  merchant: z.string().min(1, "Merchant is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  currency: z.string().default("USD"),
  category: z.string().default("uncategorized"),
  description: z.string().default(""),
  tax: z.number().optional(),
  notes: z.string().optional(),
});

export type ExpenseInput = z.infer<typeof ExpenseInputSchema>;

// ── Parsed receipt (AI extraction output) ───────────────────────────
export const ParsedReceiptSchema = z.object({
  merchant: z.string(),
  amount: z.number(),
  date: z.string(),
  currency: z.string().default("USD"),
  tax: z.number().nullable().default(null),
  probableCategory: z.string(),
  probablePurpose: z.string(),
  confidence: z.number().min(0).max(1),
  missingFields: z.array(z.string()),
});

export type ParsedReceipt = z.infer<typeof ParsedReceiptSchema>;

// ── Missing field ───────────────────────────────────────────────────
export const MissingFieldSchema = z.object({
  field: z.string(),
  label: z.string(),
  required: z.boolean(),
  currentValue: z.string().optional(),
});

export type MissingField = z.infer<typeof MissingFieldSchema>;

// ── Policy configuration ───────────────────────────────────────────
export const PolicyConfigSchema = z.object({
  warningThreshold: z.number().min(0).default(75),
  approvalThreshold: z.number().min(0).default(150),
  missingReceiptThreshold: z.number().min(0).default(25),
});

export type PolicyConfig = z.infer<typeof PolicyConfigSchema>;

export const defaultPolicyConfig: PolicyConfig = {
  warningThreshold: 75,
  approvalThreshold: 150,
  missingReceiptThreshold: 25,
};

// ── Policy warning ──────────────────────────────────────────────────
export const PolicyWarningSchema = z.object({
  code: z.string(),
  severity: z.enum(["info", "warning", "error"]),
  message: z.string(),
  field: z.string().optional(),
});

export type PolicyWarning = z.infer<typeof PolicyWarningSchema>;

// ── Reimbursement draft ─────────────────────────────────────────────
export const ReimbursementDraftSchema = z.object({
  id: z.string(),
  submitterName: z.string(),
  merchant: z.string(),
  date: z.string(),
  amount: z.number(),
  currency: z.string().default("USD"),
  category: z.string(),
  purpose: z.string(),
  notes: z.string(),
  tax: z.number().nullable().default(null),
  warnings: z.array(PolicyWarningSchema),
  status: z.enum(["draft", "review", "approved", "submitted"]),
  nextAction: z.string(),
  createdAt: z.string(),
  confidence: z.number().min(0).max(1),
  aiExtracted: z.boolean(),
});

export type ReimbursementDraft = z.infer<typeof ReimbursementDraftSchema>;

// ── Review action ───────────────────────────────────────────────────
export const ReviewActionSchema = z.enum([
  "edit",
  "approve",
  "reject",
  "request_info",
]);

export type ReviewAction = z.infer<typeof ReviewActionSchema>;

// ── Final submission note ───────────────────────────────────────────
export const FinalSubmissionNoteSchema = z.object({
  draftId: z.string(),
  summary: z.string(),
  checklist: z.array(
    z.object({
      item: z.string(),
      status: z.enum(["complete", "missing", "warning"]),
    })
  ),
  approvalStatus: z.enum(["approved", "pending", "rejected"]),
  exportableNote: z.string(),
  submittedAt: z.string(),
});

export type FinalSubmissionNote = z.infer<typeof FinalSubmissionNoteSchema>;

// ── App run state ───────────────────────────────────────────────────
export const AppRunStateSchema = z.object({
  step: z.enum([
    "landing",
    "input",
    "extracting",
    "followup",
    "policy_check",
    "review",
    "final",
    "architecture",
  ]),
  inputMethod: z.enum(["upload", "manual", "demo"]).nullable(),
  parsedReceipt: ParsedReceiptSchema.nullable(),
  followupAnswers: z.record(z.string(), z.string()),
  draft: ReimbursementDraftSchema.nullable(),
  finalNote: FinalSubmissionNoteSchema.nullable(),
  error: z.string().nullable(),
  loading: z.boolean(),
});

export type AppRunState = z.infer<typeof AppRunStateSchema>;

export const defaultAppState: AppRunState = {
  step: "landing",
  inputMethod: null,
  parsedReceipt: null,
  followupAnswers: {},
  draft: null,
  finalNote: null,
  error: null,
  loading: false,
};
