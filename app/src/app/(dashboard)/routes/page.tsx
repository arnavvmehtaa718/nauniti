"use client";

import Link from "next/link";
import {
  Anchor,
  ArrowRight,
  Clock,
  Fuel,
  Map,
  Navigation,
  Route as RouteIcon,
  Ship,
  TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import RiskBadge from "@/components/ui/RiskBadge";
import RouteVisualization from "@/components/domain/RouteVisualization";
import { ROUTES, type Route } from "@/lib/mockData";
import { formatUSD } from "@/lib/calculations";

export default function RoutesPage() {
  const recommended = ROUTES.find((r) => r.recommended) ?? ROUTES[0];

  const columns: Column<Route>[] = [
    {
      header: "Route",
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-accent/12 text-accent">
            <RouteIcon className="size-3.5" />
          </span>
          <div>
            <div className="font-medium text-primary">
              {r.name}
              {r.recommended && (
                <span className="ml-2 rounded bg-good/15 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase text-good">
                  Recommended
                </span>
              )}
            </div>
            <div className="text-[10px] text-secondary">{r.origin} → {r.destination}</div>
          </div>
        </div>
      ),
    },
    { header: "Distance", align: "right", render: (r) => <span className="text-primary">{r.distance.toLocaleString()} nm</span> },
    { header: "Duration", align: "right", render: (r) => <span className="text-primary">{r.duration} d</span> },
    { header: "Freight", align: "right", render: (r) => <span className="text-primary">{formatUSD(r.freightCost)}</span> },
    { header: "Fuel", align: "right", render: (r) => <span className="text-primary">{formatUSD(r.fuelCost)}</span> },
    { header: "Port charges", align: "right", render: (r) => <span className="text-primary">{formatUSD(r.portCharges)}</span> },
    { header: "Total", align: "right", render: (r) => <span className="font-semibold text-primary">{formatUSD(r.freightCost + r.fuelCost + r.portCharges)}</span> },
    { header: "Risk", render: (r) => <RiskBadge level={r.riskLevel} label={r.riskLevel} /> },
    { header: "Note", render: (r) => <span className="text-[11px] text-secondary">{r.note}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Route Optimization"
        subtitle="Transit options for Hay Point → Paradip (Panamax, 70,000 t) screened for time, cost and operational risk."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Visualization */}
        <div className="xl:col-span-2">
          <ChartCard
            title="Recommended Corridor"
            subtitle="Animating vessel position along the optimized great-circle transit"
            right={
              <Link
                href="/simulation"
                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent hover:text-primary"
              >
                What-if <ArrowRight className="size-3.5" />
              </Link>
            }
          >
            <RouteVisualization
              origin={recommended.origin}
              destination={recommended.destination}
              distance={recommended.distance}
              duration={recommended.duration}
              risk={recommended.riskLevel}
            />
          </ChartCard>
        </div>

        {/* Metrics */}
        <div className="flex flex-col gap-4">
          <ChartCard title="Recommended Route Metrics" subtitle="Hay Point → Paradip">
            <div className="grid grid-cols-2 gap-2.5">
              <Metric icon={Navigation} label="Distance" value={`${recommended.distance.toLocaleString()} nm`} />
              <Metric icon={Clock} label="Transit time" value={`${recommended.duration} days`} />
              <Metric icon={TrendingUp} label="Freight cost" value={formatUSD(recommended.freightCost)} />
              <Metric icon={Fuel} label="Fuel cost" value={formatUSD(recommended.fuelCost)} />
              <Metric icon={Anchor} label="Port charges" value={formatUSD(recommended.portCharges)} />
              <Metric icon={Ship} label="Total" value={formatUSD(recommended.freightCost + recommended.fuelCost + recommended.portCharges)} good />
            </div>
            <div className="mt-3 rounded-lg border border-line bg-panel p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-secondary">Operational risk</span>
                <RiskBadge level={recommended.riskLevel} label={recommended.riskLevel} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-secondary">Best balance of cost and time</span>
                <span className="font-medium text-accent">Balanced</span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Comparison table */}
      <div className="mt-4">
        <ChartCard title="Route Comparison" subtitle="All screened transit alternatives with cost components">
          <DataTable columns={columns} data={ROUTES} rowKey={(r) => r.name} />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <NoteCard tone="good" title="Recommended" text="Direct great-circle keeps fuel and demurrage at a minimum while draft risk stays Medium." />
        <NoteCard tone="accent" title="Southern alternative" text="A slightly longer, lower-risk lane — useful fallback if Indian Ocean weather advisories escalate." />
        <NoteCard tone="warn" title="Northern alternative" text="Longest transit with highest fuel burn; only relevant if southern lanes face closure." />
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  good,
}: {
  icon: typeof Navigation;
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="rounded-lg border border-line bg-panel p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-secondary">
        <Icon className="size-3 text-accent" />
        {label}
      </div>
      <div className={`mt-1 text-[16px] font-semibold ${good ? "text-good" : "text-primary"}`}>{value}</div>
    </div>
  );
}

function NoteCard({ tone, title, text }: { tone: "good" | "accent" | "warn"; title: string; text: string }) {
  const border = tone === "good" ? "border-good/30" : tone === "accent" ? "border-accent/30" : "border-warn/30";
  const textTone = tone === "good" ? "text-good" : tone === "accent" ? "text-accent" : "text-warn";
  return (
    <div className={`rounded-xl border ${border} bg-card p-4`}>
      <div className="flex items-center gap-2">
        <Map className={`size-4 ${textTone}`} />
        <h3 className={`text-[13px] font-semibold ${textTone}`}>{title}</h3>
      </div>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-secondary">{text}</p>
    </div>
  );
}