"use client";

import { useState } from "react";
import { useApp } from "@/lib/state/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";

export function FollowupScreen() {
  const { state, setStep, setFollowupAnswer, generateDraft } = useApp();
  const { parsedReceipt, followupAnswers } = state;
  const fa = followupAnswers as Record<string, string>;

  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({
    purpose: parsedReceipt?.probablePurpose || "",
    submitterName: fa["submitterName"] || "",
    project: fa["project"] || "",
    paymentMethod: fa["paymentMethod"] || "company_card",
    approverName: fa["approverName"] || "",
    notes: fa["notes"] || "",
  });

  const handleFieldChange = (field: string, value: string) => {
    setLocalAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    if (!parsedReceipt) return;

    // Persist all answers
    Object.entries(localAnswers).forEach(([key, value]) => {
      setFollowupAnswer(key, value);
    });

    generateDraft(parsedReceipt, localAnswers);
  };

  const missingFields = parsedReceipt?.missingFields || [];
  const hasMissingRequired = missingFields.includes("purpose") && !localAnswers.purpose;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => setStep("input")} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Complete the Details</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          AI extracted most fields. Please verify and fill in anything missing.
        </p>
      </div>

      {/* AI Extraction Summary */}
      {parsedReceipt && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">AI Extraction Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[var(--muted)]">
                <p className="text-xs text-[var(--muted-foreground)]">Merchant</p>
                <p className="text-sm font-medium">{parsedReceipt.merchant || "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--muted)]">
                <p className="text-xs text-[var(--muted-foreground)]">Amount</p>
                <p className="text-sm font-medium">
                  ${parsedReceipt.amount.toFixed(2)} {parsedReceipt.currency}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--muted)]">
                <p className="text-xs text-[var(--muted-foreground)]">Date</p>
                <p className="text-sm font-medium">{parsedReceipt.date}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--muted)]">
                <p className="text-xs text-[var(--muted-foreground)]">Tax</p>
                <p className="text-sm font-medium">
                  {parsedReceipt.tax ? `$${parsedReceipt.tax.toFixed(2)}` : "—"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--muted)]">
                <p className="text-xs text-[var(--muted-foreground)]">Category</p>
                <Badge variant="info">{parsedReceipt.probableCategory}</Badge>
              </div>
              <div className="p-3 rounded-lg bg-[var(--muted)]">
                <p className="text-xs text-[var(--muted-foreground)]">Confidence</p>
                <p className="text-sm font-medium">
                  {Math.round(parsedReceipt.confidence * 100)}%
                </p>
              </div>
            </div>

            {missingFields.length > 0 && (
              <Alert variant="warning" className="mt-4">
                <strong>Missing fields:</strong> {missingFields.join(", ")}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Follow-up Questions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HelpCircle className="h-5 w-5 text-[var(--primary)]" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="submitterName"
            label="Your Name"
            placeholder="e.g. Alex Chen"
            value={localAnswers.submitterName}
            onChange={(e) => handleFieldChange("submitterName", e.target.value)}
          />

          <Input
            id="purpose"
            label="Business Purpose"
            placeholder="e.g. Team lunch for Q3 planning"
            value={localAnswers.purpose}
            onChange={(e) => handleFieldChange("purpose", e.target.value)}
            error={hasMissingRequired ? "Business purpose is required" : undefined}
          />

          <Input
            id="project"
            label="Project / Team (optional)"
            placeholder="e.g. Product Design"
            value={localAnswers.project}
            onChange={(e) => handleFieldChange("project", e.target.value)}
          />

          <Select
            id="paymentMethod"
            label="Payment Method"
            value={localAnswers.paymentMethod}
            onChange={(e) => handleFieldChange("paymentMethod", e.target.value)}
            options={[
              { value: "company_card", label: "Company Card" },
              { value: "personal_card", label: "Personal Card" },
              { value: "cash", label: "Cash" },
              { value: "bank_transfer", label: "Bank Transfer" },
            ]}
          />

          <Input
            id="approverName"
            label="Approver Name (optional)"
            placeholder="e.g. Manager name"
            value={localAnswers.approverName}
            onChange={(e) => handleFieldChange("approverName", e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Notes (optional)
            </label>
            <textarea
              placeholder="Any additional notes..."
              value={localAnswers.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              className="w-full h-20 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleContinue}
        className="w-full"
        size="lg"
        disabled={!localAnswers.purpose.trim()}
      >
        Generate Reimbursement Draft
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
