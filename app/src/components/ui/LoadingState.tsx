import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  label?: string;
  full?: boolean;
}

export default function LoadingState({ label = "Loading…", full }: LoadingStateProps) {
  const body = (
    <div className={`flex flex-col items-center gap-3 ${full ? "" : "py-12"}`}>
      <Loader2 className="size-6 animate-spin text-accent" />
      <p className="text-[12px] text-secondary">{label}</p>
    </div>
  );
  return full ? (
    <div className="grid min-h-[60vh] place-items-center">{body}</div>
  ) : (
    body
  );
}