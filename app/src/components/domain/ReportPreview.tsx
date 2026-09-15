"use client";

import {
  Anchor,
  CalendarDays,
  CheckSquare,
  PackageSearch,
  PiggyBank,
  Route,
  ScrollText,
  ShieldAlert,
  Ship,
  TrendingUp,
} from "lucide-react";
import type { GeneratedReport } from "@/store/useAppStore";
import {
  CONTRACT_LABELS,
  formatUSD,
  type RiskItem,
  type RouteOption,
  type StrategyComparison,
} from "@/lib/calculations";
import CostBreakdown, { type BreakdownItem } from "@/components/domain/CostBreakdown";
import DataTable, { type Column } from "@/components/ui/DataTable";
import RiskBadge from "@/components/ui/RiskBadge";
import StatusBadge from "@/components/ui/StatusBadge";

export default function ReportPreview({ report }: { report: GeneratedReport }) {
  const { analysis } = report;
  const { inputs, costs, freight, vessels, selectedPort, routes, strategies, risks } = analysis;
  const recVessel = vessels.find((v) => v.recommended) ?? vessels[0];

  const routeColumns: Column<RouteOption>[] = [
    { header: "Route", render: (r) => <span className="font-medium">{r.name}</span> },
    { header: "Distance", render: (r) => <span>{r.distance.toLocaleString()} nm</span> },
    { header: "Duration", render: (r) => <span>{r.duration} days</span> },
    { header: "Freight", render: (r) => <span>{formatUSD(r.freightCost)}</span> },
    { header: "Fuel", render: (r) => <span>{formatUSD(r.fuelCost)}</span> },
    { header: "Port charges", render: (r) => <span>{formatUSD(r.portCharges)}</span> },
    { header: "Risk", render: (r) => <RiskBadge level={r.riskLevel} label={r.riskLevel} /> },
    {
      header: "",
      render: (r) =>
        r.recommended ? <StatusBadge status="Recommended" tone="green" /> : <span className="text-secondary/50">{r.note}</span>,
    },
  ];

  const riskColumns: Column<RiskItem>[] = [
    { header: "Category", render: (r) => <span className="font-medium">{r.category}</span> },
    { header: "Severity", render: (r) => <StatusBadge status={r.severity} /> },
    { header: "Probability", render: (r) => <span className="text-secondary">{r.probability}</span> },
    { header: "Impact", render: (r) => <span className="text-secondary">{r.impact}</span> },
    { header: "Suggested action", render: (r) => <span className="text-secondary">{r.suggestedAction}</span> },
  ];

  const strategyColumns: Column<StrategyComparison>[] = [
    { header: "Strategy", render: (s) => <span className="font-medium">{s.name}</span> },
    { header: "Total cost", render: (s) => <span>{formatUSD(s.totalCost)}</span> },
    { header: "Per tonne", render: (s) => <span>{formatUSD(s.costPerTonne)}</span> },
    { header: "Per voyage", render: (s) => <span>{formatUSD(s.costPerVoyage)}</span> },
    { header: "Price certainty", render: (s) => <StatusBadge status={s.priceCertainty} /> },
    { header: "Flexibility", render: (s) => <StatusBadge status={s.flexibility} /> },
    { header: "Market exposure", render: (s) => <StatusBadge status={s.marketExposure} /> },
    {
      header: "",
      render: (s) => (s.recommended ? <StatusBadge status="Recommended" tone="green" /> : <span />),
    },
  ];

  const costItems: BreakdownItem[] = [
    { key: "freight", name: "Freight", value: costs.freightCost },
    { key: "fuel", name: "Fuel", value: costs.fuelCost },
    { key: "portCharges", name: "Port charges", value: costs.portCharges },
    { key: "demurrage", name: "Waiting / demurrage", value: costs.waitingDemurrage },
    { key: "repositioning", name: "Repositioning", value: costs.repositioningCost },
    { key: "riskBuffer", name: "Risk buffer", value: costs.riskBuffer },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="border-b border-line pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[17px] font-bold text-primary">{report.name}</h2>
            <p className="mt-0.5 text-[12px] text-secondary">
              {report.route} \u00B7 {report.cargo} \u00B7 Generated {report.date}
            </p>
          </div>
          <StatusBadge status={report.status} tone="green" />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Stat label="Total cost" value={formatUSD(costs.total)} />
          <Stat label="Savings vs spot" value={`\u2212${analysis.savingsPercent}%`} good />
          <Stat label="Risk score" value={`${analysis.riskScore}/100`} />
          <Stat label="Confidence" value={`${analysis.confidence}%`} />
        </div>
      </div>

      {/* Cargo & voyage details */}
      <Section title="Cargo & Voyage Details" icon={PackageSearch}>
        <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          <Field label="Cargo type" value={inputs.cargo} />
          <Field label="Quantity" value={`${inputs.quantity.toLocaleString()} tonnes`} />
          <Field label="Number of voyages" value={`${inputs.voyages}`} />
          <Field label="Origin" value={inputs.originCountry} />
          <Field label="Loading port" value={inputs.loadingPort} />
          <Field label="Destination" value={inputs.destinationPort} />
          <Field label="Contract horizon" value={inputs.contractHorizon} />
          <Field label="Contract strategy" value={CONTRACT_LABELS[inputs.contractStrategy]} />
        </div>
      </Section>

      {/* Freight forecast */}
      <Section title="Freight Forecast" icon={TrendingUp}>
        <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          <Field label="Current daily rate" value={`${formatUSD(freight.current)}/day`} />
          <Field label="30-day prediction" value={`${formatUSD(freight.predicted30d)}/day`} />
          <Field label="30-day change" value={`+${freight.forecastChange30d}%`} />
          <Field label="Weekly change" value={`+${freight.weeklyChange}%`} />
          <Field label="Trend" value={freight.trend} />
          <Field label="Charting window" value={freight.chartingWindow} />
        </div>
        <div className="mt-3 rounded-lg border border-line bg-panel px-3 py-2 text-[11.5px] text-secondary">
          Forecast confidence {freight.confidence}% \u00B7 Market panel baseline for {report.route}.
        </div>
      </Section>

      {/* Recommended vessel */}
      {recVessel && (
        <Section title="Recommended Vessel" icon={Ship}>
          <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            <Field label="Vessel type" value={recVessel.type} />
            <Field label="Sizing" value={recVessel.dwt} />
            <Field label="Estimated cost / day" value={formatUSD(recVessel.costPerDay)} />
            <Field label="Score" value={`${recVessel.score}/100`} />
            <Field label="Availability" value={recVessel.availability} />
            <Field label="Compatibility score" value={`${recVessel.compatibilityScore}/100`} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <StatusBadge status={recVessel.portCompatibility} />
            <StatusBadge status={`Score ${recVessel.score}/100`} tone="slate" />
          </div>
        </Section>
      )}

      {/* Port compatibility */}
      <Section title={`Port Compatibility \u2014 ${selectedPort.name}`} icon={Anchor}>
        <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          <Field label="Congestion" value={`${selectedPort.congestion} (${selectedPort.congestionLevel}%)`} />
          <Field label="Waiting time" value={`${selectedPort.waitingTime} days`} />
          <Field label="Max draft" value={`${selectedPort.maxDraft} m`} />
          <Field label="Max LOA" value={`${selectedPort.maxLOA} m`} />
          <Field label="Max beam" value={`${selectedPort.maxBeam} m`} />
          <Field label="Berths available" value={`${selectedPort.berthsAvailable} / ${selectedPort.totalBerths}`} />
          <Field label="Cargo handling capacity" value={`${selectedPort.cargoHandlingCapacity.toLocaleString()} tonnes`} />
          <Field label="Suitable vessels" value={selectedPort.suitableVessels.join(", ")} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <RiskBadge level={selectedPort.riskLevel} label={`${selectedPort.riskLevel} risk`} />
        </div>
      </Section>

      {/* Route details */}
      <Section title="Route Details & Comparison" icon={Route}>
        <DataTable
          columns={routeColumns}
          data={routes}
          rowKey={(r) => `${r.name}-${r.distance}`}
          dense
        />
      </Section>

      {/* Total cost + cost/savings */}
      <Section title="Total Cost & Savings Analysis" icon={PiggyBank}>
        <CostBreakdown items={costItems} total={costs.total} />
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px]">
          <span className="text-secondary">
            All-in program cost: <span className="font-semibold text-primary">{formatUSD(costs.total)}</span>
          </span>
          <span className="text-good">
            Potential savings: \u2212{analysis.savingsPercent}% vs repeated spot ({formatUSD(analysis.potentialSavingsUSD)})
          </span>
        </div>
      </Section>

      {/* Risk assessment */}
      <Section title="Risk Assessment" icon={ShieldAlert}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <RiskBadge level={analysis.riskLevel} label={`Overall: ${analysis.riskLevel} (${analysis.riskScore}/100)`} />
        </div>
        <DataTable columns={riskColumns} data={risks} rowKey={(r) => r.category} dense />
      </Section>

      {/* Contract strategy comparison */}
      <Section title="Contract Strategy Comparison" icon={ScrollText}>
        <DataTable
          columns={strategyColumns}
          data={strategies}
          rowKey={(s) => s.code}
          dense
        />
      </Section>

      <p className="flex items-center gap-1.5 border-t border-line pt-3 text-[11px] text-secondary">
        <CheckSquare className="size-3.5 text-accent" />
        Generated by OceanIQ deterministic cost engine from the current procurement scenario <CalendarDays className="ml-1 size-3.5" /> {report.date}
      </p>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Ship;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-panel/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-4 text-accent" />
        <h3 className="text-[12.5px] font-semibold uppercase tracking-wider text-primary">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-[11px] uppercase tracking-wider text-secondary">{label}</span>
      <span className="truncate text-[12.5px] font-medium text-primary">{value}</span>
    </div>
  );
}

function Stat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wider text-secondary">{label}</div>
      <div className={`mt-0.5 text-[15px] font-semibold ${good ? "text-good" : "text-primary"}`}>{value}</div>
    </div>
  );
}