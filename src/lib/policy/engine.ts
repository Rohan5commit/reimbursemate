import type { PolicyWarning } from "../schemas";
import { defaultPolicyConfig, type PolicyConfig } from "../schemas";

const REQUIRED_FIELDS = ["merchant", "amount", "date", "category", "purpose"];

const KNOWN_CATEGORIES = [
  "meals",
  "travel",
  "software",
  "office_supplies",
  "services",
  "entertainment",
  "other",
];

// Simple duplicate detection based on merchant + date + amount
const recentClaims: Array<{
  merchant: string;
  date: string;
  amount: number;
}> = [];

export function resetDuplicateTracking(): void {
  recentClaims.length = 0;
}

export function trackClaim(
  merchant: string,
  date: string,
  amount: number
): void {
  recentClaims.push({
    merchant: merchant.toLowerCase().trim(),
    date,
    amount,
  });
}

export function checkPolicy(fields: {
  merchant: string;
  amount: number;
  date: string;
  category: string;
  purpose: string;
  missingFields?: string[];
  hasReceipt?: boolean;
  submitterName?: string;
},
  config: PolicyConfig = defaultPolicyConfig
): PolicyWarning[] {
  const warnings: PolicyWarning[] = [];
  const { warningThreshold, approvalThreshold, missingReceiptThreshold } = config;

  // 1. Amount threshold warnings
  if (fields.amount > approvalThreshold) {
    warnings.push({
      code: "APPROVAL_REQUIRED",
      severity: "error",
      message: `Amount $${fields.amount.toFixed(2)} exceeds $${approvalThreshold} — requires manager approval.`,
      field: "amount",
    });
  } else if (fields.amount > warningThreshold) {
    warnings.push({
      code: "HIGH_AMOUNT",
      severity: "warning",
      message: `Amount $${fields.amount.toFixed(2)} is above $${warningThreshold} threshold.`,
      field: "amount",
    });
  }

  // 2. Missing receipt check
  if (fields.hasReceipt === false && fields.amount > missingReceiptThreshold) {
    warnings.push({
      code: "MISSING_RECEIPT",
      severity: "warning",
      message: "No receipt attached. Receipts are recommended for claims over $25.",
    });
  }

  // 3. Missing purpose check
  if (!fields.purpose || fields.purpose.trim().length < 3) {
    warnings.push({
      code: "MISSING_PURPOSE",
      severity: "error",
      message: "Business purpose is required for reimbursement.",
      field: "purpose",
    });
  }

  // 4. Duplicate detection (round to 2 decimal places for comparison)
  const roundedAmount = Math.round(fields.amount * 100) / 100;
  const isDuplicate = recentClaims.some(
    (c) =>
      c.merchant === fields.merchant.toLowerCase().trim() &&
      c.date === fields.date &&
      Math.abs(c.amount - roundedAmount) < 0.01
  );
  if (isDuplicate) {
    warnings.push({
      code: "POSSIBLE_DUPLICATE",
      severity: "warning",
      message: `A similar claim for ${fields.merchant} on ${fields.date} ($${fields.amount.toFixed(2)}) was already submitted.`,
    });
  }

  // 5. Unsupported category check
  if (
    fields.category &&
    !KNOWN_CATEGORIES.includes(fields.category.toLowerCase())
  ) {
    warnings.push({
      code: "UNSUPPORTED_CATEGORY",
      severity: "info",
      message: `Category "${fields.category}" is non-standard. It may require additional review.`,
      field: "category",
    });
  }

  // 6. Missing fields from AI extraction
  if (fields.missingFields && fields.missingFields.length > 0) {
    for (const mf of fields.missingFields) {
      if (REQUIRED_FIELDS.includes(mf)) {
        warnings.push({
          code: "MISSING_REQUIRED",
          severity: "error",
          message: `Required field "${mf}" could not be extracted and must be provided.`,
          field: mf,
        });
      }
    }
  }

  // 7. Zero, negative, or NaN amount
  if (isNaN(fields.amount) || fields.amount <= 0) {
    warnings.push({
      code: "INVALID_AMOUNT",
      severity: "error",
      message: "Amount must be a valid number greater than zero.",
      field: "amount",
    });
  }

  return warnings;
}

export function getNextAction(
  warnings: PolicyWarning[]
): string {
  const hasErrors = warnings.some((w) => w.severity === "error");
  const hasApprovalRequired = warnings.some(
    (w) => w.code === "APPROVAL_REQUIRED"
  );

  if (hasApprovalRequired) {
    return "Manager approval required — submit for review.";
  }
  if (hasErrors) {
    return "Resolve errors before approving.";
  }
  return "Ready for review and approval.";
}
