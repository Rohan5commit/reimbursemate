import { NextRequest, NextResponse } from "next/server";
import { ParsedReceiptSchema } from "@/lib/schemas";

const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";

const EXTRACTION_PROMPT = `You are a receipt extraction assistant. Analyze the receipt text below and extract structured fields.

Receipt text:
{receiptText}

Return ONLY valid JSON matching this exact schema:
{
  "merchant": "string - store/vendor name",
  "amount": number - total amount (use 0 if not found),
  "date": "string - YYYY-MM-DD format",
  "currency": "string - e.g. USD",
  "tax": number or null - tax amount if visible,
  "probableCategory": "string - one of: meals, travel, software, office_supplies, services, entertainment, other",
  "probablePurpose": "string - likely business purpose",
  "confidence": number between 0 and 1,
  "missingFields": ["string - list of fields that could not be extracted"]
}

Rules:
- If a field is not visible or unclear, include it in missingFields
- Amount should be the total after tax
- Date should be ISO format YYYY-MM-DD
- Confidence reflects how certain you are about the extraction
- Return ONLY the JSON object, no other text`;

async function callNIM(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) {
    throw new Error("NVIDIA_NIM_API_KEY not configured on server");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(`${NIM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NIM API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { mode, text, imageDataUrl } = await req.json();

    let data: Record<string, unknown>;

    if (mode === "image" && imageDataUrl) {
      // Vision model for image extraction
      data = await callNIM({
        model: "nvidia/neva-22b",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this receipt image and extract structured fields. Return ONLY valid JSON:
{
  "merchant": "string",
  "amount": number,
  "date": "YYYY-MM-DD",
  "currency": "string",
  "tax": number or null,
  "probableCategory": "meals|travel|software|office_supplies|services|entertainment|other",
  "probablePurpose": "string",
  "confidence": 0-1,
  "missingFields": ["string"]
}`,
              },
              {
                type: "image_url",
                image_url: { url: imageDataUrl },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      });
    } else if (mode === "text" && text) {
      // Text model for receipt text extraction
      const prompt = EXTRACTION_PROMPT.replace("{receiptText}", text);
      data = await callNIM({
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a precise receipt extraction assistant. Return only valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      });
    } else {
      return NextResponse.json({ error: "Invalid request: provide mode and text/imageDataUrl" }, { status: 400 });
    }

    const choices = (data as { choices?: Array<{ message?: { content?: string } }> }).choices;
    const content = choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "Empty response from NIM API" }, { status: 502 });
    }

    // Extract JSON from response (may have markdown wrapping for vision model)
    let jsonStr = content;
    if (mode === "image") {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonStr = jsonMatch[0];
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: "AI returned malformed JSON" }, { status: 502 });
    }

    // Validate with Zod on the server for better error messages
    const validated = ParsedReceiptSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json(
        { error: "AI returned invalid data structure. Please try again or enter manually." },
        { status: 422 }
      );
    }

    return NextResponse.json(validated.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";
    if (message.includes("AbortError") || message.includes("timed out")) {
      return NextResponse.json({ error: "Request timed out" }, { status: 504 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
