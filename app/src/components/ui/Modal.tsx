"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative w-full ${sizes[size]} max-h-[85vh] overflow-y-auto rounded-xl border border-line bg-card shadow-2xl shadow-black/50`}
      >
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-primary">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[11px] text-secondary">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="grid size-7 place-items-center rounded-md text-secondary transition-colors hover:bg-white/5 hover:text-primary"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}