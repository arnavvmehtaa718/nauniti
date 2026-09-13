"use client";

import { ArrowUpRight, Bell, MapPin } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

export interface AlertItem {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  severity: "Low" | "Medium" | "High";
  status: "New" | "Reviewed" | "Resolved";
  action: string;
}

interface AlertCardProps {
  alert: AlertItem;
  onAction?: (alert: AlertItem) => void;
}

export default function AlertCard({ alert, onAction }: AlertCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line bg-card p-3.5 transition-colors hover:border-accent/40">
      <div className="flex items-center gap-2">
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-md ${
            alert.severity === "High" ? "bg-bad/15 text-bad" : "bg-warn/15 text-warn"
          }`}
        >
          <Bell className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-[13px] font-semibold text-primary">{alert.title}</h4>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-secondary">
            <span>{alert.date}</span>
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="size-3" />
              {alert.location}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge
            status={alert.severity}
            tone={alert.severity === "High" ? "red" : alert.severity === "Medium" ? "amber" : "green"}
          />
          <StatusBadge status={alert.status} />
        </div>
      </div>
      <p className="text-[12px] leading-snug text-secondary">{alert.description}</p>
      {onAction && (
        <button
          onClick={() => onAction(alert)}
          className="inline-flex w-fit items-center gap-1 text-[11.5px] font-medium text-accent transition-colors hover:text-primary"
        >
          {alert.action}
          <ArrowUpRight className="size-3.5" />
        </button>
      )}
    </div>
  );
}