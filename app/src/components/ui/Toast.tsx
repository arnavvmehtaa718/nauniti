"use client";

import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import type { Toast } from "@/store/useAppStore";

const kindConfig = {
  success: { icon: CheckCircle2, ring: "text-good" },
  info: { icon: Info, ring: "text-accent" },
  warning: { icon: AlertTriangle, ring: "text-warn" },
};

export default function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  const conf = kindConfig[toast.kind];
  const Icon = conf.icon;
  return (
    <div className="animate-toast-in pointer-events-auto flex w-full gap-3 rounded-xl border border-line bg-card p-4 shadow-xl shadow-black/40">
      <Icon className={`mt-0.5 size-5 shrink-0 ${conf.ring}`} />
      <div className="flex-1">
        <p className="text-[13px] font-semibold text-primary">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-[11px] leading-snug text-secondary">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="h-fit text-secondary transition-colors hover:text-primary"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}