"use client";

import { useState, useRef, useCallback } from "react";
import { useApp } from "@/lib/state/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { DEMO_PRESETS } from "@/lib/demo/presets";
import { extractReceipt, extractFromImage } from "@/lib/ai/nim-client";
import { connectAnna, isRunningInAnna } from "@/lib/anna/runtime";
import {
  Upload,
  FileText,
  Keyboard,
  Sparkles,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

export function InputScreen() {
  const {
    state,
    setStep,
    setInputMethod,
    setParsedReceipt,
    setError,
    setLoading,
  } = useApp();

  const [pasteText, setPasteText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setLocalError(null);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const handleExtractFromFile = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setLocalError(null);

    try {
      // Log extraction start to Anna chat
      const anna = await connectAnna();
      if (isRunningInAnna()) {
        await anna.chat.write_message({
          content: `Extracting fields from ${selectedFile.name}...`,
        });
      }

      let parsed;
      if (selectedFile.type.startsWith("image/")) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        });
        parsed = await extractFromImage(dataUrl);
      } else {
        const text = await selectedFile.text();
        parsed = await extractReceipt(text);
      }

      setParsedReceipt(parsed);
      setStep("followup");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Extraction failed. Please try again or enter manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleExtractFromText = async () => {
    if (!pasteText.trim()) return;

    setLoading(true);
    setError(null);
    setLocalError(null);

    try {
      const anna = await connectAnna();
      if (isRunningInAnna()) {
        await anna.chat.write_message({
          content: "Extracting receipt fields...",
        });
      }

      const parsed = await extractReceipt(pasteText);
      setParsedReceipt(parsed);
      setStep("followup");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Extraction failed. Please try again or enter manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPreset = (preset: typeof DEMO_PRESETS[number]) => {
    setParsedReceipt(preset.parsedReceipt);
    setStep("followup");
  };

  const handleManualEntry = () => {
    setParsedReceipt({
      merchant: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      currency: "USD",
      tax: null,
      probableCategory: "other",
      probablePurpose: "",
      confidence: 0,
      missingFields: ["merchant", "amount", "date", "purpose"],
    });
    setStep("followup");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => setStep("landing")} className="mb-4 -ml-2">
          ← Back
        </Button>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">New Reimbursement</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Upload a receipt, paste expense details, or try a demo.
        </p>
      </div>

      {localError && (
        <Alert variant="error" className="mb-6">
          {localError}
        </Alert>
      )}

      {/* Upload Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-5 w-5 text-[var(--primary)]" />
            Upload Receipt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center cursor-pointer hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            {selectedFile ? (
              <div className="space-y-3">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="max-h-48 mx-auto rounded-lg object-contain"
                  />
                )}
                <div className="flex items-center justify-center gap-2 text-sm text-[var(--foreground)]">
                  <FileText className="h-4 w-4" />
                  {selectedFile.name}
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="h-10 w-10 mx-auto text-[var(--muted-foreground)]" />
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Click to upload receipt
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Supports images (JPG, PNG) and PDFs
                </p>
              </div>
            )}
          </div>

          {selectedFile && (
            <Button
              onClick={handleExtractFromFile}
              disabled={state.loading}
              className="w-full"
            >
              {state.loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Extract with AI
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Paste Text Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Keyboard className="h-5 w-5 text-[var(--primary)]" />
            Paste Expense Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            ref={textareaRef}
            placeholder="Paste receipt text, invoice details, or expense notes here..."
            value={pasteText}
            onChange={(e) => {
              setPasteText(e.target.value);
              setLocalError(null);
            }}
            className="w-full h-32 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent resize-none"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleExtractFromText}
              disabled={!pasteText.trim() || state.loading}
              className="flex-1"
            >
              {state.loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Extract with AI
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleManualEntry}
              disabled={state.loading}
            >
              <Keyboard className="h-4 w-4" />
              Enter Manually
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Demo Presets */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-[var(--primary)]" />
            Demo Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleDemoPreset(preset)}
                className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border)] text-left hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 transition-all"
              >
                <span className="text-xl mt-0.5">{preset.label.split(" ")[0]}</span>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {preset.label.split(" ").slice(1).join(" ")}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {preset.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
