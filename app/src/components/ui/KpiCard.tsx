import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  changeText?: string;
  changeDirection?: "up" | "down";
  tone?: "blue" | "green" | "amber" | "red" | "default";
}

const toneClasses: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  blue: "text-accent bg-accent/10",
  green: "text-good bg-good/10",
  amber: "text-warn bg-warn/10",
  red: "text-bad bg-bad/10",
  default: "text-primary bg-white/5",
};

export default function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  changeText,
  changeDirection = "up",
  tone = "blue",
}: KpiCardProps) {
  const changeColor =
    changeDirection === "up"
      ? "text-good bg-good/10"
      : "text-bad bg-bad/10";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-secondary">
          {label}
        </span>
        {Icon && (
          <span className={`grid size-8 place-items-center rounded-lg ${toneClasses[tone]}`}>
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div>
        <div className="text-[28px] font-semibold leading-8 tracking-tight text-primary">
          {value}
        </div>
        {sub && <div className="mt-1 text-[11px] text-secondary">{sub}</div>}
      </div>
      {changeText && (
        <span className={`inline-flex w-fit rounded-md px-2 py-0.5 text-[11px] font-medium ${changeColor}`}>
          {changeText}
        </span>
      )}
    </div>
  );
}