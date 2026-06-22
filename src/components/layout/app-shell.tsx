"use client";

import { useApp } from "@/lib/state/store";
import { RotateCcw, Sparkles } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, reset, setStep } = useApp();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => {
              if (state.step !== "landing") {
                setStep("landing");
              }
            }}
            className="flex items-center gap-2 font-semibold text-[var(--foreground)] hover:opacity-80 transition-opacity"
          >
            <Sparkles className="h-5 w-5 text-[var(--primary)]" />
            ReimburseMate
          </button>

          {state.step !== "landing" && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </header>

      {/* Step indicator */}
      {state.step !== "landing" && state.step !== "architecture" && (
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            {["input", "followup", "review", "final"].map((s, i) => {
              const stepOrder = ["landing", "input", "followup", "review", "final"];
              const currentIdx = stepOrder.indexOf(state.step);
              const thisIdx = stepOrder.indexOf(s);
              const isActive = state.step === s;
              const isPast = thisIdx < currentIdx;

              return (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && <span className="text-[var(--border)]">→</span>}
                  <span
                    className={`px-2 py-0.5 rounded-md ${
                      isActive
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium"
                        : isPast
                        ? "text-[var(--primary)]"
                        : ""
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto pb-12">{children}</main>

    </div>
  );
}
