import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReimburseMate — AI Reimbursement Agent",
  description:
    "Turn messy receipts into structured reimbursement drafts with AI extraction, policy checks, and human approval.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
