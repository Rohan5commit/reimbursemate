import type { ParsedReceipt } from "../schemas";

export interface DemoPreset {
  id: string;
  label: string;
  description: string;
  receiptText: string;
  parsedReceipt: ParsedReceipt;
  extraAnswers?: Record<string, string>;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "cafe-lunch",
    label: "☕ Café Team Lunch",
    description: "Receipt from a café for a team lunch meeting",
    receiptText: `BLUE BOTTLE COFFEE
315 Linden St, San Francisco, CA
Date: 2026-06-18
--------------------------------
Latte x3          $15.00
Sandwich x2       $24.00
Cookie x1          $4.50
--------------------------------
Subtotal:         $43.50
Tax (8.625%):      $3.75
TOTAL:            $47.25
VISA ****4421`,
    parsedReceipt: {
      merchant: "Blue Bottle Coffee",
      amount: 47.25,
      date: "2026-06-18",
      currency: "USD",
      tax: 3.75,
      probableCategory: "meals",
      probablePurpose: "Team lunch meeting",
      confidence: 0.92,
      missingFields: [],
    },
    extraAnswers: {
      purpose: "Team lunch meeting during Q3 planning session",
      submitterName: "Alex Chen",
    },
  },
  {
    id: "software-subscription",
    label: "💻 Software Subscription",
    description: "Monthly SaaS invoice for design tool",
    receiptText: `FIGMA, INC.
Invoice #INV-2026-06-1847
Date: June 15, 2026
Bill To: Acme Labs

Figma Professional Plan
Monthly Subscription
License: 5 seats

Amount: $75.00
Tax: $0.00
Total Due: $75.00

Payment: Net 30`,
    parsedReceipt: {
      merchant: "Figma, Inc.",
      amount: 75.0,
      date: "2026-06-15",
      currency: "USD",
      tax: null,
      probableCategory: "software",
      probablePurpose: "Design tool subscription for product team",
      confidence: 0.95,
      missingFields: [],
    },
  },
  {
    id: "taxi-travel",
    label: "🚕 Travel Taxi",
    description: "Taxi receipt for business travel",
    receiptText: `CITY TAXI CAB CO.
Trip Receipt
--------------------------------
Pickup: SFO Terminal 2
Dropoff: Marriott Union Square
Date: 2026-06-10
Time: 2:15 PM
--------------------------------
Base Fare:       $12.50
Mileage:         $18.75
Airport Surcharge: $5.50
Tip:              $8.00
--------------------------------
TOTAL:           $44.75`,
    parsedReceipt: {
      merchant: "City Taxi Cab Co.",
      amount: 44.75,
      date: "2026-06-10",
      currency: "USD",
      tax: null,
      probableCategory: "travel",
      probablePurpose: "Airport transfer for client meeting",
      confidence: 0.88,
      missingFields: ["purpose"],
    },
  },
  {
    id: "office-supplies",
    label: "📦 Office Supplies",
    description: "Office supply store purchase",
    receiptText: `STAPLES
Store #4472
San Francisco, CA
Date: 06/17/2026
--------------------------------
Printer Paper     $29.99
Ink Cartridge     $34.99
Post-it Notes      $6.49
Pens (12pk)        $8.99
--------------------------------
Subtotal:         $80.46
Tax:               $7.24
TOTAL:            $87.70
MC ****7823`,
    parsedReceipt: {
      merchant: "Staples",
      amount: 87.7,
      date: "2026-06-17",
      currency: "USD",
      tax: 7.24,
      probableCategory: "office_supplies",
      probablePurpose: "Office supply restocking",
      confidence: 0.9,
      missingFields: [],
    },
    extraAnswers: {
      purpose: "Monthly office supply restocking for the design team",
      submitterName: "Jordan Lee",
    },
  },
  {
    id: "missing-purpose",
    label: "❓ Missing Purpose",
    description: "Receipt missing business purpose (triggers warning)",
    receiptText: `WALMART SUPERCENTER
Store #2847
Bentonville, AR
06/16/2026
--------------------------------
USB-C Hub         $24.99
Monitor Stand     $39.99
Desk Lamp         $22.49
--------------------------------
Tax:               $6.85
TOTAL:            $94.32
VISA ****9012`,
    parsedReceipt: {
      merchant: "Walmart Supercenter",
      amount: 94.32,
      date: "2026-06-16",
      currency: "USD",
      tax: 6.85,
      probableCategory: "office_supplies",
      probablePurpose: "",
      confidence: 0.85,
      missingFields: ["purpose"],
    },
    extraAnswers: {
      purpose: "",
      submitterName: "Sam Rivera",
    },
  },
  {
    id: "above-threshold",
    label: "⚠️ Above Threshold",
    description: "Large expense exceeding $150 approval threshold",
    receiptText: `DELTA AIR LINES
E-Ticket Receipt
Passenger: Alex Chen
Date: June 12, 2026
--------------------------------
Flight: SFO → JFK
Class: Economy Plus
Ticket: $247.00
Baggage Fee:  $35.00
Seat Upgrade: $45.00
--------------------------------
Tax & Fees:    $58.75
TOTAL:        $385.75
Confirmation: DL8X4K2`,
    parsedReceipt: {
      merchant: "Delta Air Lines",
      amount: 385.75,
      date: "2026-06-12",
      currency: "USD",
      tax: 58.75,
      probableCategory: "travel",
      probablePurpose: "Flight to NYC for client presentation",
      confidence: 0.94,
      missingFields: [],
    },
    extraAnswers: {
      purpose: "Flight to NYC for quarterly client presentation at Acme Corp",
      submitterName: "Alex Chen",
    },
  },
  {
    id: "duplicate",
    label: "🔄 Duplicate Receipt",
    description: "Appears to be a duplicate of an earlier submission",
    receiptText: `BLUE BOTTLE COFFEE
315 Linden St, San Francisco, CA
Date: 2026-06-18
--------------------------------
Latte x3          $15.00
Sandwich x2       $24.00
Cookie x1          $4.50
--------------------------------
Subtotal:         $43.50
Tax (8.625%):      $3.75
TOTAL:            $47.25
VISA ****4421`,
    parsedReceipt: {
      merchant: "Blue Bottle Coffee",
      amount: 47.25,
      date: "2026-06-18",
      currency: "USD",
      tax: 3.75,
      probableCategory: "meals",
      probablePurpose: "Team lunch meeting",
      confidence: 0.91,
      missingFields: [],
    },
    extraAnswers: {
      purpose: "Team lunch meeting (duplicate)",
      submitterName: "Alex Chen",
    },
  },
];
