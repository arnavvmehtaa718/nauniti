"use client";

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface RecommendationCardProps {
  title: string;
  subtitle?: string;
  metrics: { label: string; value: string; tone?: "good" | "warn" | "bad" | "default" }[];
  actionLabel?: string;
  onAction?: () => void;
  footer?: ReactNode;
}

export default function RecommendationCard({
  title,
  subtitle,
  metrics,
  actionLabel,
  onAction,
  footer,
}: RecommendationCardProps) {
  const toneClass = (tone: string) =>
    tone === "good"
      ? "text-good"
      : tone === "warn"
        ? "text-warn"
        : tone === "bad"
          ? "text-bad"
          : "text-primary";

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-accent/35 bg-card p-4">
      <div className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-md bg-accent/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
        <span className="size-1.5 animate-pulse rounded-full bg-accent" />
        NauNiti Recommendation
      </div>
      <h3 className="text-[15px] font-semibold leading-snug text-primary">{title}</h3>
      {subtitle && <p className="-mt-2 text-[11px] text-secondary">{subtitle}</p>}

      <dl className="grid flex-1 grid-cols-2 gap-x-3 gap-y-2.5">
        {metrics.map((m) => (
          <div key={m.label}>
            <dt className="text-[10px] uppercase tracking-wider text-secondary">{m.label}</dt>
            <dd className={`mt-0.5 text-[14px] font-semibold ${toneClass(m.tone ?? "default")}`}>
              {m.value}
            </dd>
          </div>
        ))}
      </dl>

      {footer}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-nav py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-blue-glow"
        >
          {actionLabel}
          <ArrowRight className="size-3.5" />
        </button>
      )}
    </div>
  );
}