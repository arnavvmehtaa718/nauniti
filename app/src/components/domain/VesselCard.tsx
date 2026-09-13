"use client";

import { CheckCircle2, Clock, IndianRupee, Star, XCircle, AlertTriangle } from "lucide-react";
import type { Vessel } from "@/lib/mockData";
import { formatUSD } from "@/lib/calculations";
import StatusBadge from "@/components/ui/StatusBadge";

interface VesselCardProps {
  vessel: Vessel;
  onSelect?: (vessel: Vessel) => void;
  selected?: boolean;
}

const compatIcon = {
  Pass: CheckCircle2,
  Restricted: AlertTriangle,
  Fail: XCircle,
};

export default function VesselCard({ vessel, onSelect, selected }: VesselCardProps) {
  const Icon = compatIcon[vessel.portCompatibility];
  return (
    <div
      onClick={() => onSelect?.(vessel)}
      className={`relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-all ${
        selected
          ? "border-accent bg-card shadow-lg shadow-blue-nav/20"
          : "border-line bg-card hover:border-accent/50"
      }`}
    >
      {vessel.recommended && (
        <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-good py-0.5 pl-1.5 pr-2 text-[10px] font-semibold text-emerald-950">
          <Star className="size-3 fill-emerald-950" />
          Recommended
        </span>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-primary">{vessel.type}</h3>
          <p className="text-[11px] text-secondary">{vessel.dwt}</p>
        </div>
        <div className="flex items-center gap-1 text-[12px] font-semibold text-accent">
          <IndianRupee className="size-3.5" />
          {formatUSD(vessel.costPerDay)}
          <span className="text-[10px] font-normal text-secondary">/day</span>
        </div>
      </div>

      {/* Compatibility */}
      <div className="flex items-center justify-between rounded-lg border border-line bg-panel px-3 py-2">
        <div className="flex items-center gap-2">
          <Icon
            className={`size-4 ${
              vessel.portCompatibility === "Pass"
                ? "text-good"
                : vessel.portCompatibility === "Restricted"
                  ? "text-warn"
                  : "text-bad"
            }`}
          />
          <span className="text-[12px] text-secondary">Port compatibility</span>
        </div>
        <StatusBadge
          status={vessel.portCompatibility}
          tone={vessel.portCompatibility === "Pass" ? "green" : vessel.portCompatibility === "Restricted" ? "amber" : "red"}
        />
      </div>

      {/* Score */}
      <div>
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="text-secondary">Recommendation score</span>
          <span className="font-semibold text-primary">{vessel.score}/100</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-good transition-all"
            style={{ width: `${vessel.score}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-secondary">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" /> Availability: {vessel.availability}
        </span>
        <span className="inline-flex items-center gap-1">
          <IndianRupee className="size-3.5" />{formatUSD(vessel.estimatedCost)} est.
        </span>
      </div>

      {onSelect && (
        <button
          className={`mt-1 rounded-lg py-1.5 text-[12px] font-medium transition-colors ${
            selected
              ? "bg-accent/15 text-accent"
              : "border border-line text-secondary hover:border-accent/50 hover:text-accent"
          }`}
        >
          {selected ? "Selected" : "Select for charter"}
        </button>
      )}
    </div>
  );
}