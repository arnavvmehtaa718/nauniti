"use client";

import { Anchor, Clock, Gauge, Ship, Waves } from "lucide-react";
import type { Port } from "@/lib/mockData";
import RiskBadge from "@/components/ui/RiskBadge";

interface PortCardProps {
  port: Port;
  selected?: boolean;
  onSelect?: (port: Port) => void;
}

export default function PortCard({ port, selected, onSelect }: PortCardProps) {
  return (
    <div
      onClick={() => onSelect?.(port)}
      className={`rounded-xl border p-4 transition-all ${
        selected
          ? "border-accent bg-card shadow-lg shadow-blue-nav/20"
          : "border-line bg-card hover:border-accent/50"
      } ${onSelect ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-primary">{port.name}</h3>
          <p className="text-[11px] text-secondary">
            {port.country}
            {port.state ? ` · ${port.state}` : ""}
            {port.coast ? ` · ${port.coast}` : ""}
          </p>
        </div>
        <RiskBadge level={port.riskLevel} />
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-[12px]">
          <span className="inline-flex items-center gap-1.5 text-secondary">
            <Gauge className="size-3.5" /> Congestion
          </span>
          <span className="font-semibold text-primary">{port.congestion} ({port.congestionLevel}%)</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className={`h-full rounded-full ${
              port.congestionLevel >= 60 ? "bg-bad" : port.congestionLevel >= 45 ? "bg-warn" : "bg-good"
            }`}
            style={{ width: `${port.congestionLevel}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="inline-flex items-center gap-1.5 text-secondary">
            <Clock className="size-3.5" /> Waiting time
          </span>
          <span className="font-medium text-primary">{port.waitingTime} days{port.waitingRange ? ` · ${port.waitingRange}` : ""}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-line bg-panel p-3 text-center">
        <div>
          <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-secondary">
            <Waves className="size-3" /> Draft
          </div>
          <div className="text-[13px] font-semibold text-primary">{port.maxDraft}m</div>
        </div>
        <div>
          <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-secondary">
            <Ship className="size-3" /> LOA
          </div>
          <div className="text-[13px] font-semibold text-primary">{port.maxLOA}m</div>
        </div>
        <div>
          <div className="inline-flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-secondary">
            <Anchor className="size-3" /> Berths
          </div>
          <div className="text-[13px] font-semibold text-primary">
            {port.berthsAvailable}/{port.totalBerths}
          </div>
        </div>
      </div>
    </div>
  );
}