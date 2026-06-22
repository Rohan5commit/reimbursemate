"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface AlertProps {
  children: ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
}

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

export function Alert({ children, variant = "info", className }: AlertProps) {
  const Icon = icons[variant];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 text-sm",
        variant === "info" && "bg-teal-50 border-teal-200 text-teal-800",
        variant === "success" && "bg-emerald-50 border-emerald-200 text-emerald-800",
        variant === "warning" && "bg-amber-50 border-amber-200 text-amber-800",
        variant === "error" && "bg-red-50 border-red-200 text-red-800",
        className
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
