"use client";

import { useState } from "react";
import { useApp } from "@/lib/state/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Settings, X } from "lucide-react";
import type { PolicyConfig } from "@/lib/schemas";
import { defaultPolicyConfig } from "@/lib/schemas";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { policyConfig, setPolicyConfig } = useApp();
  const [values, setValues] = useState<PolicyConfig>({ ...policyConfig });
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    // Validate: approval threshold must be >= warning threshold
    if (values.approvalThreshold < values.warningThreshold) {
      return;
    }
    setPolicyConfig(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setValues({ ...defaultPolicyConfig });
    setPolicyConfig({ ...defaultPolicyConfig });
  };

  const isValid = values.approvalThreshold >= values.warningThreshold;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-5 w-5 text-[var(--primary)]" />
            Policy Settings
          </CardTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[var(--muted)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Configure the reimbursement policy thresholds. Changes are saved to
            your browser and persist across sessions.
          </p>

          <Input
            id="warning-threshold"
            label="Warning Threshold ($)"
            type="number"
            min={0}
            step={5}
            value={values.warningThreshold}
            onChange={(e) =>
              setValues({
                ...values,
                warningThreshold: parseFloat(e.target.value) || 0,
              })
            }
            description="Amounts above this trigger a warning"
          />

          <Input
            id="approval-threshold"
            label="Approval Threshold ($)"
            type="number"
            min={0}
            step={5}
            value={values.approvalThreshold}
            onChange={(e) =>
              setValues({
                ...values,
                approvalThreshold: parseFloat(e.target.value) || 0,
              })
            }
            description="Amounts above this require manager approval"
          />

          <Input
            id="receipt-threshold"
            label="Receipt Required Above ($)"
            type="number"
            min={0}
            step={5}
            value={values.missingReceiptThreshold}
            onChange={(e) =>
              setValues({
                ...values,
                missingReceiptThreshold: parseFloat(e.target.value) || 0,
              })
            }
            description="Receipts are recommended for claims above this amount"
          />

          {!isValid && (
            <p className="text-xs text-[var(--destructive)]">
              Approval threshold must be greater than or equal to warning
              threshold.
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={!isValid}
            >
              {saved ? "Saved!" : "Save Settings"}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
