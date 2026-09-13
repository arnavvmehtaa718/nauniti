"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Flame,
  Gauge,
  Lightbulb,
  Radar,
  TrendingDown,
  TrendingUp,
  Waves,
  Wind,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";
import ChartCard from "@/components/ui/ChartCard";
import LoadingState from "@/components/ui/LoadingState";
import ForecastChart from "@/components/domain/ForecastChart";
import api from "@/services/api";
import { useEffect, useState } from "react";
import { formatUSD } from "@/lib/calculations";

const DRIVER_DETAILS: Record<string, { icon: typeof Wind; note: string; dir: "up" | "down" }> = {
  "Fuel price trend": { icon: Flame, note: "VLSFO bunker prices up 4.2% w/w, adding pressure on operating costs.", dir: "up" },
  "Commodity demand": { icon: Waves, note: "Seasonal coal restocking by Indian utilities is firming inquiry levels.", dir: "up" },
  "Seasonality": { icon: CalendarClock, note: "Post-monsoon wet-bulk demand typically rises through Q4 on export volume.", dir: "up" },
  "Port congestion": { icon: Radar, note: "East-coast discharge wait times up 0.7d across Paradip/Dhamra terminals.", dir: "up" },
};

export default function ForecastPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getFreightRates>> | null>(null);

  useEffect(() => {
    let alive = true;
    api.getFreightRates().then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!data) return <LoadingState full label="Computing 30-day rate forecast…" />;

  const { rates, chart } = data;

  return (
    <div>
      <PageHeader
        title="Freight Rate Forecast"
        subtitle="AI time-series forecast for Panamax on the Australia → East Coast India corridor, with confidence bands and market context."
        right={
          <Link
            href="/simulation"
            className="inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-[12.5px] font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
          >
            Test sensitivity <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Current Rate"
          value={formatUSD(rates.current)}
          sub="as of 13 Sep 2026"
          icon={TrendingUp}
          changeText="+2.6% w/w"
        />
        <KpiCard
          label="Predicted · 30d"
          value={formatUSD(rates.predicted30d)}
          sub="model expectation"
          icon={Gauge}
          tone="amber"
          changeText={`+${rates.forecastChange30d}% forecast`}
        />
        <KpiCard
          label="Forecast Confidence"
          value={`${rates.confidence}%`}
          sub="model ensemble agreement"
          icon={Radar}
          tone="default"
        />
        <KpiCard
          label="Recommended Action"
          value="Charter now"
          sub={`Best window: ${rates.chartingWindow}`}
          icon={CalendarClock}
          tone="green"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title="Rate Outlook — 5 weeks"
            subtitle="Solid line: actuals · dashed line: forecast · shaded band: 80% confidence interval"
            right={
              <span className="rounded-md border border-line px-2 py-1 text-[10.5px] font-medium uppercase tracking-wider text-secondary">
                {rates.trend} trend
              </span>
            }
          >
            <ForecastChart data={chart} height={340} />
          </ChartCard>
        </div>

        <div className="flex flex-col gap-4">
          {/* Summary */}
          <ChartCard title="Forecast Summary" subtitle="What the model expects">
            <div className="space-y-3">
              <p className="text-[12px] leading-relaxed text-secondary">
                Rates are expected to <span className="font-semibold text-warn">rise {rates.forecastChange30d}%</span> over
                the next 30 days, from <span className="text-primary">{formatUSD(rates.current)}</span> to{" "}
                <span className="text-primary">{formatUSD(rates.predicted30d)}</span> per day. The upward drift is driven
                by firmer fuel prices, seasonal coal demand and rising discharge congestion on the east coast.
              </p>
              <div className="space-y-2 border-t border-line pt-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-secondary">Window in which rates stay favorable</span>
                  <span className="font-semibold text-good">Next 7 days</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-secondary">Model confidence band (±250/day)</span>
                  <span className="font-semibold text-primary">{rates.confidence}%</span>
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Suggested action */}
          <div className="rounded-xl border border-good/30 bg-good/5 p-4">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-good/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-good">
              <Lightbulb className="size-3.5" /> Suggested action
            </div>
            <h3 className="text-[14px] font-semibold text-primary">
              Lock in charter capacity within the next 7 days
            </h3>
            <p className="mt-1.5 text-[12px] leading-relaxed text-secondary">
              Waiting past the window adds an estimated{" "}
              <span className="font-medium text-primary">$36K–$50K per voyage</span> — up to{" "}
              <span className="font-medium text-primary">$200K across the 4-voyage program</span>. Current Panamax
              availability supports immediate fixture.
            </p>
            <Link
              href="/recommendation"
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-good hover:text-primary"
            >
              View final recommendation <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Market drivers */}
      <div className="mt-4">
        <ChartCard title="Market Drivers" subtitle="Factors influencing the forecast horizon">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {data.drivers.map((d) => {
              const detail = DRIVER_DETAILS[d];
              const Icon = detail.icon;
              return (
                <div key={d} className="rounded-lg border border-line bg-panel p-3.5">
                  <div className="flex items-center justify-between">
                    <Icon className="size-4.5 text-accent" />
                    {detail.dir === "up" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-warn/10 px-1.5 py-0.5 text-[10px] font-medium text-warn">
                        <TrendingUp className="size-3" /> Bullish
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-good/10 px-1.5 py-0.5 text-[10px] font-medium text-good">
                        <TrendingDown className="size-3" /> Bearish
                      </span>
                    )}
                  </div>
                  <h4 className="mt-2 text-[13px] font-semibold text-primary">{d}</h4>
                  <p className="mt-1 text-[11px] leading-snug text-secondary">{detail.note}</p>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}