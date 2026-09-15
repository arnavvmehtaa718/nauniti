"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlarmClock,
  ArrowRight,
  BadgeDollarSign,
  ClipboardList,
  Gauge,
  LineChart as LineChartIcon,
  MapPin,
  PiggyBank,
  Ship,
  TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";
import ChartCard from "@/components/ui/ChartCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import RiskBadge from "@/components/ui/RiskBadge";
import LoadingState from "@/components/ui/LoadingState";
import ForecastChart from "@/components/domain/ForecastChart";
import AlertCard, { type AlertItem } from "@/components/domain/AlertCard";
import { useAppStore } from "@/store/useAppStore";
import { formatUSD } from "@/lib/calculations";
import type { PortDetail } from "@/lib/calculations";

export default function DashboardPage() {
  const analysis = useAppStore((s) => s.procurement.analysis);
  const userName = useAppStore((s) => s.userName);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (!loaded) return <LoadingState full label="Assembling decision intelligence…" />;

  const { freight, vessels, allPorts, routes, costs, riskScore, alerts, inputs, potentialSavingsUSD, potentialSavingsINR, savingsPercent, confidence } = analysis;
  const recommended = routes.find((r) => r.recommended) ?? routes[0];
  const chart = [
    { date: "13 Aug", rate: Math.round(freight.current * 0.89), forecast: null as number | null, lower: null as number | null, upper: null as number | null },
    { date: "20 Aug", rate: Math.round(freight.current * 0.91), forecast: null, lower: null, upper: null },
    { date: "27 Aug", rate: Math.round(freight.current * 0.935), forecast: null, lower: null, upper: null },
    { date: "03 Sep", rate: Math.round(freight.current * 0.965), forecast: null, lower: null, upper: null },
    { date: "10 Sep", rate: Math.round(freight.current * 0.985), forecast: null, lower: null, upper: null },
    { date: "13 Sep", rate: freight.current, forecast: freight.current, lower: freight.current - 250, upper: freight.current + 250 },
    { date: "20 Sep", rate: null, forecast: Math.round(freight.current * 1.03), lower: Math.round(freight.current * 1.005), upper: Math.round(freight.current * 1.055) },
    { date: "27 Sep", rate: null, forecast: Math.round(freight.current * 1.065), lower: Math.round(freight.current * 1.03), upper: Math.round(freight.current * 1.1) },
    { date: "04 Oct", rate: null, forecast: Math.round(freight.current * 1.09), lower: Math.round(freight.current * 1.045), upper: Math.round(freight.current * 1.135) },
    { date: "11 Oct", rate: null, forecast: freight.predicted30d, lower: freight.predicted30d - 500, upper: freight.predicted30d + 500 },
  ];

  const portColumns: Column<PortDetail>[] = [
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
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
            <div
              className={`h-full rounded-full ${p.congestionLevel >= 60 ? "bg-bad" : p.congestionLevel >= 45 ? "bg-warn" : "bg-good"}`}
              style={{ width: `${p.congestionLevel}%` }}
            />
          </div>
          <span className="text-[11px] text-secondary">{p.congestionLevel}%</span>
        </div>
      ),
    },
    {
      header: "Waiting",
      align: "right",
      render: (p) => <span className="text-primary">{p.waitingTime} d</span>,
    },
    {
      header: "Draft",
      align: "right",
      render: (p) => <span className="text-primary">{p.maxDraft} m</span>,
    },
    {
      header: "Risk",
      render: (p) => <RiskBadge level={p.riskLevel} label={p.riskLevel} />,
    },
  ];

  const sorted = [...vessels].sort((a, b) => b.score - a.score);

  return (
    <div>
      <PageHeader
        title={`Good day, ${userName || "Analyst"} — here's the chartering picture`}
        subtitle={`${inputs.cargo} \u00B7 ${inputs.quantity.toLocaleString()} t \u00B7 ${inputs.loadingPort} \u2192 ${inputs.destinationPort} \u00B7 ${inputs.voyages} voyages`}
        right={
          <Link
            href="/procurement"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-nav px-3.5 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-blue-glow"
          >
            <ClipboardList className="size-4" />
            New Procurement Analysis
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Current Freight"
          value={formatUSD(freight.current)}
          sub={`${vessels.find((v) => v.recommended)?.type ?? "Panamax"}, ${inputs.originCountry} \u2192 India`}
          icon={TrendingUp}
          changeText={`+${freight.weeklyChange}% w/w`}
        />
        <KpiCard
          label="30-Day Forecast"
          value={formatUSD(freight.predicted30d)}
          sub={`Confidence ${freight.confidence}%`}
          icon={LineChartIcon}
          tone="amber"
          changeText={`+${freight.forecastChange30d}% f/c`}
        />
        <KpiCard
          label="Forecast Window"
          value={freight.chartingWindow}
          sub="Optimal charter window"
          icon={AlarmClock}
          tone="default"
        />
        <KpiCard
          label="Expected Cost"
          value={formatUSD(costs.total, true)}
          sub={`${inputs.contractStrategy === "short" ? "Short-term" : inputs.contractStrategy === "medium" ? "Medium-term" : "Spot"} contract`}
          icon={BadgeDollarSign}
          tone="blue"
        />
        <KpiCard
          label="Potential Savings"
          value={formatUSD(potentialSavingsUSD, true)}
          sub={`${formatUSD(potentialSavingsUSD)} vs spot`}
          icon={PiggyBank}
          tone="green"
          changeText={`\u2212${savingsPercent}% cost`}
          changeDirection="down"
        />
        <KpiCard
          label="Risk Score"
          value={`${riskScore} / 100`}
          sub={`${analysis.riskLevel} \u00B7 monitor congestion`}
          icon={Gauge}
          tone="amber"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title={`Freight Rate Outlook \u2014 ${vessels.find((v) => v.recommended)?.type ?? "Panamax"}`}
            subtitle="Historical rates with 30-day AI forecast and confidence band"
            right={
              <Link
                href="/forecast"
                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent hover:text-primary"
              >
                Full forecast <ArrowRight className="size-3.5" />
              </Link>
            }
          >
            <ForecastChart data={chart} />
          </ChartCard>
        </div>

        <div className="flex flex-col gap-4">
          <ChartCard
            title="Vessel Compatibility"
            subtitle={`Top picks for ${inputs.destinationPort} constraints`}
            right={
              <Link
                href="/vessels"
                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent hover:text-primary"
              >
                Compare <ArrowRight className="size-3.5" />
              </Link>
            }
          >
            <div className="space-y-3">
              {sorted.map((v) => (
                <Link
                  key={v.type}
                  href="/vessels"
                  className={`block rounded-lg border p-3 transition-colors ${
                    v.recommended ? "border-accent bg-accent/5" : "border-line hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ship className={`size-4 ${v.recommended ? "text-accent" : "text-secondary"}`} />
                      <span className="text-[13px] font-semibold text-primary">{v.type}</span>
                      {v.recommended && (
                        <span className="rounded bg-good/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-good">
                          Best
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] font-medium text-primary">{v.score}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                    <div
                      className={`h-full rounded-full ${v.recommended ? "bg-good" : "bg-accent/70"}`}
                      style={{ width: `${v.score}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title={`Port Congestion Watch \u2014 East Coast India`}
            subtitle="Waiting times and draft constraints across candidate discharge ports"
            right={
              <Link
                href="/ports"
                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent hover:text-primary"
              >
                Port analytics <ArrowRight className="size-3.5" />
              </Link>
            }
          >
            <DataTable
              columns={portColumns}
              data={allPorts}
              rowKey={(p) => p.name}
            />
          </ChartCard>
        </div>

        <div className="flex flex-col gap-4">
          <ChartCard
            title="Recommended Route"
            subtitle={`${recommended.origin} \u2192 ${recommended.destination}, best balance of cost & risk`}
            right={
              <Link
                href="/routes"
                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent hover:text-primary"
              >
                Optimize <ArrowRight className="size-3.5" />
              </Link>
            }
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-secondary">Distance</span>
                <span className="font-semibold text-primary">{recommended.distance.toLocaleString()} nm</span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-secondary">Transit time</span>
                <span className="font-semibold text-primary">{recommended.duration} days</span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-secondary">Freight cost</span>
                <span className="font-semibold text-primary">{formatUSD(recommended.freightCost, true)}</span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-secondary">Risk level</span>
                <RiskBadge level={recommended.riskLevel} label={recommended.riskLevel} />
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      <div className="mt-4">
        <ChartCard
          title="Active Alerts & Advisory"
          subtitle="Latest operational and market advisories"
          right={
            <Link
              href="/risk"
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent hover:text-primary"
            >
              Risk center <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {alerts.slice(0, 4).map((a) => (
              <AlertCard key={a.id} alert={a as AlertItem} />
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
