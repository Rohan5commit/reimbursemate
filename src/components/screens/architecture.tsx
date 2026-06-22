"use client";

import { useApp } from "@/lib/state/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Sparkles,
  Shield,
  Eye,
  Database,
  Zap,
  Brain,
  CheckCircle,
  Users,
  Layers,
} from "lucide-react";

export function ArchitectureScreen() {
  const { setStep } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => setStep("landing")} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          Architecture & Workflow
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          How ReimburseMate works — for judges and reviewers.
        </p>
      </div>

      {/* What It Does */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-5 w-5 text-[var(--primary)]" />
            What ReimburseMate Does
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--foreground)] leading-relaxed">
            ReimburseMate is an Anna-native AI reimbursement agent. It takes messy receipts,
            invoices, or expense notes and turns them into structured reimbursement drafts — with
            AI-powered extraction, deterministic policy checks, and mandatory human approval
            before final submission.
          </p>
        </CardContent>
      </Card>

      {/* Where AI Is Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-[var(--primary)]" />
            Where AI Is Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              label: "Receipt Text Extraction",
              desc: "NVIDIA NIM parses receipt text and extracts merchant, amount, date, tax, and category.",
            },
            {
              label: "Image OCR (Vision)",
              desc: "NVIDIA NIM vision model reads receipt images and extracts structured fields.",
            },
            {
              label: "Category Suggestion",
              desc: "AI suggests the most likely expense category based on merchant and items.",
            },
            {
              label: "Purpose Suggestion",
              desc: "AI infers a probable business purpose from receipt context.",
            },
            {
              label: "Confidence Scoring",
              desc: "AI provides a confidence score for each extraction, flagging uncertain fields.",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--muted)]">
              <Sparkles className="h-4 w-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Where Deterministic Logic Is Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5 text-[var(--primary)]" />
            Where Deterministic Policy Logic Is Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              label: "Amount Threshold Checks",               desc: "Configurable thresholds (default: warn above $75, approval above $150). Users can customize via Settings.",
            },
            {
              label: "Missing Receipt Detection",
              desc: "Flags missing receipts for claims over $25.",
            },
            {
              label: "Business Purpose Required",
              desc: "Ensures purpose is provided before approval.",
            },
            {
              label: "Duplicate Detection",
              desc: "Detects matching merchant + date + amount combinations.",
            },
            {
              label: "Category Validation",
              desc: "Flags non-standard categories for review.",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--muted)]">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* State Management */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-5 w-5 text-[var(--primary)]" />
            Where Saved State Is Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              label: "App Run State",
              desc: "Tracks the current step: landing → input → extraction → followup → review → final.",
            },
            {
              label: "Parsed Receipt Data",
              desc: "Persists AI-extracted fields throughout the workflow.",
            },
            {
              label: "Follow-up Answers",
              desc: "Stores user-provided missing information (purpose, submitter, etc.).",
            },
            {
              label: "Draft Object",
              desc: "The structured reimbursement draft drives the review UI.",
            },
            {
              label: "Final Submission Note",
              desc: "Generated summary, checklist, and exportable output.",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--muted)]">
              <Database className="h-4 w-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Human Review */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-5 w-5 text-[var(--primary)]" />
            Where Human Review Happens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              label: "Review Screen",
              desc: "User sees all extracted fields, policy warnings, and confidence scores before approving.",
            },
            {
              label: "Edit Capability",
              desc: "Any field can be corrected before approval — AI extraction is never blindly trusted.",
            },
            {
              label: "Mandatory Approval",
              desc: "Drafts with errors cannot be approved until resolved. Human clicks 'Approve' explicitly.",
            },
            {
              label: "Final Export Review",
              desc: "User reviews the final checklist and summary before exporting.",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--muted)]">
              <Eye className="h-4 w-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Why This Fits Anna */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-5 w-5 text-[var(--primary)]" />
            Why This Fits Anna
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[var(--foreground)] leading-relaxed">
            ReimburseMate is more than a chatbot — it&apos;s a structured, stateful workflow with:
          </p>
          <ul className="space-y-2 text-sm text-[var(--foreground)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)] font-bold">•</span>
              Visible state at every step
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)] font-bold">•</span>
              AI tools that participate in the workflow
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)] font-bold">•</span>
              Deterministic policy rules that don&apos;t depend on AI
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)] font-bold">•</span>
              Human-in-the-loop review before any submission
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)] font-bold">•</span>
              Clean, focused UI designed for a single valuable workflow
            </li>
          </ul>
          <p className="text-sm text-[var(--foreground)] leading-relaxed mt-2">
            This is exactly the kind of focused, practical AI-native app that Anna is designed to support.
          </p>
        </CardContent>
      </Card>

      {/* Anna Platform Integration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-5 w-5 text-[var(--primary)]" />
            Anna Platform Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              label: "Anna Runtime Connection",
              desc: "App connects to AnnaHostRuntime.connect() via the Host API SDK. Detects Anna-hosted vs standalone mode automatically.",
            },
            {
              label: "Receipt-Extractor Executa",
              desc: "Registered as a bundled tool in app.json and manifest.json. Implements JSON-RPC 2.0 over stdio. Called via anna.tools.invoke().",
            },
            {
              label: "Chat Integration",
              desc: "Uses anna.chat.write_message() to log extraction progress and results to the Anna chat stream.",
            },
            {
              label: "Human-in-the-Loop Approval",
              desc: "Uses anna.agent.session.create() to present drafts for human approval through Anna's native HITL primitive.",
            },
            {
              label: "Window Management",
              desc: "Uses anna.window.set_title() to set the app title when running inside Anna.",
            },
            {
              label: "Dual-Mode Architecture",
              desc: "Runs as a full Anna app inside the platform, or standalone with direct NIM API calls and localStorage fallback.",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--muted)]">
              <Sparkles className="h-4 w-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Anna Configuration Files */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-5 w-5 text-[var(--primary)]" />
            Anna Configuration Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { file: "app.json", desc: "Store metadata, app identity, and bundled executa declarations" },
            { file: "manifest.json", desc: "Runtime permissions, host_api whitelist, HITL config, and static-spa bundle format" },
            { file: "anna.config.ts", desc: "App config: tool bindings, workflow steps, HITL settings, and runtime options" },
            { file: "src/lib/anna/runtime.ts", desc: "AnnaAppRuntime.connect() wrapper with standalone fallback" },
            { file: "src/lib/anna/types.ts", desc: "TypeScript types for the Anna Host API (LLM, tools, chat, agent, storage, window)" },
            { file: "executas/receipt-extractor/", desc: "Python executa implementing JSON-RPC 2.0 over stdio for receipt parsing" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-sm font-mono font-medium text-[var(--foreground)]">{item.file}</span>
              <span className="text-xs text-[var(--muted-foreground)] text-right max-w-[60%]">{item.desc}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-[var(--primary)]" />
            Tech Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              "Next.js 16",
              "React 19",
              "TypeScript",
              "Tailwind CSS",
              "Zod",
              "NVIDIA NIM",
              "Anna Platform SDK",
              "Anna Executa Protocol",
              "Lucide Icons",
            ].map((tech) => (
              <Badge key={tech} variant="info" className="justify-center py-1.5">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
