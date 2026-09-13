"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Download,
  FileSignature,
  Gauge,
  MapPin,
  Route as RouteIcon,
  ShieldCheck,
  Ship,
  Sparkles,
  TimerReset,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";
import ChartCard from "@/components/ui/ChartCard";
import RiskBadge from "@/components/ui/RiskBadge";
import { FINAL_RECOMMENDATION } from "@/lib/mockData";
import { formatUSD, formatINR, recommendationEcho } from "@/lib/calculations";
import { useAppStore } from "@/store/useAppStore";

export default function RecommendationPage() {
  const pushToast = useAppStore((s) => s.pushToast);
  const echo = recommendationEcho();

  return (
    <div>
      <PageHeader
        title="Final Decision · Recommendation"
        subtitle="NauNiti decision brief for Coal · 70,000 t · Hay Point → Paradip · 4 voyages"
        right={
          <span className="inline-flex items-center gap-2 rounded-lg border border-accent/35 bg-accent/10 px-3 py-2 text-[12.5px] font-semibold text-accent">
            <BadgeCheck className="size-4" />
            {echo.confidence}% model confidence
          </span>
        }
      />

      {/* Decision statement */}
      <div className="rounded-2xl border border-accent/35 bg-gradient-to-br from-card to-panel p-5">
        <div className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-md bg-accent/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
          <Sparkles className="size-3.5" /> Recommended plan
        </div>
        <h2 className="mt-2 max-w-3xl text-[19px] font-semibold leading-snug text-primary">
          {`Wait ${echo.waitDays} Days + ${echo.vessel} + ${echo.route} + ${echo.contractType}`}
        </h2>
        <p className="mt-1 text-[12.5px] text-secondary">
          Wait {echo.waitDays} days for the optimal window · fixture Panamax on the recommended corridor · lock a
          Short-Term Multiple-Voyage contract to preserve flexibility while capturing freight, fuel and demurrage
          savings.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RiskBadge level={echo.riskLevel} />
          <span className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-0.5 text-[11px] text-secondary">
            <TimerReset className="size-3.5 text-accent" /> 7-day charter window
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-0.5 text-[11px] text-secondary">
            <MapPin className="size-3.5 text-accent" /> Hay Point → Paradip
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Expected Total Cost" value={formatUSD(echo.expectedTotalCost)} sub="4 voyages all-in" icon={Banknote} tone="blue" />
        <KpiCard label="Potential Savings" value={formatUSD(echo.savingsUSD)} sub="vs repeated spot" icon={CheckCircle2} tone="green" changeText="−4.9% cost" />
        <KpiCard label="Savings (INR)" value={formatINR(echo.savingsINR)} sub="≈ $360K exposure avoided" icon={ShieldCheck} tone="green" />
        <KpiCard label="Risk Posture" value="Medium" sub="score 62/100 · manageable" icon={Gauge} tone="amber" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {/* Plan components */}
        <div className="space-y-4 xl:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <PlanCard icon={Ship} label="Vessel" value={echo.vessel} sub="60K–85K DWT · 87/100 · Paradip Pass" />
            <PlanCard icon={RouteIcon} label="Route" value={echo.route} sub="6,420 nm · 18.5 days · Medium risk" />
            <PlanCard icon={FileSignature} label="Contract" value="Short-Term Multiple-Voyage" sub="9% cheaper than spot · flexible" good />
          </div>

          <ChartCard title="Why this plan won" subtitle="Evidence-based rationale from the decision engine">
            <ol className="space-y-2.5">
              {FINAL_RECOMMENDATION.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                    {i + 1}
                  </span>
                  <span className="text-[12.5px] text-secondary">{r}</span>
                </li>
              ))}
            </ol>
          </ChartCard>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <ChartCard title="Approve & Export" subtitle="Complete the decision loop">
            <div className="space-y-2.5">
              <button
                onClick={() =>
                  pushToast({ kind: "success", title: "Approved & queued for contracting", description: "Panamax fixture on Short-Term MVP has been logged to your workspace." })
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-good py-2.5 text-[12.5px] font-semibold text-emerald-950 transition-opacity hover:opacity-90"
              >
                <CheckCircle2 className="size-4" /> Approve & Generate Contract
              </button>
              <button
                onClick={() =>
                  pushToast({ kind: "info", title: "Decision brief queued for export", description: "PDF download will be ready in Reports & Downloads." })
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line py-2.5 text-[12.5px] font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
              >
                <Download className="size-4" /> Download Decision Brief
              </button>
              <Link
                href="/simulation"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-nav py-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-blue-glow"
              >
                Adjust in Simulation
              </Link>
            </div>

            <div className="mt-3 rounded-lg border border-line bg-panel p-3 text-[11.5px] leading-relaxed text-secondary">
              <div className="mb-1.5 font-semibold text-primary">Decision summary</div>
              <p>• Estimated total: <span className="text-primary">{formatUSD(echo.expectedTotalCost)}</span></p>
              <p>• Wait window: <span className="text-primary">{echo.waitDays} days</span></p>
              <p>• Confidence: <span className="text-primary">{echo.confidence}%</span></p>
              <p>• Savings: <span className="text-good">{formatUSD(echo.savingsUSD)} / {formatINR(echo.savingsINR)}</span></p>
            </div>
          </ChartCard>

          <div className="rounded-xl border border-warn/30 bg-warn/5 p-4 text-[11.5px] leading-relaxed text-secondary">
            <span className="font-semibold text-warn">Vigilance note:</span> re-validate before fixture if Paradip
            congestion crosses 70% or the 30-day freight forecast is revised above +14%.
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  icon: Icon,
  label,
  value,
  sub,
  good,
}: {
  icon: typeof Ship;
  label: string;
  value: string;
  sub: string;
  good?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${good ? "border-good/30 bg-good/5" : "border-line bg-card"}`}>
      <div className={`grid size-8 place-items-center rounded-lg ${good ? "bg-good/15 text-good" : "bg-accent/12 text-accent"}`}>
        <Icon className="size-4" />
      </div>
      <div className="mt-2.5 text-[10px] font-semibold uppercase tracking-widest text-secondary">{label}</div>
      <div className="mt-0.5 text-[14px] font-semibold text-primary">{value}</div>
      <div className="mt-0.5 text-[10.5px] text-secondary">{sub}</div>
    </div>
  );
}