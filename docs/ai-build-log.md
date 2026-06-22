# ReimburseMate — AI Build Log

## Development Process

### Phase 1: Project Setup
- Initialized Next.js 16 project with TypeScript and Tailwind CSS
- Configured Zod for schema validation
- Set up project structure following Anna-native patterns

### Phase 2: Data Models
- Defined 8 core types with Zod schemas:
  - `ExpenseInput`, `ParsedReceipt`, `MissingField`, `PolicyWarning`
  - `ReimbursementDraft`, `ReviewAction`, `FinalSubmissionNote`, `AppRunState`
- All data flows through validated schemas — no unstructured data

### Phase 3: AI Integration
- Built NVIDIA NIM client with OpenAI-compatible API
- Designed structured extraction prompts for receipt parsing
- Implemented image OCR via `nvidia/neva-22b` vision model
- Added schema validation on all AI outputs
- Implemented retry/manual-entry fallback on extraction failure

### Phase 4: Policy Engine
- Built deterministic policy engine (no AI dependency)
- Implemented 6 policy checks:
  - Amount threshold warnings/approvals
  - Missing receipt detection
  - Business purpose requirement
  - Duplicate detection (merchant + date + amount)
  - Category validation
  - Invalid amount rejection

### Phase 5: UI Implementation
- Built 6 screens: Landing, Input, Follow-up, Review, Final, Architecture
- Created reusable UI components: Card, Button, Input, Select, Badge, Alert
- Implemented step indicator and app shell navigation
- Added settings modal for API key configuration

### Phase 6: Demo & Polish
- Created 7 demo presets covering all policy scenarios
- Added loading states and error handling
- Implemented export functionality
- Created comprehensive documentation

## Key Technical Decisions

1. **React Context over Redux/Zustand**: Single linear workflow doesn't need complex state management
2. **Deterministic policy rules**: AI assists with extraction, but rules are code-based
3. **Schema validation everywhere**: Zod validates AI output before it touches app state
4. **No external storage**: Browser localStorage for API key, in-memory state for workflow
5. **NVIDIA NIM only**: No fallback to other providers — hackathon constraint

## AI Model Choices

- **nvidia/llama-3.1-nemotron-70b-instruct**: Best for structured text extraction
- **nvidia/neva-22b**: Vision model for receipt image OCR
