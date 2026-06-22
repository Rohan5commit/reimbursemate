"use client";

import { useState } from "react";
import { useApp } from "@/lib/state/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { checkPolicy, getNextAction } from "@/lib/policy/engine";
import { connectAnna, isRunningInAnna } from "@/lib/anna/runtime";

import {
  ArrowLeft,
  Edit3,
  CheckCircle,
  Shield,
  Sparkles,
} from "lucide-react";

export function ReviewScreen() {
  const { state, setDraft, setStep, generateFinalNote, policyConfig } = useApp();
  const { draft } = state;

  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    merchant: draft?.merchant || "",
    amount: draft?.amount.toString() || "",
    date: draft?.date || "",
    category: draft?.category || "",
    purpose: draft?.purpose || "",
    notes: draft?.notes || "",
  });

  if (!draft) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Alert variant="error">No draft found. Please start a new reimbursement.</Alert>
        <Button onClick={() => setStep("landing")} className="mt-4">
          Go Home
        </Button>
      </div>
    );
  }

  const handleSaveEdits = () => {
    const parsedAmount = parseFloat(editValues.amount);
    const updatedDraft = {
      ...draft,
      merchant: editValues.merchant,
      amount: isNaN(parsedAmount) ? draft.amount : parsedAmount,
      date: editValues.date,
      category: editValues.category,
      purpose: editValues.purpose,
      notes: editValues.notes,
    };

    // Re-run policy checks with updated values (using current config)
    const newWarnings = checkPolicy({
      merchant: updatedDraft.merchant,
      amount: updatedDraft.amount,
      date: updatedDraft.date,
      category: updatedDraft.category,
      purpose: updatedDraft.purpose,
      hasReceipt: true,
      submitterName: updatedDraft.submitterName,
    }, policyConfig);

    updatedDraft.warnings = newWarnings;
    updatedDraft.nextAction = getNextAction(newWarnings);
    updatedDraft.status = newWarnings.some((w) => w.severity === "error")
      ? "review"
      : "draft";

    setDraft(updatedDraft);
    setEditing(false);
  };

  const [approvalPending, setApprovalPending] = useState(false);
  const [approvalResult, setApprovalResult] = useState<string | null>(null);

  const handleApprove = async () => {
    setApprovalPending(true);
    setApprovalResult(null);

    try {
      const anna = await connectAnna();

      if (isRunningInAnna()) {
        // Use Anna's human-in-the-loop primitive: create an agent session
        // that presents the draft to the platform for human approval
        const session = await anna.agent.session.create({
          prompt: `Reimbursement draft ready for approval:\n` +
            `Merchant: ${draft.merchant}\n` +
            `Amount: $${draft.amount.toFixed(2)}\n` +
            `Date: ${draft.date}\n` +
            `Category: ${draft.category}\n` +
            `Purpose: ${draft.purpose}\n\n` +
            `Please review and approve or reject this reimbursement.`,
        });

        setApprovalResult(`Anna session ${session.session_id}: ${session.status}`);
        await anna.chat.write_message({
          content: `Reimbursement for ${draft.merchant} ($${draft.amount.toFixed(2)}) ${session.status}.`,
        });
      }

      // Regardless of mode, finalize the draft
      const approvedDraft = { ...draft, status: "approved" as const };
      setDraft(approvedDraft);
      generateFinalNote();
    } finally {
      setApprovalPending(false);
    }
  };

  const errorCount = draft.warnings.filter((w) => w.severity === "error").length;
  const warningCount = draft.warnings.filter((w) => w.severity === "warning").length;

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      meals: "Meals & Dining",
      travel: "Travel",
      software: "Software",
      office_supplies: "Office Supplies",
      services: "Services",
      entertainment: "Entertainment",
      other: "Other",
    };
    return labels[cat] || cat;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => setStep("followup")} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Review & Approve</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Review the AI-generated draft. Edit anything incorrect, then approve.
        </p>
      </div>

      {/* Confidence & Status */}
      <div className="flex items-center gap-3 mb-6">
        <Badge variant={draft.confidence >= 0.8 ? "success" : draft.confidence >= 0.5 ? "warning" : "error"}>
          <Sparkles className="h-3 w-3 mr-1" />
          AI Confidence: {Math.round(draft.confidence * 100)}%
        </Badge>
        <Badge variant={draft.status === "approved" ? "success" : "info"}>
          Status: {draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}
        </Badge>
      </div>

      {/* Policy Warnings */}
      {draft.warnings.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-[var(--primary)]" />
              Policy Checks
              {errorCount > 0 && (
                <Badge variant="error">{errorCount} error{errorCount > 1 ? "s" : ""}</Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="warning">{warningCount} warning{warningCount > 1 ? "s" : ""}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {draft.warnings.map((w, i) => (
              <Alert key={i} variant={w.severity === "error" ? "error" : w.severity === "warning" ? "warning" : "info"}>
                {w.message}
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Draft Details */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Reimbursement Draft</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(!editing)}
          >
            <Edit3 className="h-4 w-4" />
            {editing ? "Cancel" : "Edit"}
          </Button>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <Input
                id="edit-merchant"
                label="Merchant"
                value={editValues.merchant}
                onChange={(e) => setEditValues({ ...editValues, merchant: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="edit-amount"
                  label="Amount"
                  type="number"
                  step="0.01"
                  value={editValues.amount}
                  onChange={(e) => setEditValues({ ...editValues, amount: e.target.value })}
                />
                <Input
                  id="edit-date"
                  label="Date"
                  type="date"
                  value={editValues.date}
                  onChange={(e) => setEditValues({ ...editValues, date: e.target.value })}
                />
              </div>
              <Select
                id="edit-category"
                label="Category"
                value={editValues.category}
                onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                options={[
                  { value: "meals", label: "Meals & Dining" },
                  { value: "travel", label: "Travel" },
                  { value: "software", label: "Software" },
                  { value: "office_supplies", label: "Office Supplies" },
                  { value: "services", label: "Services" },
                  { value: "entertainment", label: "Entertainment" },
                  { value: "other", label: "Other" },
                ]}
              />
              <Input
                id="edit-purpose"
                label="Business Purpose"
                value={editValues.purpose}
                onChange={(e) => setEditValues({ ...editValues, purpose: e.target.value })}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[var(--foreground)]">Notes</label>
                <textarea
                  value={editValues.notes}
                  onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                  className="w-full h-20 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent resize-none"
                />
              </div>
              <Button onClick={handleSaveEdits} className="w-full">
                <CheckCircle className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "ID", value: draft.id },
                { label: "Submitter", value: draft.submitterName },
                { label: "Merchant", value: draft.merchant },
                { label: "Date", value: draft.date },
                {
                  label: "Amount",
                  value: `$${draft.amount.toFixed(2)} ${draft.currency}`,
                },
                {
                  label: "Tax",
                  value: draft.tax ? `$${draft.tax.toFixed(2)}` : "N/A",
                },
                { label: "Category", value: getCategoryLabel(draft.category) },
                { label: "Purpose", value: draft.purpose },
                { label: "Notes", value: draft.notes || "None" },
                { label: "Next Action", value: draft.nextAction },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-sm text-[var(--muted-foreground)]">{row.label}</span>
                  <span className="text-sm font-medium text-[var(--foreground)] text-right max-w-[60%]">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {/* Approval Status Banner */}
      {approvalResult && (
        <Alert variant="info" className="mb-4">
          {approvalResult}
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleApprove}
          className="flex-1"
          size="lg"
          disabled={errorCount > 0 || approvalPending}
        >
          <CheckCircle className="h-5 w-5" />
          {approvalPending ? "Submitting for Approval..." : "Approve Draft"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setStep("input")}
        >
          Start Over
        </Button>
      </div>

      {errorCount > 0 && (
        <p className="text-sm text-[var(--destructive)] text-center mt-3">
          Resolve all errors before approving.
        </p>
      )}
    </div>
  );
}
