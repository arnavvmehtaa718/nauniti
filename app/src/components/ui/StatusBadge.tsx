const STATUS_TONES: Record<string, { bg: string; text: string; dot: string }> = {
  ready: { bg: "bg-good/10", text: "text-good", dot: "bg-good" },
  resolved: { bg: "bg-good/10", text: "text-good", dot: "bg-good" },
  pass: { bg: "bg-good/10", text: "text-good", dot: "bg-good" },
  low: { bg: "bg-good/10", text: "text-good", dot: "bg-good" },
  reviewed: { bg: "bg-accent/10", text: "text-accent", dot: "bg-accent" },
  new: { bg: "bg-accent/10", text: "text-accent", dot: "bg-accent" },
  medium: { bg: "bg-warn/10", text: "text-warn", dot: "bg-warn" },
  high: { bg: "bg-bad/10", text: "text-bad", dot: "bg-bad" },
  restricted: { bg: "bg-warn/10", text: "text-warn", dot: "bg-warn" },
  fail: { bg: "bg-bad/10", text: "text-bad", dot: "bg-bad" },
};

interface StatusBadgeProps {
  status: string;
  tone?: "green" | "amber" | "red" | "blue" | "slate";
}

const toneOverrides: Record<string, { bg: string; text: string; dot: string }> = {
  green: STATUS_TONES.ready,
  amber: STATUS_TONES.medium,
  red: STATUS_TONES.high,
  blue: STATUS_TONES.reviewed,
  slate: { bg: "bg-white/5", text: "text-secondary", dot: "bg-secondary" },
};

export default function StatusBadge({ status, tone }: StatusBadgeProps) {
  const key = status.toLowerCase();
  const t =
    (tone && toneOverrides[tone]) ||
    STATUS_TONES[key] ||
    { bg: "bg-white/5", text: "text-secondary", dot: "bg-secondary" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium capitalize ${t.bg} ${t.text}`}
    >
      <span className={`size-1.5 rounded-full ${t.dot}`} />
      {status}
    </span>
  );
}