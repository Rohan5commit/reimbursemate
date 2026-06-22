# ReimburseMate

**AI-Native Reimbursement Agent for the Anna App Hackathon**

> Turn messy receipts into structured reimbursement drafts — with AI extraction, policy checks, and human approval.

## What ReimburseMate Does

ReimburseMate is a focused, Anna-native AI app that takes receipts, invoices, or expense notes and turns them into clean, policy-compliant reimbursement submissions.

### The Flow

1. **Upload** a receipt image, paste text, or try a demo preset
2. **AI extracts** merchant, amount, date, tax, category, and purpose
3. **Answer** targeted follow-up questions for missing fields
4. **Policy checks** run automatically (thresholds, duplicates, missing info)
5. **Review** the full draft with all fields, warnings, and confidence scores
6. **Edit** anything incorrect before approving
7. **Export** a formatted reimbursement note

## Why This Fits Anna

ReimburseMate uses the Anna platform's real SDK integration:

- **Anna Runtime** — `AnnaAppRuntime.connect()` via the Host API, with automatic detection of Anna-hosted vs standalone mode
- **Receipt-Extractor Executa** — A Python tool registered in `app.json` and `manifest.json`, invoked via `anna.tools.invoke()`
- **Chat Integration** — Extraction progress logged via `anna.chat.write_message()`
- **Human-in-the-Loop** — Approval uses `anna.agent.session.create()` for Anna's native HITL primitive
- **Window Management** — Title set via `anna.window.set_title()` when running inside Anna
- **Deterministic policy rules** that don't depend on AI
- **Clean, focused UI** designed for a single valuable workflow

## How AI Is Used

| Feature | Model | Purpose |
|---------|-------|---------|
| Receipt text extraction | `nvidia/llama-3.1-nemotron-70b-instruct` | Parse receipt text into structured fields |
| Image receipt extraction | `nvidia/llama-3.2-90b-vision-instruct` | Read receipt images and extract structured fields |
| Category suggestion | Text model | Suggest expense category from receipt context |
| Purpose suggestion | Text model | Infer business purpose from receipt data |
| Confidence scoring | Text model | Rate extraction reliability (0-100%) |

All AI calls are routed through a **server-side Next.js API route** (`/api/extract`), keeping the API key secure. In Anna mode, extraction goes through `anna.tools.invoke()` instead.

**Policy checks are fully deterministic** — no AI involvement in rule evaluation.

## How Policy Checks Work

The policy engine runs these deterministic rules:

- **Amount > $75**: Warning
- **Amount > $150**: Requires manager approval
- **Missing receipt** (claims > $25): Warning
- **Missing business purpose**: Error (blocks approval)
- **Duplicate detection**: Matches merchant + date + amount
- **Unsupported category**: Info flag
- **Zero/negative amount**: Error

## Human Review

This is the core of the app. The review screen shows:

- All extracted and user-supplied fields
- Policy warnings with severity levels
- AI confidence score
- Edit capability for any field
- Policy checks re-run after edits
- Errors block approval until resolved

In Anna mode, approval is submitted via `anna.agent.session.create()`. In standalone mode, the human clicks "Approve" directly.

**The AI never submits anything.** A human must approve.

## Setup

### Prerequisites

- Node.js 18+
- NVIDIA NIM API key ([get one here](https://build.nvidia.com))

### Install

```bash
cd reimbursemate
npm install
```

### Environment Variables

Create `.env.local`:

```bash
NVIDIA_NIM_API_KEY=nvapi-your-key-here
```

Or configure via the in-app Settings modal (stored in localStorage, used in standalone mode).

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Test

```bash
npm test
```

## Demo Presets

7 pre-built scenarios that showcase all policy scenarios:

| Preset | Scenario | Triggers |
|--------|----------|----------|
| ☕ Café Team Lunch | Team lunch receipt | Standard flow |
| 💻 Software Subscription | SaaS invoice | Software category |
| 🚕 Travel Taxi | Airport transfer | Travel category |
| 📦 Office Supplies | Supply purchase | Office category |
| ❓ Missing Purpose | No purpose provided | Missing purpose error |
| ⚠️ Above Threshold | $385 flight | Approval required error |
| 🔄 Duplicate Receipt | Same as café preset | Duplicate detection warning |

## Anna Platform Files

| File | Purpose |
|------|---------|
| `app.json` | Store metadata, app identity, bundled executa declarations |
| `manifest.json` | Runtime permissions, host_api whitelist, HITL config, static-spa bundle |
| `anna.config.ts` | App config: tool bindings, workflow steps, HITL settings |
| `src/lib/anna/runtime.ts` | `AnnaAppRuntime.connect()` wrapper with standalone fallback |
| `src/lib/anna/types.ts` | TypeScript types for the Anna Host API |
| `src/app/api/extract/route.ts` | Server-side NVIDIA NIM extraction endpoint |
| `executas/receipt-extractor/` | Python executa implementing JSON-RPC 2.0 over stdio |

## Limitations

- Requires NVIDIA NIM API key for AI features
- No backend storage — state is in-memory
- No multi-user support
- Policy rules are now configurable via the Settings modal

## Tech Stack

- **Next.js 16** + **React 19** — App framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Zod** — Schema validation
- **NVIDIA NIM** — AI inference (text + vision)
- **Anna Platform SDK** — Runtime, tools, HITL, chat
- **Anna Executa Protocol** — JSON-RPC 2.0 tool interface
- **Lucide React** — Icons

## Documentation

- [Architecture](docs/architecture.md) — System design
- [Workflow](docs/workflow.md) — User flow
- [Demo Script](docs/demo-script.md) — 2-3 minute presentation
- [Setup](docs/setup.md) — Installation guide
- [Prompts Used](docs/prompts-used.md) — AI prompt design
- [AI Build Log](docs/ai-build-log.md) — Development record
- [Judging Hook](docs/judging-hook.md) — Why this scores well
- [Credits](docs/credits.md) — Attribution
