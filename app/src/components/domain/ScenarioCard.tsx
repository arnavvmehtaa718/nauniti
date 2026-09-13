"use client";

import { TrendingUp } from "lucide-react";
import type { SimulationResult } from "@/lib/calculations";
import { formatUSD } from "@/lib/calculations";
import RiskBadge from "@/components/ui/RiskBadge";

interface ScenarioCardProps {
  result: SimulationResult;
  scenarioName?: string;
  compact?: boolean;
}

export default function ScenarioCard({ result, scenarioName, compact }: ScenarioCardProps) {
  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-accent/15 text-accent">
            <TrendingUp className="size-3.5" />
          </span>
          <div>
            <div className="text-[13px] font-semibold text-primary">
              {scenarioName ?? "Simulated Scenario"}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-secondary">
              Live deterministic model
            </div>
          </div>
        </div>
        <RiskBadge level={result.riskLevel} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-line bg-panel p-3">
          <div className="text-[10px] uppercase tracking-wider text-secondary">Total cost</div>
          <div className="mt-1 text-[20px] font-semibold text-primary">
            {formatUSD(result.totalCost)}
          </div>
        </div>
        <div className="rounded-lg border border-good/25 bg-good/5 p-3">
          <div className="text-[10px] uppercase tracking-wider text-good">Savings vs spot</div>
          <div className="mt-1 text-[20px] font-semibold text-good">
            +{formatUSD(result.savings)}
          </div>
          <div className="text-[10px] text-good/70">
            {result.savingsPercent.toFixed(1)}% cheaper
          </div>
        </div>
        {!compact && (
          <>
            <div className="rounded-lg border border-line bg-panel p-3">
              <div className="text-[10px] uppercase tracking-wider text-secondary">Cost / tonne</div>
              <div className="mt-1 text-[16px] font-semibold text-primary">
                {formatUSD(result.costPerTonne)}
              </div>
            </div>
            <div className="rounded-lg border border-line bg-panel p-3">
              <div className="text-[10px] uppercase tracking-wider text-secondary">Risk score</div>
              <div className="mt-1 text-[16px] font-semibold text-primary">
                {result.riskScore}/100
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}