"use client";

import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAppStore } from "@/store/useAppStore";
import ToastItem from "@/components/ui/Toast";

export default function AppShell({ children }: { children: ReactNode }) {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);

  return (
    <div className="nau-grid min-h-screen bg-navy">
      <Sidebar />
      <div className="flex min-h-screen flex-col pl-60">
        <Topbar />
        <main className="flex-1 px-6 py-6">{children}</main>
        <footer className="border-t border-line px-6 py-3 text-[10.5px] text-secondary/80">
          OceanIQ · AI-Powered Maritime Chartering Decision Intelligence · Prototype build — all
          figures are illustrative demo data.
        </footer>
      </div>

      {/* Toast host */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </div>
  );
}
