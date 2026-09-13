interface RiskBadgeProps {
  level: "Low" | "Medium" | "High";
  label?: string;
}

const map = {
  Low: { text: "text-good", bg: "bg-good/10", ring: "ring-good/30" },
  Medium: { text: "text-warn", bg: "bg-warn/10", ring: "ring-warn/30" },
  High: { text: "text-bad", bg: "bg-bad/10", ring: "ring-bad/30" },
};

export default function RiskBadge({ level, label }: RiskBadgeProps) {
  const t = map[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${t.bg} ${t.text} ${t.ring}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label ?? `${level} Risk`}
    </span>
  );
}