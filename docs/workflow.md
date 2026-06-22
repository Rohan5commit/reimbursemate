# ReimburseMate — User Workflow

## Step-by-Step Workflow

### 1. Open the App
- Landing screen shows value proposition and workflow overview
- Three entry points: "New Reimbursement", "Try Demo", "View Workflow"

### 2. Choose Input Method
- **Upload**: Select a receipt image (JPG/PNG) or PDF
- **Paste Text**: Paste receipt text or invoice details into a textarea
- **Manual Entry**: Skip AI extraction and fill fields directly
- **Demo Preset**: Click a pre-built scenario to see the full flow

### 3. AI Extraction (if using upload/paste)
- App sends data to NVIDIA NIM API
- AI extracts: merchant, amount, date, tax, currency, category, purpose, confidence
- Missing fields are flagged
- Extraction takes 2-5 seconds
- On failure: error shown with retry/manual-entry option

### 4. Complete Missing Fields
- App shows AI extraction results in a summary card
- Targeted follow-up questions for missing info:
  - Your name
  - Business purpose (required)
  - Project/team (optional)
  - Payment method
  - Approver name (optional)
  - Notes (optional)
- Only questions for actually missing fields are shown

### 5. Policy Checks (automatic)
- Deterministic rules run instantly
- Warnings and errors displayed on review screen
- Errors must be resolved before approval

### 6. Review & Approve
- Full draft displayed in structured card
- Edit any field by clicking "Edit"
- Re-run policy checks after edits
- Click "Approve Draft" to proceed
- Errors block approval with clear message

### 7. Final Export
- Approval status shown (Approved / Pending Review)
- Summary and checklist displayed
- Exportable plain-text note generated
- Download as .txt file
- "New Reimbursement" to start over
