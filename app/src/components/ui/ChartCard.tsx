import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  right,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <div className={`flex flex-col gap-3 rounded-xl border border-line bg-card p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-semibold text-primary">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[11px] text-secondary">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}