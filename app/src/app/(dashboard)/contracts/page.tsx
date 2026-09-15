"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { BadgeCheck, FileSignature, Info, Star } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import StatusBadge from "@/components/ui/StatusBadge";
import CostBreakdown from "@/components/domain/CostBreakdown";
import { useAppStore } from "@/store/useAppStore";
import { formatUSD } from "@/lib/calculations";
import type { StrategyComparison } from "@/lib/calculations";

export default function ContractsPage() {
  const analysis = useAppStore((s) => s.procurement.analysis);
  const { strategies, costs, inputs, potentialSavingsUSD } = analysis;
  const selectedStrat = strategies.find((s) => s.recommended) ?? strategies[1];

  const chartData = strategies.map((s) => ({
    name: s.code,
    label: s.name,
    value: s.totalCost,
    recommended: s.recommended,
  }));

  return (
    <div>
      <PageHeader
        title="Contract Strategy"
        subtitle={`Chartering structure options for the ${inputs.quantity.toLocaleString()} t ${inputs.cargo} program across a ${inputs.contractHorizon.toLowerCase()} horizon.`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {strategies.map((s) => (
          <div
            key={s.code}
            className={`relative flex flex-col gap-3 rounded-xl border p-4 ${
              s.recommended ? "border-accent bg-card shadow-lg shadow-blue-nav/20" : "border-line bg-card"
            }`}
          >
            {s.recommended && (
              <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-good px-2 py-0.5 text-[10px] font-semibold text-emerald-950">
                <Star className="size-3 fill-emerald-950" /> OceanIQ Recommended
              </span>
            )}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-secondary">{s.code}</div>
                <h3 className="mt-0.5 text-[14px] font-semibold leading-snug text-primary">{s.name}</h3>
              </div>
              <FileSignature className={`size-5 ${s.recommended ? "text-accent" : "text-secondary"}`} />
            </div>

            <div className="flex items-end justify-between rounded-lg border border-line bg-panel p-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-secondary">Total cost</div>
                <div className="text-[20px] font-semibold text-primary">{formatUSD(s.totalCost)}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-secondary">Per tonne</div>
                <div className="text-[15px] font-semibold text-primary">{formatUSD(s.costPerTonne)}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {s.savings > 0 && (
                <span className="rounded-md bg-good/10 px-2 py-0.5 text-[11px] font-semibold text-good">
                  Saves {formatUSD(s.savings)}
                </span>
              )}
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-secondary">
                {formatUSD(s.costPerVoyage)}/voyage
              </span>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
              <AttrRow label="Price certainty" value={s.priceCertainty} />
              <AttrRow label="Flexibility" value={s.flexibility} />
              <AttrRow label="Market exposure" value={s.marketExposure} />
              <AttrRow label="Operational risk" value={s.operationalRisk} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartCard title="Total Cost Comparison" subtitle="All-in program cost by contract structure">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--color-secondary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--color-line)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--color-secondary)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `$${(v / 1_000_000).toFixed(1)}M`}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-line)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--color-primary)",
                }}
                labelStyle={{ color: "var(--color-primary)", fontWeight: 600 }}
                itemStyle={{ color: "var(--color-primary)" }}
                formatter={(value) => [formatUSD(Number(value)), "Total cost"]}
                labelFormatter={(label) => chartData.find((d) => d.name === label)?.label ?? String(label)}
              />
              <Bar dataKey="value" name="Total cost" radius={[6, 6, 0, 0]} barSize={52}>
                {chartData.map((d) => (
                  <Cell key={d.name} fill={d.recommended ? "#3b82f6" : "var(--color-line)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-4 text-[11px] text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-accent" /> Recommended
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-line" /> Alternative
            </span>
          </div>
        </ChartCard>

        <ChartCard
          title="Detailed Cost Breakdown"
          subtitle={`Recommended strategy (${selectedStrat.name}) \u2014 ${formatUSD(selectedStrat.totalCost)} all-in`}
          right={
            <span className="inline-flex items-center gap-1 rounded-md bg-good/10 px-2 py-1 text-[10.5px] font-semibold text-good">
              <BadgeCheck className="size-3.5" /> {formatUSD(potentialSavingsUSD)} saved vs spot
            </span>
          }
        >
          <CostBreakdown
            items={[
              { key: "freight", name: "Freight", value: costs.freightCost },
              { key: "fuel", name: "Fuel", value: costs.fuelCost },
              { key: "portCharges", name: "Port Charges", value: costs.portCharges },
              { key: "demurrage", name: "Waiting / Demurrage", value: costs.waitingDemurrage },
              { key: "repositioning", name: "Repositioning", value: costs.repositioningCost },
              { key: "riskBuffer", name: "Risk Buffer", value: costs.riskBuffer },
            ]}
            total={costs.total}
          />
        </ChartCard>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-accent" />
        <div className="text-[12px] leading-relaxed text-secondary">
          <span className="font-semibold text-primary">Why not medium-term?</span> It is {formatUSD(strategies[1].totalCost - strategies[2].totalCost)} cheaper but locks
          pricing for a full horizon with low flexibility — risky if demand shifts. The{" "}
          <span className="text-accent">{selectedStrat.name}</span> keeps {formatUSD(potentialSavingsUSD)} of the savings while
          retaining negotiation headroom after {inputs.contractHorizon.toLowerCase()}.{" "}
          <Link href="/cost-savings" className="font-medium text-accent hover:text-primary">
            See the full cost & savings view \u2192
          </Link>
        </div>
      </div>
    </div>
  );
}

function AttrRow({ label, value }: { label: string; value: StrategyComparison["priceCertainty"] }) {
  const tone = value === "High" ? "green" : value === "Medium" ? "amber" : "red";
  return (
    <div className="flex items-center justify-between">
      <span className="text-secondary">{label}</span>
      <StatusBadge status={value} tone={tone} />
    </div>
  );
}
