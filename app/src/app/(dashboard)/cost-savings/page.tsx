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
import { COST_SAVINGS } from "@/lib/mockData";
import { formatUSD, formatINR } from "@/lib/calculations";

export default function CostSavingsPage() {
  // truthful grouped data by category
  const grouped = [
    { category: "Freight", current: COST_SAVINGS.currentStrategy.freightCost, optimized: COST_SAVINGS.optimizedStrategy.freightCost },
    { category: "Fuel", current: COST_SAVINGS.currentStrategy.fuelCost, optimized: COST_SAVINGS.optimizedStrategy.fuelCost },
    { category: "Port Charges", current: COST_SAVINGS.currentStrategy.portCharges, optimized: COST_SAVINGS.optimizedStrategy.portCharges },
    { category: "Waiting/Demurrage", current: COST_SAVINGS.currentStrategy.waitingDemurrage, optimized: COST_SAVINGS.optimizedStrategy.waitingDemurrage },
    { category: "Repositioning", current: COST_SAVINGS.currentStrategy.repositioningCost, optimized: COST_SAVINGS.optimizedStrategy.repositioningCost },
  ];

  const currentPie = [
    { name: "Freight", value: COST_SAVINGS.currentStrategy.freightCost, key: "freight" },
    { name: "Fuel", value: COST_SAVINGS.currentStrategy.fuelCost, key: "fuel" },
    { name: "Port Charges", value: COST_SAVINGS.currentStrategy.portCharges, key: "portCharges" },
    { name: "Demurrage", value: COST_SAVINGS.currentStrategy.waitingDemurrage, key: "demurrage" },
    { name: "Repositioning", value: COST_SAVINGS.currentStrategy.repositioningCost, key: "repositioning" },
  ];

  const optimizedPie = currentPie.map((p) => {
    const map: Record<string, number> = {
      freight: COST_SAVINGS.optimizedStrategy.freightCost,
      fuel: COST_SAVINGS.optimizedStrategy.fuelCost,
      portCharges: COST_SAVINGS.optimizedStrategy.portCharges,
      demurrage: COST_SAVINGS.optimizedStrategy.waitingDemurrage,
      repositioning: COST_SAVINGS.optimizedStrategy.repositioningCost,
    };
    return { ...p, value: map[p.key] };
  });

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
          <span className="font-semibold text-good">−{formatUSD(delta)}</span>
        ) : (
          <span className="font-semibold text-bad">+{formatUSD(delta)}</span>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Cost & Savings"
        subtitle="Current repeated-spot procurement vs the NauNiti-optimized charter structure for the full program."
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
        <KpiCard label="Current Strategy Cost" value={formatUSD(COST_SAVINGS.currentStrategy.totalCost)} sub={COST_SAVINGS.currentStrategy.name} icon={Wallet} tone="default" />
        <KpiCard label="Optimized Cost" value={formatUSD(COST_SAVINGS.optimizedStrategy.totalCost)} sub="Short-Term Multiple-Voyage" icon={Scale} tone="blue" />
        <KpiCard label="Total Savings" value={formatUSD(COST_SAVINGS.potentialSavingsUSD)} sub="across 4 voyages" icon={PiggyBank} tone="green" changeText="worth maintaining" />
        <KpiCard label="Savings (INR)" value={formatINR(COST_SAVINGS.potentialSavingsINR)} sub={`${COST_SAVINGS.savingsPercent}% cheaper than spot`} icon={TrendingDown} tone="green" changeText="−4.9% cost" changeDirection="down" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {/* Grouped comparison */}
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
            <span>Freight is the dominant lever — optimized structure saves <span className="font-medium text-good">{formatUSD(COST_SAVINGS.currentStrategy.freightCost - COST_SAVINGS.optimizedStrategy.freightCost)}</span> on charter rates alone.</span>
          </div>
        </ChartCard>

        {/* Donuts */}
        <ChartCard title="Cost Structure" subtitle="Composition of the current and optimized strategies">
          <div className="grid gap-4 sm:grid-cols-2">
            <PieDonut data={currentPie} title="Current (Spot)" total={COST_SAVINGS.currentStrategy.totalCost} />
            <PieDonut data={optimizedPie} title="Optimized (MVP)" total={COST_SAVINGS.optimizedStrategy.totalCost} highlight />
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
          <span className="font-semibold text-good">NauNiti insight:</span> switching to the Short-Term
          Multiple-Voyage contract program-wide realises an estimated{" "}
          <span className="font-medium text-primary">{formatUSD(COST_SAVINGS.potentialSavingsUSD)}</span> (≈
          {formatINR(COST_SAVINGS.potentialSavingsINR)}) while keeping the flexibility to renegotiate after the
          horizon — a {COST_SAVINGS.savingsPercent}% reduction in all-in procurement cost.
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