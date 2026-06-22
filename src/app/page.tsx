"use client";

import { AppProvider } from "@/lib/state/store";
import { App } from "@/components/app";

export default function HomePage() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
