"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/state/store";
import { AppShell } from "@/components/layout/app-shell";
import { connectAnna, isRunningInAnna } from "@/lib/anna/runtime";
import { LandingScreen } from "@/components/screens/landing";
import { InputScreen } from "@/components/screens/input";
import { FollowupScreen } from "@/components/screens/followup";
import { ReviewScreen } from "@/components/screens/review";
import { FinalScreen } from "@/components/screens/final";
import { ArchitectureScreen } from "@/components/screens/architecture";
import { Loader2 } from "lucide-react";

export function App() {
  const { state } = useApp();

  // Initialize Anna runtime on mount
  useEffect(() => {
    connectAnna().then((anna) => {
      if (isRunningInAnna()) {
        anna.window.set_title({ title: "ReimburseMate — AI Reimbursement Agent" });
        anna.chat.write_message({
          content: "ReimburseMate ready. Upload a receipt or paste expense details to get started.",
        });
      }
    });
  }, []);

  const renderScreen = () => {
    if (state.loading && state.step !== "input") {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
          <p className="text-sm text-[var(--muted-foreground)]">Processing...</p>
        </div>
      );
    }

    switch (state.step) {
      case "landing":
        return <LandingScreen />;
      case "input":
        return <InputScreen />;
      case "extracting":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
            <p className="text-sm text-[var(--muted-foreground)]">
              AI is extracting receipt data...
            </p>
          </div>
        );
      case "followup":
        return <FollowupScreen />;
      case "review":
        return <ReviewScreen />;
      case "final":
        return <FinalScreen />;
      case "architecture":
        return <ArchitectureScreen />;
      default:
        return <LandingScreen />;
    }
  };

  return (
    <AppShell>
      {renderScreen()}
    </AppShell>
  );
}
