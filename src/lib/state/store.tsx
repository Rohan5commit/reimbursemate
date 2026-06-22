"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  AppRunState,
  ParsedReceipt,
  ReimbursementDraft,
  FinalSubmissionNote,
  PolicyConfig,
} from "../schemas";
import { defaultAppState, defaultPolicyConfig } from "../schemas";
import { checkPolicy, getNextAction, trackClaim, resetDuplicateTracking } from "../policy/engine";

function loadPersistedState(): AppRunState {
  if (typeof window === "undefined") return defaultAppState;
  try {
    const raw = localStorage.getItem("reimbursemate_app_state");
    if (!raw) return defaultAppState;
    const parsed = JSON.parse(raw);
    // Only restore meaningful fields; always reset transient ones
    return {
      ...defaultAppState,
      step: parsed.step || "landing",
      inputMethod: parsed.inputMethod || null,
      parsedReceipt: parsed.parsedReceipt || null,
      followupAnswers: parsed.followupAnswers || {},
      draft: parsed.draft || null,
      finalNote: parsed.finalNote || null,
    };
  } catch {
    return defaultAppState;
  }
}

function loadPolicyConfig(): PolicyConfig {
  if (typeof window === "undefined") return defaultPolicyConfig;
  try {
    const raw = localStorage.getItem("reimbursemate_policy_config");
    if (!raw) return defaultPolicyConfig;
    const parsed = JSON.parse(raw);
    return {
      warningThreshold: typeof parsed.warningThreshold === "number" ? parsed.warningThreshold : defaultPolicyConfig.warningThreshold,
      approvalThreshold: typeof parsed.approvalThreshold === "number" ? parsed.approvalThreshold : defaultPolicyConfig.approvalThreshold,
      missingReceiptThreshold: typeof parsed.missingReceiptThreshold === "number" ? parsed.missingReceiptThreshold : defaultPolicyConfig.missingReceiptThreshold,
    };
  } catch {
    return defaultPolicyConfig;
  }
}

interface AppContextValue {
  state: AppRunState;
  policyConfig: PolicyConfig;
  setStep: (step: AppRunState["step"]) => void;
  setInputMethod: (method: AppRunState["inputMethod"]) => void;
  setParsedReceipt: (receipt: ParsedReceipt | null) => void;
  setFollowupAnswer: (key: string, value: string) => void;
  setDraft: (draft: ReimbursementDraft | null) => void;
  setFinalNote: (note: FinalSubmissionNote | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setPolicyConfig: (config: PolicyConfig) => void;
  generateDraft: (receipt: ParsedReceipt, answers: Record<string, string>) => void;
  generateFinalNote: () => void;
  reset: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppRunState>(loadPersistedState);
  const [policyConfig, setPolicyConfigState] = useState<PolicyConfig>(loadPolicyConfig);

  const setPolicyConfig = useCallback((config: PolicyConfig) => {
    setPolicyConfigState(config);
    if (typeof window !== "undefined") {
      localStorage.setItem("reimbursemate_policy_config", JSON.stringify(config));
    }
  }, []);

  // Persist app state to localStorage on every change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("reimbursemate_app_state", JSON.stringify(state));
    }
  }, [state]);

  const setStep = useCallback((step: AppRunState["step"]) => {
    setState((s) => ({ ...s, step }));
  }, []);

  const setInputMethod = useCallback((method: AppRunState["inputMethod"]) => {
    setState((s) => ({ ...s, inputMethod: method }));
  }, []);

  const setParsedReceipt = useCallback((receipt: ParsedReceipt | null) => {
    setState((s) => ({ ...s, parsedReceipt: receipt }));
  }, []);

  const setFollowupAnswer = useCallback((key: string, value: string) => {
    setState((s) => ({
      ...s,
      followupAnswers: { ...s.followupAnswers, [key]: value },
    }));
  }, []);

  const setDraft = useCallback((draft: ReimbursementDraft | null) => {
    setState((s) => ({ ...s, draft }));
  }, []);

  const setFinalNote = useCallback((note: FinalSubmissionNote | null) => {
    setState((s) => ({ ...s, finalNote: note }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((s) => ({ ...s, error }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((s) => ({ ...s, loading }));
  }, []);

  const generateDraft = useCallback(
    (receipt: ParsedReceipt, answers: Record<string, string>) => {
      const warnings = checkPolicy({
        merchant: receipt.merchant,
        amount: receipt.amount,
        date: receipt.date,
        category: receipt.probableCategory,
        purpose: answers.purpose || receipt.probablePurpose,
        missingFields: receipt.missingFields,
        hasReceipt: true,
        submitterName: answers.submitterName || "Current User",
      }, policyConfig);

      const nextAction = getNextAction(warnings);

      const draft: ReimbursementDraft = {
        id: `REIMB-${Date.now()}`,
        submitterName: answers.submitterName || "Current User",
        merchant: receipt.merchant,
        date: receipt.date,
        amount: receipt.amount,
        currency: receipt.currency,
        category: receipt.probableCategory,
        purpose: answers.purpose || receipt.probablePurpose,
        notes: answers.notes || "",
        tax: receipt.tax,
        warnings,
        status: warnings.some((w) => w.severity === "error")
          ? "review"
          : "draft",
        nextAction,
        createdAt: new Date().toISOString(),
        confidence: receipt.confidence,
        aiExtracted: true,
      };

      trackClaim(receipt.merchant, receipt.date, receipt.amount);
      setState((s) => ({ ...s, draft, step: "review" }));
    },
    [policyConfig]
  );

  const generateFinalNote = useCallback(() => {
    setState((s) => {
      if (!s.draft) return s;

      const completedItems = [
        "Merchant/vendor identified",
        "Amount extracted",
        "Date recorded",
        s.draft.category !== "uncategorized" ? "Category assigned" : null,
        s.draft.purpose ? "Business purpose provided" : null,
        s.draft.tax ? "Tax recorded" : null,
      ].filter((x): x is string => x !== null);

      const missingItems = [
        s.draft.warnings.some((w) => w.code === "MISSING_RECEIPT")
          ? "Receipt attachment"
          : null,
        s.draft.warnings.some((w) => w.code === "MISSING_PURPOSE")
          ? "Business purpose"
          : null,
        s.draft.warnings.some((w) => w.code === "APPROVAL_REQUIRED")
          ? "Manager approval"
          : null,
      ].filter((x): x is string => x !== null);

      const checklist = [
        ...completedItems.map((item) => ({ item, status: "complete" as const })),
        ...missingItems.map((item) => ({ item, status: "missing" as const })),
        ...s.draft.warnings
          .filter(
            (w) =>
              w.severity === "warning" &&
              w.code !== "MISSING_RECEIPT" &&
              w.code !== "MISSING_PURPOSE"
          )
          .map((w) => ({ item: w.message, status: "warning" as const })),
      ];

      const hasErrors = s.draft.warnings.some((w) => w.severity === "error");

      const note: FinalSubmissionNote = {
        draftId: s.draft.id,
        summary: `Reimbursement of $${s.draft.amount.toFixed(2)} for ${s.draft.merchant} on ${s.draft.date}. Category: ${s.draft.category}. Purpose: ${s.draft.purpose}.`,
        checklist,
        approvalStatus: hasErrors ? "pending" : "approved",
        exportableNote: [
          `═══ REIMBURSEMENT SUBMISSION ═══`,
          ``,
          `ID:        ${s.draft.id}`,
          `Submitter: ${s.draft.submitterName}`,
          `Merchant:  ${s.draft.merchant}`,
          `Date:      ${s.draft.date}`,
          `Amount:    $${s.draft.amount.toFixed(2)} ${s.draft.currency}`,
          `Tax:       ${s.draft.tax ? `$${s.draft.tax.toFixed(2)}` : "N/A"}`,
          `Category:  ${s.draft.category}`,
          `Purpose:   ${s.draft.purpose}`,
          `Notes:     ${s.draft.notes || "None"}`,
          `Status:    ${hasErrors ? "PENDING REVIEW" : "APPROVED"}`,
          `Generated: ${new Date().toLocaleString()}`,
          `AI Source: NVIDIA NIM Extraction`,
          ``,
          `═══ CHECKLIST ═══`,
          ...checklist.map(
            (c) =>
              `${c.status === "complete" ? "✓" : c.status === "missing" ? "✗" : "⚠"} ${c.item}`
          ),
          ``,
          `═══ END ═══`,
        ].join("\n"),
        submittedAt: new Date().toISOString(),
      };

      return { ...s, finalNote: note, step: "final" as const };
    });
  }, []);

  const reset = useCallback(() => {
    resetDuplicateTracking();
    setState(defaultAppState);
    if (typeof window !== "undefined") {
      localStorage.removeItem("reimbursemate_app_state");
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        policyConfig,
        setStep,
        setInputMethod,
        setParsedReceipt,
        setFollowupAnswer,
        setDraft,
        setFinalNote,
        setError,
        setLoading,
        setPolicyConfig,
        generateDraft,
        generateFinalNote,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
