"use client";

import { useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Anchor,
  ArrowRight,
  Gauge,
  MapPin,
  Ship,
  TimerReset,
  Waves,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import RiskBadge from "@/components/ui/RiskBadge";
import PortCard from "@/components/domain/PortCard";
import { PORT_CONGESTION_CHART_DATA, PORTS, type Port } from "@/lib/mockData";
import Link from "next/link";

function CongestionTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; dataKey?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 text-[12px] shadow-xl shadow-black/40">
      <div className="mb-1 text-[11px] text-secondary">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.dataKey?.includes("forecast") ? "#f59e0b" : "#3b82f6" }} />
          <span className="text-secondary">{p.name}</span>
          <span className="ml-auto font-medium text-primary">{p.value?.toFixed(1)} day avg</span>
        </div>
      ))}
    </div>
  );
}

export default function PortsPage() {
  const [selectedPort, setSelectedPort] = useState<Port>(PORTS[0]);

  const comparisonColumns: Column<Port>[] = [
    {
      header: "Port",
      render: (p) => (
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-accent/12 text-accent">
            <MapPin className="size-3.5" />
          </span>
          <div>
            <div className="font-medium text-primary">{p.name}</div>
            <div className="text-[10px] text-secondary">{p.state} · {p.coast}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Congestion",
      render: (p) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-line">
            <div
              className={`h-full rounded-full ${p.congestionLevel >= 60 ? "bg-bad" : p.congestionLevel >= 45 ? "bg-warn" : "bg-good"}`}
              style={{ width: `${p.congestionLevel}%` }}
            />
          </div>
          <span className="text-[11px] text-secondary">{p.congestion} · {p.congestionLevel}%</span>
        </div>
      ),
    },
    {
      header: "Waiting",
      align: "right",
      render: (p) => <span className="text-primary">{p.waitingTime} d</span>,
    },
    {
      header: "Handling",
      align: "right",
      render: (p) => <span className="text-primary">{(p.cargoHandlingCapacity / 1000).toFixed(0)}K t/d</span>,
    },
    {
      header: "Draft",
      align: "right",
      render: (p) => <span className="text-primary">{p.maxDraft} m</span>,
    },
    {
      header: "Vessels",
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.suitableVessels.map((v) => (
            <span key={v} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-secondary">{v}</span>
          ))}
        </div>
      ),
    },
    {
      header: "Risk",
      render: (p) => <RiskBadge level={p.riskLevel} label={p.riskLevel} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Port Analytics"
        subtitle={`Discharge-port intelligence for the ${selectedPort.name} option, including infrastructure constraints, congestion outlook and coast-wide comparison.`}
      />

      {/* Port selector */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PORTS.slice(0, 6).map((p) => (
          <PortCard key={p.name} port={p} selected={selectedPort.name === p.name} onSelect={setSelectedPort} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {/* Congestion chart */}
        <div className="xl:col-span-2">
          <ChartCard
            title={`Waiting-Time Outlook — ${selectedPort.name}`}
            subtitle="Observed average anchorage delay with a 2-week forecast (days)"
            right={
              <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10.5px] font-medium uppercase tracking-wider ${
                selectedPort.congestionLevel >= 60 ? "bg-bad/10 text-bad" : selectedPort.congestionLevel >= 45 ? "bg-warn/10 text-warn" : "bg-good/10 text-good"
              }`}>
                <Gauge className="size-3" /> {selectedPort.congestion}
              </span>
            }
          >
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={PORT_CONGESTION_CHART_DATA} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="waitBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "var(--color-secondary)", fontSize: 11 }} axisLine={{ stroke: "var(--color-line)" }} tickLine={false} />
                <YAxis tick={{ fill: "var(--color-secondary)", fontSize: 11 }} axisLine={false} tickLine={false} unit=" d" />
                <Tooltip content={<CongestionTooltip />} cursor={{ stroke: "#2563eb", strokeDasharray: "4 4", strokeOpacity: 0.5 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={7} />
                <Area dataKey="actual" name="Observed" fill="url(#waitBand)" stroke="none" stackId="a" />
                <Line dataKey="actual" name="Observed waiting" type="monotone" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: "#3b82f6" }} />
                <Line dataKey="forecast" name="Forecast" type="monotone" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3, fill: "#f59e0b" }} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <InfoChip icon={TimerReset} label={`Wait: ${selectedPort.waitingTime} days avg`} />
              <InfoChip icon={Waves} label={`Handle: ${(selectedPort.cargoHandlingCapacity / 1000).toFixed(0)}K t/day`} />
              <InfoChip icon={Anchor} label={`Berths: ${selectedPort.berthsAvailable}/${selectedPort.totalBerths} free`} />
              <InfoChip icon={Ship} label={`Fits: ${selectedPort.suitableVessels.join(", ")}`} />
            </div>
          </ChartCard>
        </div>

        {/* Infrastructure constraints */}
        <div>
          <ChartCard title="Infrastructure Constraints" subtitle={`${selectedPort.name} · physical limits`}>
            <div className="space-y-2">
              <ConstraintRow label="Max draft" value={selectedPort.maxDraft} unit="m" note={selectedPort.maxDraft >= 14 ? "Panamax OK" : "Panamax restricted"} tone={selectedPort.maxDraft >= 14 ? "good" : "warn"} />
              <ConstraintRow label="Max LOA" value={selectedPort.maxLOA} unit="m" note={selectedPort.maxLOA >= 225 ? "Panamax OK" : "Panamax restricted"} tone={selectedPort.maxLOA >= 225 ? "good" : "warn"} />
              <ConstraintRow label="Max beam" value={selectedPort.maxBeam} unit="m" note={selectedPort.maxBeam >= 40 ? "No restriction" : "Within limits"} tone={selectedPort.maxBeam >= 40 ? "good" : "good"} />
              <ConstraintRow label="Cargo handling" value={selectedPort.cargoHandlingCapacity / 1000} unit="K t/day" note={selectedPort.cargoHandlingCapacity >= 70000 ? "70K t fits" : "70K t at risk"} tone={selectedPort.cargoHandlingCapacity >= 70000 ? "good" : "bad"} />
              <ConstraintRow label="Operating berths" value={selectedPort.berthsAvailable} unit={`of ${selectedPort.totalBerths}`} note={`${selectedPort.totalBerths - selectedPort.berthsAvailable} busy`} tone={selectedPort.berthsAvailable < 2 ? "bad" : "good"} />
            </div>
            <Link
              href="/vessels"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-nav py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-blue-glow"
            >
              Check vessel compatibility <ArrowRight className="size-3.5" />
            </Link>
          </ChartCard>
        </div>
      </div>

      {/* Comparison table */}
      <div className="mt-4">
        <ChartCard title="Port Comparison — East Coast India" subtitle="All candidate discharge terminals ranked by congestion, capacity and risk">
          <DataTable columns={comparisonColumns} data={PORTS} rowKey={(p) => p.name} />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SummaryStat icon={Gauge} label="Best availability" value="Gangavaram" sub="25% congestion · 1.2 d wait" tone="good" />
        <SummaryStat icon={Waves} label="Deepest draft" value="Gangavaram" sub="16.5 m max · cape-size capable" tone="accent" />
        <SummaryStat icon={Anchor} label="NauNiti pick" value="Paradip" sub="Closest to SAIL plants · 85K t/d" tone="blue" />
      </div>
    </div>
  );
}

function InfoChip({ icon: Icon, label }: { icon: typeof Waves; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-2 py-1 text-[11px] text-secondary">
      <Icon className="size-3.5 text-accent" />
      {label}
    </span>
  );
}

function ConstraintRow({
  label,
  value,
  unit,
  note,
  tone,
}: {
  label: string;
  value: number;
  unit: string;
  note: string;
  tone: "good" | "warn" | "bad";
}) {
  const color = tone === "good" ? "text-good" : tone === "warn" ? "text-warn" : "text-bad";
  return (
    <div className="flex items-center justify-between rounded-lg border border-line bg-panel px-3 py-2.5">
      <div>
        <div className="text-[11px] text-secondary">{label}</div>
        <div className="text-[14px] font-semibold text-primary">{value} {unit}</div>
      </div>
      <span className={`text-[10.5px] ${color}`}>{note}</span>
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  sub: string;
  tone: "good" | "accent" | "blue";
}) {
  const color = tone === "good" ? "text-good" : "text-accent";
  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-secondary">
        <Icon className={`size-3.5 ${color}`} />
        {label}
      </div>
      <div className="mt-1.5 text-[15px] font-semibold text-primary">{value}</div>
      <div className="text-[11px] text-secondary">{sub}</div>
    </div>
  );
}