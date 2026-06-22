import { ParsedReceiptSchema, type ParsedReceipt } from "../schemas";
import { connectAnna, isRunningInAnna } from "../anna/runtime";

/**
 * Extract receipt data by calling the server-side API route.
 * In Anna mode, routes through Anna's tools.invoke instead.
 * The API route handles NVIDIA NIM calls server-side (key stays secure).
 */
export async function extractReceipt(text: string): Promise<ParsedReceipt> {
  // When running inside Anna, route through the platform's tool invocation
  const anna = await connectAnna();
  if (isRunningInAnna()) {
    const response = await anna.tools.invoke({
      tool_id: "receipt-extractor",
      method: "extract",
      args: { text },
    });
    if (response.error) throw new Error(response.error);
    const validated = ParsedReceiptSchema.safeParse(response.result);
    if (!validated.success) {
      throw new Error("AI returned invalid data structure. Please try again or enter manually.");
    }
    await anna.chat.write_message({
      content: `Extracted receipt: ${(response.result as Record<string, unknown>).merchant} — $${(response.result as Record<string, unknown>).amount}`,
    });
    return validated.data;
  }

  // Standalone mode — call our server-side API route
  const response = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "text", text }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Extraction failed. Please try again or enter manually.");
  }

  const validated = ParsedReceiptSchema.safeParse(data);
  if (!validated.success) {
    throw new Error("AI returned invalid data structure. Please try again or enter manually.");
  }

  return validated.data;
}

/**
 * Extract receipt data from an image via the server-side API route.
 * Uses NVIDIA NIM vision model (neva-22b) for image understanding.
 */
export async function extractFromImage(
  imageDataUrl: string
): Promise<ParsedReceipt> {
  // When running inside Anna, route through the platform's tool invocation
  const anna = await connectAnna();
  if (isRunningInAnna()) {
    const response = await anna.tools.invoke({
      tool_id: "receipt-extractor",
      method: "extract",
      args: { imageDataUrl },
    });
    if (response.error) throw new Error(response.error);
    const validated = ParsedReceiptSchema.safeParse(response.result);
    if (!validated.success) {
      throw new Error("AI returned invalid data structure. Please try again.");
    }
    return validated.data;
  }

  // Standalone mode — call our server-side API route
  const response = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "image", imageDataUrl }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Image extraction failed. Please try again.");
  }

  const validated = ParsedReceiptSchema.safeParse(data);
  if (!validated.success) {
    throw new Error("AI returned invalid data structure. Please try again.");
  }

  return validated.data;
}
