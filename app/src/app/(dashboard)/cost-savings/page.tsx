"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { ArrowRight, PiggyBank, Scale, TrendingDown, Wallet } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";
import ChartCard from "@/components/ui/ChartCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { useAppStore } from "@/store/useAppStore";
import { formatUSD, formatINR } from "@/lib/calculations";

export default function CostSavingsPage() {
  const analysis = useAppStore((s) => s.procurement.analysis);
  const { costs, strategies, potentialSavingsUSD, potentialSavingsINR, savingsPercent, inputs } = analysis;

  const spotStrat = strategies.find((s) => s.code === "SPOT") ?? strategies[0];
  const optStrat = strategies.find((s) => s.recommended) ?? strategies[1];

  const grouped = [
    { category: "Freight", current: spotStrat.totalCost * 0.844, optimized: costs.freightCost },
    { category: "Fuel", current: spotStrat.totalCost * 0.061, optimized: costs.fuelCost },
    { category: "Port Charges", current: spotStrat.totalCost * 0.049, optimized: costs.portCharges },
    { category: "Waiting/Demurrage", current: spotStrat.totalCost * 0.035, optimized: costs.waitingDemurrage },
    { category: "Repositioning", current: spotStrat.totalCost * 0.013, optimized: costs.repositioningCost },
  ];

  const currentPie = [
    { name: "Freight", value: grouped[0].current, key: "freight" },
    { name: "Fuel", value: grouped[1].current, key: "fuel" },
    { name: "Port Charges", value: grouped[2].current, key: "portCharges" },
    { name: "Demurrage", value: grouped[3].current, key: "demurrage" },
    { name: "Repositioning", value: grouped[4].current, key: "repositioning" },
  ];

  const optimizedPie = [
    { name: "Freight", value: grouped[0].optimized, key: "freight" },
    { name: "Fuel", value: grouped[1].optimized, key: "fuel" },
    { name: "Port Charges", value: grouped[2].optimized, key: "portCharges" },
    { name: "Demurrage", value: grouped[3].optimized, key: "demurrage" },
    { name: "Repositioning", value: grouped[4].optimized, key: "repositioning" },
  ];

  const columns: Column<typeof grouped[number]>[] = [
    { header: "Cost Component", render: (r) => <span className="font-medium text-primary">{r.category}</span> },
    { header: "Current (Spot)", align: "right", render: (r) => <span className="text-secondary">{formatUSD(r.current)}</span> },
    { header: "Optimized (MVP)", align: "right", render: (r) => <span className="text-secondary">{formatUSD(r.optimized)}</span> },
    {
      header: "Delta",
      align: "right",
      render: (r) => {
        const delta = r.current - r.optimized;
        return delta >= 0 ? (
          <span className="font-semibold text-good">\u2212{formatUSD(delta)}</span>
        ) : (
          <span className="font-semibold text-bad">+{formatUSD(Math.abs(delta))}</span>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Cost & Savings"
        subtitle={`Current repeated-spot procurement vs the OceanIQ-optimized charter structure for the ${inputs.voyages}-voyage program.`}
        right={
          <Link
            href="/contracts"
            className="inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-[12.5px] font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
          >
            Contract strategy <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Current Strategy Cost" value={formatUSD(spotStrat.totalCost)} sub={spotStrat.name} icon={Wallet} tone="default" />
        <KpiCard label="Optimized Cost" value={formatUSD(optStrat.totalCost)} sub={optStrat.name} icon={Scale} tone="blue" />
        <KpiCard label="Total Savings" value={formatUSD(potentialSavingsUSD)} sub={`across ${inputs.voyages} voyages`} icon={PiggyBank} tone="green" changeText="worth maintaining" />
        <KpiCard label="Savings (INR)" value={formatINR(potentialSavingsINR)} sub={`${savingsPercent}% cheaper than spot`} icon={TrendingDown} tone="green" changeText={`\u2212${savingsPercent}% cost`} changeDirection="down" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartCard title="Cost Comparison by Component" subtitle="Current vs optimized across the full program">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={grouped} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" tick={{ fill: "var(--color-secondary)", fontSize: 10.5 }} axisLine={{ stroke: "var(--color-line)" }} tickLine={false} />
              <YAxis tick={{ fill: "var(--color-secondary)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-line)", borderRadius: 8, fontSize: 12, color: "var(--color-primary)" }}
                labelStyle={{ color: "var(--color-primary)", fontWeight: 600 }}
                itemStyle={{ color: "var(--color-primary)" }}
                formatter={(value, name) => [formatUSD(Number(value)), String(name)]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={7} />
              <Bar dataKey="current" name="Current (Spot)" fill="var(--color-line)" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="optimized" name="Optimized (MVP)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-secondary">
            <span>Freight is the dominant lever — optimized structure saves <span className="font-medium text-good">{formatUSD(spotStrat.totalCost * 0.844 - costs.freightCost)}</span> on charter rates alone.</span>
          </div>
        </ChartCard>

        <ChartCard title="Cost Structure" subtitle="Composition of the current and optimized strategies">
          <div className="grid gap-4 sm:grid-cols-2">
            <PieDonut data={currentPie} title="Current (Spot)" total={spotStrat.totalCost} />
            <PieDonut data={optimizedPie} title="Optimized (MVP)" total={optStrat.totalCost} highlight />
          </div>
        </ChartCard>
      </div>

      <div className="mt-4">
        <ChartCard title="Line-Item Comparison" subtitle="Every component of the program, before and after optimization">
          <DataTable columns={columns} data={grouped} rowKey={(r) => r.category} />
        </ChartCard>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-good/30 bg-good/5 p-4">
        <PiggyBank className="mt-0.5 size-4 shrink-0 text-good" />
        <p className="text-[12px] leading-relaxed text-secondary">
          <span className="font-semibold text-good">OceanIQ insight:</span> switching to the {optStrat.name} contract program-wide realises an estimated{" "}
          <span className="font-medium text-primary">{formatUSD(potentialSavingsUSD)}</span> ({"\u2248"}
          {formatINR(potentialSavingsINR)}) while keeping the flexibility to renegotiate after the
          horizon — a {savingsPercent}% reduction in all-in procurement cost.
        </p>
      </div>
    </div>
  );
}

function PieDonut({
  data,
  title,
  total,
  highlight,
}: {
  data: { name: string; value: number; key: string }[];
  title: string;
  total: number;
  highlight?: boolean;
}) {
  const MINI_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "border-accent/40 bg-accent/5" : "border-line bg-panel"}`}>
      <div className="mb-2 flex items-center justify-between">
        <h4 className={`text-[12.5px] font-semibold ${highlight ? "text-accent" : "text-primary"}`}>{title}</h4>
        <span className="text-[11px] text-secondary">{formatUSD(total)}</span>
      </div>
      <ResponsiveContainer width="100%" height={170}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={68} paddingAngle={2} stroke="#0a0e1a" strokeWidth={2}>
            {data.map((d, i) => (
              <Cell key={d.key} fill={highlight && d.key === "freight" ? "#3b82f6" : MINI_COLORS[i % MINI_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-line)", borderRadius: 8, fontSize: 12, color: "var(--color-primary)" }}
            labelStyle={{ color: "var(--color-primary)", fontWeight: 600 }}
            itemStyle={{ color: "var(--color-primary)" }}
            formatter={(value, name) => [formatUSD(Number(value)), String(name)]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-1 space-y-1">
        {data.map((d, i) => (
          <div key={d.key} className="flex items-center gap-2 text-[10.5px] text-secondary">
            <span className="size-2 rounded-sm" style={{ background: MINI_COLORS[i % MINI_COLORS.length] }} />
            <span className="flex-1">{d.name}</span>
            <span className="font-medium text-primary">{((d.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
