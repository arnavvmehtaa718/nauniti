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
import { useAppStore } from "@/store/useAppStore";
import type { PortDetail } from "@/lib/calculations";

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
  const analysis = useAppStore((s) => s.procurement.analysis);
  const [selectedPort, setSelectedPort] = useState<PortDetail>(analysis.selectedPort);

  const { inputs } = analysis;

  const congestionChart = [
    { date: "1 Sep", actual: +(selectedPort.waitingTime * 0.8).toFixed(1), forecast: null as number | null },
    { date: "5 Sep", actual: +(selectedPort.waitingTime * 0.89).toFixed(1), forecast: null },
    { date: "10 Sep", actual: +(selectedPort.waitingTime * 1.0).toFixed(1), forecast: null },
    { date: "13 Sep", actual: +(selectedPort.waitingTime * 1.0).toFixed(1), forecast: selectedPort.waitingTime },
    { date: "17 Sep", actual: null, forecast: +(selectedPort.waitingTime * 1.09).toFixed(1) },
    { date: "20 Sep", actual: null, forecast: +(selectedPort.waitingTime * 1.17).toFixed(1) },
    { date: "25 Sep", actual: null, forecast: +(selectedPort.waitingTime * 1.11).toFixed(1) },
    { date: "30 Sep", actual: null, forecast: +(selectedPort.waitingTime * 1.03).toFixed(1) },
  ];

  const comparisonColumns: Column<PortDetail>[] = [
    {
      header: "Port",
      render: (p) => (
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-accent/12 text-accent">
            <MapPin className="size-3.5" />
          </span>
          <div>
            <div className="font-medium text-primary">{p.name}</div>
            <div className="text-[10px] text-secondary">Discharge port</div>
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
          <span className="text-[11px] text-secondary">{p.congestion} \u00B7 {p.congestionLevel}%</span>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {analysis.allPorts.slice(0, 6).map((p) => (
          <PortCard
            key={p.name}
            port={{
              name: p.name,
              country: "India",
              congestion: p.congestion,
              congestionLevel: p.congestionLevel,
              waitingTime: p.waitingTime,
              cargoHandlingCapacity: p.cargoHandlingCapacity,
              maxDraft: p.maxDraft,
              maxLOA: p.maxLOA,
              maxBeam: p.maxBeam,
              berthsAvailable: p.berthsAvailable,
              totalBerths: p.totalBerths,
              suitableVessels: p.suitableVessels,
              riskLevel: p.riskLevel,
            }}
            selected={selectedPort.name === p.name}
            onSelect={setSelectedPort as any}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title={`Waiting-Time Outlook \u2014 ${selectedPort.name}`}
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
              <ComposedChart data={congestionChart} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
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

        <div>
          <ChartCard title="Infrastructure Constraints" subtitle={`${selectedPort.name} \u00B7 physical limits`}>
            <div className="space-y-2">
              <ConstraintRow label="Max draft" value={selectedPort.maxDraft} unit="m" note={selectedPort.maxDraft >= 14 ? "Panamax OK" : "Panamax restricted"} tone={selectedPort.maxDraft >= 14 ? "good" : "warn"} />
              <ConstraintRow label="Max LOA" value={selectedPort.maxLOA} unit="m" note={selectedPort.maxLOA >= 225 ? "Panamax OK" : "Panamax restricted"} tone={selectedPort.maxLOA >= 225 ? "good" : "warn"} />
              <ConstraintRow label="Max beam" value={selectedPort.maxBeam} unit="m" note="No restriction" tone="good" />
              <ConstraintRow label="Cargo handling" value={selectedPort.cargoHandlingCapacity / 1000} unit="K t/day" note={`${inputs.quantity.toLocaleString()} t fits`} tone={selectedPort.cargoHandlingCapacity >= inputs.quantity ? "good" : "bad"} />
              <ConstraintRow label="Operating berths" value={selectedPort.berthsAvailable} unit={`of ${selectedPort.totalBerths}`} note={`${selectedPort.totalBerths - selectedPort.berthsAvailable} busy`} tone={selectedPort.berthsAvailable < 2 ? "bad" : "good"} />
            </div>
          </ChartCard>
        </div>
      </div>

      <div className="mt-4">
        <ChartCard title="Port Comparison \u2014 East Coast India" subtitle="All candidate discharge terminals ranked by congestion, capacity and risk">
          <DataTable columns={comparisonColumns} data={analysis.allPorts} rowKey={(p) => p.name} />
        </ChartCard>
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
