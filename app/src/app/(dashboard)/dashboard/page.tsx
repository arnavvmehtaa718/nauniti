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
import api from "@/services/api";
import { formatUSD } from "@/lib/calculations";
import type { Port, Vessel } from "@/lib/mockData";
import { useAppStore } from "@/store/useAppStore";

interface DashboardData {
  rates: typeof import("@/lib/mockData").FREIGHT_RATES;
  chart: typeof import("@/lib/mockData").FREIGHT_CHART_DATA;
  ports: Port[];
  vessels: Vessel[];
  alerts: AlertItem[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const userName = useAppStore((s) => s.userName);

  useEffect(() => {
    let alive = true;
    api.getFullDashboard().then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!data) return <LoadingState full label="Assembling decision intelligence…" />;

  const portColumns: Column<Port>[] = [
    {
      header: "Port",
      render: (p) => (
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-accent/12 text-accent">
            <MapPin className="size-3.5" />
          </span>
          <div>
            <div className="font-medium text-primary">{p.name}</div>
            <div className="text-[10px] text-secondary">{p.state}</div>
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

  const sorted = [...data.vessels].sort((a, b) => b.score - a.score);

  return (
    <div>
      <PageHeader
        title={`Good day, ${userName || "Analyst"} — here's the chartering picture`}
        subtitle="Live market intelligence for Coal · 70,000 t · Hay Point → Paradip · 4 voyages"
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

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Current Freight"
          value={formatUSD(data.rates.current)}
          sub="Panamax, Australia → India"
          icon={TrendingUp}
          changeText="+2.6% w/w"
        />
        <KpiCard
          label="30-Day Forecast"
          value={formatUSD(data.rates.predicted30d)}
          sub="Confidence 87%"
          icon={LineChartIcon}
          tone="amber"
          changeText="+11.5% f/c"
        />
        <KpiCard
          label="Forecast Window"
          value="Next 7 days"
          sub="Optimal charter window"
          icon={AlarmClock}
          tone="default"
        />
        <KpiCard
          label="Expected Cost"
          value={formatUSD(6_920_000, true)}
          sub="Short-term MVP contract"
          icon={BadgeDollarSign}
          tone="blue"
        />
        <KpiCard
          label="Potential Savings"
          value="₹1.48 Cr"
          sub={formatUSD(360_000) + " vs spot"}
          icon={PiggyBank}
          tone="green"
          changeText="−4.9% cost"
          changeDirection="down"
        />
        <KpiCard
          label="Risk Score"
          value="62 / 100"
          sub="Medium · monitor congestion"
          icon={Gauge}
          tone="amber"
        />
      </div>

      {/* Row 2: Forecast + vessel */}
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title="Freight Rate Outlook — Panamax"
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
            <ForecastChart data={data.chart} />
          </ChartCard>
        </div>

        {/* Vessel recommendation */}
        <div className="flex flex-col gap-4">
          <ChartCard
            title="Vessel Compatibility"
            subtitle="Top picks for Paradip constraints"
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

      {/* Row 3: ports + route + alerts */}
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title="Port Congestion Watch — East Coast India"
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
              data={data.ports}
              rowKey={(p) => p.name}
            />
          </ChartCard>
        </div>

        <div className="flex flex-col gap-4">
          <ChartCard
            title="Recommended Route"
            subtitle="Hay Point → Paradip, best balance of cost & risk"
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
                <span className="font-semibold text-primary">6,420 nm</span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-secondary">Transit time</span>
                <span className="font-semibold text-primary">18.5 days</span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-secondary">Freight cost</span>
                <span className="font-semibold text-primary">{formatUSD(1_560_000, true)}</span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-secondary">Risk level</span>
                <RiskBadge level="Medium" label="Medium" />
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Alerts row */}
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
            {data.alerts.slice(0, 4).map((a) => (
              <AlertCard key={a.id} alert={a} />
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}