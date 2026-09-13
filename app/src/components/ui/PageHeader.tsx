import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  badge?: ReactNode;
}

export default function PageHeader({ title, subtitle, right, badge }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight text-primary">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-[12px] text-secondary">{subtitle}</p>}
        {badge}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}