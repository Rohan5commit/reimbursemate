"use client";

import { useApp } from "@/lib/state/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Receipt,
  FileText,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
} from "lucide-react";

export function LandingScreen() {
  const { setStep, setInputMethod } = useApp();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-xs font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Native Reimbursement Agent
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
          ReimburseMate
        </h1>

        <p className="text-lg text-[var(--muted-foreground)] mb-2">
          Turn messy receipts into structured reimbursement drafts — with AI extraction, policy checks, and human approval.
        </p>

        <p className="text-sm text-[var(--muted-foreground)]">
          Built for the Anna AI-Native App Hackathon.
        </p>
      </div>

      {/* Workflow Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-3xl w-full mb-12">
        {[
          { icon: Receipt, label: "Upload Receipt", desc: "Image, PDF, or manual entry" },
          { icon: Sparkles, label: "AI Extraction", desc: "Fields parsed automatically" },
          { icon: Shield, label: "Policy Checks", desc: "Automated rule validation" },
          { icon: CheckCircle, label: "Human Review", desc: "You approve before submit" },
        ].map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-3">
              <step.icon className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <h3 className="font-medium text-sm text-[var(--foreground)]">{step.label}</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          size="lg"
          onClick={() => {
            setInputMethod("upload");
            setStep("input");
          }}
        >
          <FileText className="h-5 w-5" />
          New Reimbursement
          <ArrowRight className="h-4 w-4" />
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            setInputMethod("demo");
            setStep("input");
          }}
        >
          <Sparkles className="h-5 w-5" />
          Try Demo
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => setStep("architecture")}
        >
          <Receipt className="h-5 w-5" />
          View Workflow
        </Button>
      </div>
    </div>
  );
}
