# ReimburseMate — Architecture

## System Overview

ReimburseMate is a single-page React application built with Next.js 16, TypeScript, and Tailwind CSS. It uses the NVIDIA NIM API for AI-powered receipt extraction and a deterministic policy engine for reimbursement rules. The app follows a state-machine workflow with mandatory human review.

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Landing    │────▶│    Input      │────▶│  Follow-up   │
│   Screen     │     │  (upload/     │     │  (missing    │
│              │     │   paste/demo) │     │   fields)    │
└─────────────┘     └──────────────┘     └──────────────┘
                                              │
                                              ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Final      │◀────│   Review &   │◀────│   Policy     │
│   Export     │     │   Approve    │     │   Checks     │
│   Screen     │     │              │     │   (auto)     │
└─────────────┘     └──────────────┘     └──────────────┘
```

## AI Extraction Flow

1. User provides receipt data (image, PDF text, or pasted text)
2. `nim-client.ts` sends structured prompt to NVIDIA NIM (`nvidia/llama-3.1-nemotron-70b-instruct`)
3. For images, uses `nvidia/neva-22b` vision model
4. Response is parsed as JSON and validated against `ParsedReceiptSchema`
5. Invalid outputs trigger retry/manual-entry path — never silently corrupt state

### Prompt Design
- System message constrains output to valid JSON only
- Few-shot examples ensure consistent field extraction
- Temperature set to 0.1 for deterministic results
- `response_format: { type: "json_object" }` enforces JSON output

## Policy-Check Flow

Policy checks are **fully deterministic** — no AI involvement:

1. **Amount thresholds**: Warn at $75, require approval at $150
2. **Missing receipt**: Flag for claims > $25 without receipt
3. **Business purpose**: Required for all claims
4. **Duplicate detection**: Matches merchant + date + amount
5. **Category validation**: Flags non-standard categories
6. **Invalid data**: Rejects zero/negative amounts

Checks run in `policy/engine.ts` and produce `PolicyWarning[]` that drive the UI.

## State Flow

State is managed via React Context (`state/store.ts`):

```
AppRunState {
  step: landing | input | extracting | followup | review | final | architecture
  inputMethod: upload | manual | demo | null
  parsedReceipt: ParsedReceipt | null
  followupAnswers: Record<string, string>
  draft: ReimbursementDraft | null
  finalNote: FinalSubmissionNote | null
  error: string | null
  loading: boolean
}
```

No external state library needed — the workflow is linear and single-instance.

## Review Flow

1. Draft screen shows all extracted + user-supplied fields
2. Policy warnings displayed with severity icons
3. AI confidence score shown as badge
4. User can edit any field inline
5. Edits re-trigger policy checks
6. Errors block approval; warnings are informational
7. User explicitly clicks "Approve" to proceed
8. Final screen generates exportable note
