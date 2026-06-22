"use client";

import { useApp } from "@/lib/state/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import {
  Download,
  CheckCircle,
  AlertTriangle,
  FileText,
  RotateCcw,
} from "lucide-react";

export function FinalScreen() {
  const { state, setStep, reset } = useApp();
  const { finalNote, draft } = state;

  if (!finalNote || !draft) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Alert variant="error">No final note found. Please complete a reimbursement first.</Alert>
        <Button onClick={() => setStep("landing")} className="mt-4">
          Go Home
        </Button>
      </div>
    );
  }

  const handleExport = () => {
    const blob = new Blob([finalNote.exportableNote], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reimbursement-${finalNote.draftId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const completeCount = finalNote.checklist.filter((c) => c.status === "complete").length;
  const totalCount = finalNote.checklist.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Reimbursement Complete</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Your AI-extracted, human-reviewed reimbursement is ready.
        </p>
      </div>

      {/* Approval Status */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex flex-col items-center text-center">
            {finalNote.approvalStatus === "approved" ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-emerald-700">Approved</h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  This reimbursement meets all policy requirements.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-amber-700">Pending Review</h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  This reimbursement requires additional review.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-[var(--primary)]" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--foreground)] leading-relaxed">
            {finalNote.summary}
          </p>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Checklist</CardTitle>
          <Badge variant={completeCount === totalCount ? "success" : "warning"}>
            {completeCount}/{totalCount} complete
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {finalNote.checklist.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0"
              >
                {item.status === "complete" ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                ) : item.status === "warning" ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                ) : (
                  <span className="h-4 w-4 flex items-center justify-center text-red-600 flex-shrink-0">✗</span>
                )}
                <span
                  className={`text-sm ${
                    item.status === "complete"
                      ? "text-[var(--foreground)]"
                      : item.status === "warning"
                      ? "text-amber-700"
                      : "text-red-700"
                  }`}
                >
                  {item.item}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exportable Note Preview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Export Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs text-[var(--foreground)] bg-[var(--muted)] rounded-lg p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
            {finalNote.exportableNote}
          </pre>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleExport} className="flex-1" size="lg">
          <Download className="h-5 w-5" />
          Export Note
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            reset();
            setStep("landing");
          }}
        >
          <RotateCcw className="h-5 w-5" />
          New Reimbursement
        </Button>
      </div>
    </div>
  );
}
