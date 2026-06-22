# ReimburseMate — Scoring Rationale

## What We Built Well

### Focused, Practical Scope
ReimburseMate solves a real, narrow problem: turning messy receipts into clean reimbursement submissions. The workflow is Receipt → Extraction → Review → Export — no unnecessary detours. The 7 demo presets cover every policy scenario without requiring real receipts to demo.

### AI Used as a Tool, Not a Gimmick
AI extracts structured data from unstructured receipt images and text, then assigns confidence scores. It suggests categories and business purposes. Critically, deterministic rules handle policy enforcement — AI doesn't make compliance decisions. This separation of concerns keeps the system predictable.

### Human Review Is Mandatory
The approval step cannot be skipped. Every draft goes through a full review screen where the user can edit fields before saving. Anna's session primitives present the draft for human approval — this isn't a "send and forget" workflow.

### Real Deliverable
The app generates a downloadable reimbursement note with all extracted data, policy checks, and approval status. It's not just a demo — it's a functional prototype that could be extended.

### Type Safety and Validation
Full TypeScript with Zod schemas validated at every boundary: AI output, user input, and policy engine. Schema-validated AI output means no silent failures from malformed model responses.

## What We'd Improve With More Time

### No Real Anna Runtime Integration Yet
The Anna SDK imports are wired up and the code paths are correct, but we haven't tested against a live Anna instance. The `app.json` and `manifest.json` are structured for Anna's tool registration system, but we haven't validated the full tool-call round-trip. This would be the first thing to fix.

### No Authentication or Multi-User Support
There's no concept of "who submitted this." In production, you'd want user identity tied to submissions, approval routing to managers, and role-based access. Right now it's single-user only.

### Policy Engine Is Simple
The threshold-based rules work but don't cover edge cases like weekend submissions, currency conversion, or per-category limits. A production version would need a more expressive rules engine.

### No Persistent Backend
All state lives in localStorage. Submissions don't survive across devices or browsers. A real deployment would need a database, likely with row-level security for multi-tenant access.

### Confidence Scores Are Untuned
The AI returns confidence values, but there's no calibration or feedback loop. We don't know if a "0.9 confidence" actually means 90% accurate. In production, you'd want to track prediction accuracy and tune thresholds.

### Image OCR Is Single-Pass
We send the image once to the vision model and accept whatever it returns. A more robust approach would run multiple passes, compare results, and flag low-agreement fields for manual entry.

## Key Design Decisions

1. **AI + Deterministic Rules**: AI handles extraction (messy → structured), rules handle policy (structured → pass/fail). Neither tries to do the other's job.
2. **Human Review Required**: The system can't auto-approve. Even perfect extractions go through the review screen.
3. **Demo Presets**: Show all scenarios without needing real receipts — important for quick evaluation.
4. **Export as Artifact**: The reimbursement note is a real deliverable, not just a summary screen.

## The Story

People waste time turning messy receipts into clean reimbursement submissions. AI can extract and structure messy inputs, but human review is still necessary. Anna is a good fit because it supports UI, tools, state, permissions, and human-in-the-loop workflows. ReimburseMate is a practical AI-native app — not a static form or a chatbot, but a workflow that knows when to ask for help.
