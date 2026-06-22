#!/usr/bin/env python3
"""
Receipt Extractor — Anna Executa Tool

Implements the JSON-RPC 2.0 protocol over stdio as required by the Anna
platform's Executa system. When loaded by Anna, the runtime performs an
`initialize` handshake followed by `describe` to discover this tool's
capabilities. The LLM then calls `extract` when a user provides receipt data.
"""
import json
import sys
import os
from typing import Any


def handle_initialize(params: dict) -> dict:
    """Respond to Anna's initialization handshake."""
    return {
        "protocol": "jsonrpc",
        "version": "2.0",
        "tool_name": "receipt-extractor",
        "tool_version": "1.0.0",
        "capabilities": ["extract"],
    }


def handle_describe(params: dict) -> dict:
    """Describe this tool's methods for Anna's discovery phase."""
    return {
        "name": "receipt-extractor",
        "description": (
            "Extracts structured fields from receipt text or invoice data. "
            "Returns merchant, amount, date, tax, category, and other fields."
        ),
        "methods": {
            "extract": {
                "description": "Parse receipt text and return structured JSON fields",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "text": {
                            "type": "string",
                            "description": "Raw receipt text or invoice content to parse",
                        }
                    },
                    "required": ["text"],
                },
                "returns": {
                    "type": "object",
                    "properties": {
                        "merchant": {"type": "string"},
                        "amount": {"type": "number"},
                        "date": {"type": "string"},
                        "currency": {"type": "string"},
                        "tax": {"type": ["number", "null"]},
                        "probableCategory": {"type": "string"},
                        "probablePurpose": {"type": "string"},
                        "confidence": {"type": "number"},
                        "missingFields": {"type": "array", "items": {"type": "string"}},
                    },
                },
            }
        },
    }


def handle_extract(params: dict) -> dict:
    """
    Extract structured fields from receipt text.
    Uses deterministic regex/pattern matching as a lightweight local fallback.
    In production, the Anna runtime may route this through the platform LLM.
    """
    text = params.get("text", "")
    if not text:
        return {"error": "No receipt text provided"}

    lines = [l.strip() for l in text.split("\n") if l.strip()]

    merchant = _extract_merchant(lines)
    amount = _extract_total(lines)
    date = _extract_date(text)
    tax = _extract_tax(lines)
    currency = _extract_currency(lines)

    # Determine category from merchant/items
    category = _suggest_category(merchant, lines)

    # Missing fields
    missing = []
    if not merchant:
        missing.append("merchant")
    if amount is None:
        missing.append("amount")
    if not date:
        missing.append("date")

    confidence = max(0.5, 1.0 - len(missing) * 0.15)

    return {
        "merchant": merchant or "Unknown",
        "amount": amount or 0,
        "date": date or "",
        "currency": currency or "USD",
        "tax": tax,
        "probableCategory": category,
        "probablePurpose": "",
        "confidence": round(confidence, 2),
        "missingFields": missing,
    }


def _extract_merchant(lines: list[str]) -> str | None:
    """The first non-numeric line is usually the merchant."""
    for line in lines[:5]:
        if not any(c.isdigit() for c in line) and len(line) > 2:
            # Skip separator lines
            if set(line) <= {"-", "=", "~", "─"}:
                continue
            return line
    return None


def _extract_total(lines: list[str]) -> float | None:
    """Look for TOTAL, Total Due, or last dollar amount."""
    total_keywords = ["total", "amount due", "balance due", "grand total"]
    for line in reversed(lines):
        lower = line.lower()
        if any(kw in lower for kw in total_keywords):
            amount = _parse_dollar_amount(line)
            if amount is not None:
                return amount
    # Fall back to the largest dollar amount found
    amounts = []
    for line in lines:
        a = _parse_dollar_amount(line)
        if a is not None:
            amounts.append(a)
    return max(amounts) if amounts else None


def _extract_date(text: str) -> str | None:
    """Extract a date in common formats."""
    import re
    # YYYY-MM-DD
    m = re.search(r"(\d{4}-\d{2}-\d{2})", text)
    if m:
        return m.group(1)
    # MM/DD/YYYY or MM-DD-YYYY
    m = re.search(r"(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})", text)
    if m:
        return f"{m.group(3)}-{m.group(1).zfill(2)}-{m.group(2).zfill(2)}"
    # Month DD, YYYY
    m = re.search(
        r"(January|February|March|April|May|June|July|August|September|October|November|December)"
        r"\s+(\d{1,2}),?\s+(\d{4})",
        text,
        re.IGNORECASE,
    )
    if m:
        month_map = {
            "january": "01", "february": "02", "march": "03", "april": "04",
            "may": "05", "june": "06", "july": "07", "august": "08",
            "september": "09", "october": "10", "november": "11", "december": "12",
        }
        month = month_map[m.group(1).lower()]
        return f"{m.group(3)}-{month}-{m.group(2).zfill(2)}"
    return None


def _extract_tax(lines: list[str]) -> float | None:
    """Look for a tax line."""
    for line in lines:
        lower = line.lower()
        if "tax" in lower and "total" not in lower:
            amount = _parse_dollar_amount(line)
            if amount is not None:
                return amount
    return None


def _extract_currency(lines: list[str]) -> str:
    """Detect currency symbol."""
    text = "\n".join(lines)
    if "$" in text or "USD" in text.upper():
        return "USD"
    if "€" in text or "EUR" in text.upper():
        return "EUR"
    if "£" in text or "GBP" in text.upper():
        return "GBP"
    return "USD"


def _parse_dollar_amount(line: str) -> float | None:
    """Parse a dollar amount from a line of text."""
    import re
    m = re.search(r"\$?([\d,]+\.?\d*)", line)
    if m:
        try:
            return float(m.group(1).replace(",", ""))
        except ValueError:
            return None
    return None


def _suggest_category(merchant: str | None, lines: list[str]) -> str:
    """Suggest a category based on merchant name and items."""
    text = " ".join(lines).lower()
    m = (merchant or "").lower()

    if any(w in m for w in ["restaurant", "cafe", "coffee", "starbucks", "blue bottle", "lunch", "dinner"]):
        return "meals"
    if any(w in m for w in ["uber", "lyft", "taxi", "airline", "delta", "united", "hotel", "marriott"]):
        return "travel"
    if any(w in m for w in ["figma", "github", "slack", "notion", "adobe", "saas", "subscription"]):
        return "software"
    if any(w in m for w in ["staples", "office depot", "office supply"]):
        return "office_supplies"
    if any(w in text for w in ["software", "license", "subscription", "saas"]):
        return "software"
    if any(w in text for w in ["flight", "taxi", "uber", "lyft", "hotel", "mileage"]):
        return "travel"
    return "other"


# ── JSON-RPC 2.0 over stdio ──────────────────────────────────────────

def send_response(response: dict) -> None:
    """Write a JSON-RPC response to stdout."""
    print(json.dumps(response), flush=True)


def send_error(request_id: Any, code: int, message: str) -> None:
    """Write a JSON-RPC error response."""
    send_response({
        "jsonrpc": "2.0",
        "id": request_id,
        "error": {"code": code, "message": message},
    })


def main() -> None:
    """Main loop — read JSON-RPC from stdin, write responses to stdout."""
    METHOD_HANDLERS = {
        "initialize": handle_initialize,
        "describe": handle_describe,
        "extract": handle_extract,
    }

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            request = json.loads(line)
        except json.JSONDecodeError as e:
            send_error(None, -32700, f"Parse error: {e}")
            continue

        req_id = request.get("id")
        method = request.get("method", "")
        params = request.get("params", {})

        if method in METHOD_HANDLERS:
            try:
                result = METHOD_HANDLERS[method](params)
                send_response({"jsonrpc": "2.0", "id": req_id, "result": result})
            except Exception as e:
                send_error(req_id, -32000, f"Tool error: {e}")
        else:
            send_error(req_id, -32601, f"Method not found: {method}")


if __name__ == "__main__":
    main()
