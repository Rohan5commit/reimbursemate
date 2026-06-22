# ReimburseMate — Prompts Used

## Receipt Text Extraction Prompt

```
You are a receipt extraction assistant. Analyze the receipt text below and extract structured fields.

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
- Return ONLY the JSON object, no other text
```

## Image Receipt Extraction Prompt

```
Analyze this receipt image and extract structured fields. Return ONLY valid JSON:
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
}
```

## Prompt Design Decisions

1. **System message**: Constrains output to valid JSON only
2. **Temperature 0.1**: Maximizes deterministic extraction
3. **JSON mode**: Uses `response_format: { type: "json_object" }` when available
4. **Structured schema**: Forces consistent field names and types
5. **Missing fields**: Explicitly asks model to report what it couldn't extract
6. **Confidence scoring**: Lets the app show extraction reliability
