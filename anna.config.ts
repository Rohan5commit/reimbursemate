/**
 * Anna App Configuration
 *
 * This file defines the ReimburseMate app configuration for the Anna platform.
 * It declares the app identity, tool bindings, workflow steps, and human-in-the-loop
 * settings that the Anna runtime uses to orchestrate the reimbursement workflow.
 */
export default {
  /** App identity */
  app: {
    name: "ReimburseMate",
    slug: "reimbursemate",
    version: "1.0.0",
  },

  /** Runtime settings */
  runtime: {
    /** Max time (ms) before an LLM/tool call times out */
    timeoutMs: 60_000,
    /** Whether to auto-retry failed tool calls */
    autoRetry: false,
  },

  /** Tool bindings — maps workflow actions to bundled executas */
  tools: {
    extractReceipt: {
      executa: "receipt-extractor",
      method: "extract",
      description: "Extract structured fields from receipt text using the receipt-extractor tool",
    },
    extractFromImage: {
      executa: "receipt-extractor",
      method: "extract",
      description: "Extract structured fields from a receipt image using the receipt-extractor tool",
    },
  },

  /** Human-in-the-loop configuration */
  hitl: {
    /** Steps that require explicit human approval before proceeding */
    approvalSteps: ["review"],
    /** Whether the agent should pause and wait for human input */
    waitForHuman: true,
    /** Prompt shown to the human when approval is needed */
    approvalPrompt: "Please review the extracted reimbursement details and approve or reject.",
  },

  /** Workflow definition — describes the step sequence for the Anna agent */
  workflow: {
    steps: [
      {
        id: "input",
        name: "Receipt Input",
        description: "User provides a receipt image, text, or selects a demo preset.",
        type: "user_action",
      },
      {
        id: "extract",
        name: "AI Extraction",
        description: "The receipt-extractor tool parses the receipt and returns structured fields.",
        type: "tool_call",
        tool: "extractReceipt",
      },
      {
        id: "followup",
        name: "Missing Info",
        description: "User fills in any fields the AI could not extract.",
        type: "user_action",
      },
      {
        id: "policy_check",
        name: "Policy Validation",
        description: "Deterministic checks run against the draft (amounts, duplicates, required fields).",
        type: "validation",
      },
      {
        id: "review",
        name: "Human Review & Approval",
        description: "User reviews the full draft, edits if needed, and explicitly approves.",
        type: "hitl",
        requiresApproval: true,
      },
      {
        id: "final",
        name: "Export",
        description: "Final reimbursement summary is generated and exportable.",
        type: "output",
      },
    ],
  },
} as const;
