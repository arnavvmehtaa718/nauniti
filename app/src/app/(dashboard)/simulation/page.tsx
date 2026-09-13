"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Anchor,
  Gauge,
  RefreshCcw,
  RotateCcw,
  Ship,
  TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import ScenarioCard from "@/components/domain/ScenarioCard";
import CostBreakdown from "@/components/domain/CostBreakdown";
import RiskGauge from "@/components/domain/RiskGauge";
import { useAppStore } from "@/store/useAppStore";
import { CONTRACT_LABELS, formatUSD, type ContractStrategyKey } from "@/lib/calculations";
import { PORTS, VESSELS } from "@/lib/mockData";
import { runSimulation } from "@/lib/calculations";

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-secondary">{label}</span>
        <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[12px] font-semibold text-accent">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 w-full accent-accent"
      />
    </div>
  );
}

export default function SimulationPage() {
  const scenario = useAppStore((s) => s.scenario);
  const runScenario = useAppStore((s) => s.runScenario);

  const ops = scenario.options;

  const live = runSimulation(ops);

  const baseline = useMemo(
    () => runSimulation({ contract: "short", waitDays: 3.5, congestionLevel: 55, freightDeltaPct: 0 }),
    []
  );

  return (
    <div>
      <PageHeader
        title="Simulation / What-If"
        subtitle="Adjust contract structure, waiting time, congestion and freight trend to see live cost, savings and risk deltas on the 4-voyage coal program."
        right={
          <button
            onClick={() =>
              runScenario({ contract: "short", waitDays: 3.5, congestionLevel: 55, freightDeltaPct: 0 })
            }
            className="inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-[12.5px] font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
          >
            <RotateCcw className="size-4" /> Reset to baseline
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-5">
        {/* Controls */}
        <div className="space-y-4 xl:col-span-2">
          <ChartCard
            title="Scenario Controls"
            subtitle="Deterministic engine recomputes instantly"
            right={
              <span className="inline-flex items-center gap-1.5 text-[10.5px] text-secondary">
                <RefreshCcw className="size-3 animate-none" /> live
              </span>
            }
          >
            <div className="space-y-4">
              {/* Contract */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
                  Contract structure
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(CONTRACT_LABELS) as ContractStrategyKey[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => runScenario({ contract: k })}
                      className={`rounded-lg border px-2 py-2 text-[11px] font-medium transition-colors ${
                        ops.contract === k ? "border-accent bg-accent/10 text-accent" : "border-line bg-panel text-secondary hover:border-accent/40 hover:text-primary"
                      }`}
                    >
                      {k === "spot" ? "Spot" : k === "short" ? "Short MVP" : "Medium MVP"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vessel + port */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
                    Vessel
                  </label>
                  <div className="relative">
                    <Ship className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-secondary" />
                    <select
                      value={ops.vessel}
                      onChange={(e) => runScenario({ vessel: e.target.value })}
                      className="h-9 w-full rounded-lg border border-line bg-panel pl-8 pr-2 text-[12px] text-primary focus:border-accent focus:outline-none"
                    >
                      {VESSELS.map((v) => (
                        <option key={v.type}>{v.type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
                    Port
                  </label>
                  <div className="relative">
                    <Anchor className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-secondary" />
                    <select
                      value={ops.port}
                      onChange={(e) => runScenario({ port: e.target.value })}
                      className="h-9 w-full rounded-lg border border-line bg-panel pl-8 pr-2 text-[12px] text-primary focus:border-accent focus:outline-none"
                    >
                      {PORTS.map((p) => (
                        <option key={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <Slider
                label="Freight trend adjustment"
                value={ops.freightDeltaPct}
                min={-20}
                max={20}
                step={1}
                display={`${ops.freightDeltaPct > 0 ? "+" : ""}${ops.freightDeltaPct}%`}
                onChange={(v) => runScenario({ freightDeltaPct: v })}
              />
              <Slider
                label="Avg waiting time"
                value={ops.waitDays}
                min={0}
                max={12}
                step={0.5}
                display={`${ops.waitDays.toFixed(1)} days`}
                onChange={(v) => runScenario({ waitDays: v })}
              />
              <Slider
                label="Port congestion"
                value={ops.congestionLevel}
                min={0}
                max={100}
                step={1}
                display={`${ops.congestionLevel}%`}
                onChange={(v) => runScenario({ congestionLevel: v })}
              />
            </div>
          </ChartCard>
        </div>

        {/* Outputs */}
        <div className="space-y-4 xl:col-span-3">
          <ScenarioCard result={live} scenarioName="Live What-If Scenario" />

          <div className="grid gap-4 md:grid-cols-2">
            <ChartCard title="Illustrative Cost Breakdown" subtitle="Live composition">
              <CostBreakdown items={live.breakdown} total={live.totalCost} />
            </ChartCard>
            <ChartCard title="Risk Re-Score" subtitle="Composite risk under these inputs">
              <div className="flex justify-center">
                <RiskGauge score={live.riskScore} size={170} />
              </div>
            </ChartCard>
          </div>

          {/* Delta vs baseline */}
          <ChartCard title="Delta vs NauNiti Baseline" subtitle="Optimized short-term MVP recommendation">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Delta label="Total cost" value={formatUSD(live.totalCost)} delta={live.totalCost - baseline.totalCost} />
              <Delta label="Per tonne" value={formatUSD(live.costPerTonne)} delta={live.costPerTonne - baseline.costPerTonne} />
              <Delta label="Savings vs spot" value={formatUSD(live.savings)} delta={live.savings - baseline.savings} good />
              <Delta label="Risk score" value={`${live.riskScore}/100`} delta={live.riskScore - baseline.riskScore} goodWhenDown />
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-secondary">
              Waiting 8+ days or congestion above 70% erodes most of the program savings and pushes risk past the
              amber threshold. Chartering within the 7-day window on the current baseline stays the recommended path.
            </p>
            <Link
              href="/recommendation"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-nav py-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-blue-glow"
            >
              Approve this scenario in final decision <ArrowRight className="size-4" />
            </Link>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

function Delta({
  label,
  value,
  delta,
  good,
  goodWhenDown,
}: {
  label: string;
  value: string;
  delta: number;
  good?: boolean;
  goodWhenDown?: boolean;
}) {
  const isGood = good ? delta > 0 : goodWhenDown ? delta < 0 : delta < 0;
  return (
    <div className="rounded-lg border border-line bg-panel p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-secondary">
        {goodWhenDown ? <Gauge className="size-3 text-accent" /> : <TrendingUp className="size-3 text-accent" />}
        {label}
      </div>
      <div className="mt-1 text-[15px] font-semibold text-primary">{value}</div>
      <div className={`text-[10.5px] font-medium ${isGood ? "text-good" : "text-bad"}`}>
        {delta > 0 ? "+" : delta < 0 ? "−" : "±"}{Math.abs(delta).toLocaleString("en-US", { maximumFractionDigits: 0 })}
      </div>
    </div>
  );
}