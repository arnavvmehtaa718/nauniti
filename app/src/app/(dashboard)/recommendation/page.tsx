"use client";

import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Download,
  FileDown,
  FileSignature,
  Gauge,
  MapPin,
  Route as RouteIcon,
  ScrollText,
  ShieldCheck,
  Ship,
  Sparkles,
  TimerReset,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";
import ChartCard from "@/components/ui/ChartCard";
import RiskBadge from "@/components/ui/RiskBadge";
import { CONTRACT_LABELS, clamp, formatUSD, formatINR } from "@/lib/calculations";
import { useAppStore } from "@/store/useAppStore";

export default function RecommendationPage() {
  const router = useRouter();
  const pushToast = useAppStore((s) => s.pushToast);
  const addReport = useAppStore((s) => s.addReport);
  const reports = useAppStore((s) => s.reports);
  const analysis = useAppStore((s) => s.procurement.analysis);

  const { inputs, costs, freight, vessels, selectedPort, routes, strategies } = analysis;
  const recVessel = vessels.find((v) => v.recommended) ?? vessels[0];
  const recRoute = routes.find((r) => r.recommended) ?? routes[0];
  const recStrategy = strategies.find((s) => s.recommended) ?? strategies[0];

  const waitDays = clamp(Math.round(selectedPort.congestionLevel / 8), 3, 14);
  const routeLabel = `${inputs.loadingPort} → ${inputs.destinationPort}`;
  const contractLabel = CONTRACT_LABELS[inputs.contractStrategy];
  const reasons = buildReasons(analysis);

  const handleGenerateReport = () => {
    const report = addReport("PDF", ["Freight forecast", "Vessel compatibility", "Port congestion", "Route comparison", "Contract strategy", "Risk matrix"]);
    pushToast({
      kind: "success",
      title: "Report generated",
      description: `${report.name} (${report.cargo} · ${report.quantity.toLocaleString()} t) · ${report.route}`,
    });
    router.push(`/reports/${report.id}`);
  };

  const handleViewReport = () => {
    const latest = reports[0];
    if (latest) router.push(`/reports/${latest.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Final Decision · Recommendation"
        subtitle={`NauNiti decision brief for ${inputs.cargo} · ${inputs.quantity.toLocaleString()} t · ${inputs.loadingPort} → ${inputs.destinationPort} · ${inputs.voyages} voyages`}
        right={
          <span className="inline-flex items-center gap-2 rounded-lg border border-accent/35 bg-accent/10 px-3 py-2 text-[12.5px] font-semibold text-accent">
            <BadgeCheck className="size-4" />
            {analysis.confidence}% model confidence
          </span>
        }
      />

      {/* Decision statement */}
      <div className="rounded-2xl border border-accent/35 bg-gradient-to-br from-card to-panel p-5">
        <div className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-md bg-accent/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
          <Sparkles className="size-3.5" /> Recommended plan
        </div>
        <h2 className="mt-2 max-w-3xl text-[19px] font-semibold leading-snug text-primary">
          {`Wait ${waitDays} Days + ${recVessel.type} + ${routeLabel} + ${contractLabel}`}
        </h2>
        <p className="mt-1 text-[12.5px] text-secondary">
          Wait {waitDays} days for the optimal window · fixture {recVessel.type} on the recommended corridor · lock a
          {contractLabel} contract to preserve flexibility while capturing freight, fuel and demurrage savings.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RiskBadge level={analysis.riskLevel} />
          <span className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-0.5 text-[11px] text-secondary">
            <TimerReset className="size-3.5 text-accent" /> {waitDays}-day charter window
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-0.5 text-[11px] text-secondary">
            <MapPin className="size-3.5 text-accent" /> {routeLabel}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Expected Total Cost" value={formatUSD(costs.total)} sub={`${inputs.voyages} voyages all-in`} icon={Banknote} tone="blue" />
        <KpiCard label="Potential Savings" value={formatUSD(analysis.potentialSavingsUSD)} sub="vs repeated spot" icon={CheckCircle2} tone="green" changeText={`−${analysis.savingsPercent}% cost`} />
        <KpiCard label="Savings (INR)" value={formatINR(analysis.potentialSavingsINR)} sub={`≈ ${formatUSD(analysis.potentialSavingsUSD)} exposure avoided`} icon={ShieldCheck} tone="green" />
        <KpiCard label="Risk Posture" value={analysis.riskLevel} sub={`score ${analysis.riskScore}/100 · ${selectedPort.name}`} icon={Gauge} tone={analysis.riskLevel === "High" ? "red" : analysis.riskLevel === "Medium" ? "amber" : "green"} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {/* Plan components */}
        <div className="space-y-4 xl:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <PlanCard icon={Ship} label="Vessel" value={recVessel.type} sub={`${recVessel.dwt} · ${recVessel.score}/100 · ${selectedPort.name} ${recVessel.portCompatibility}`} />
            <PlanCard icon={RouteIcon} label="Route" value={routeLabel} sub={`${recRoute.distance.toLocaleString()} nm · ${recRoute.duration} days · ${recRoute.riskLevel} risk`} />
            <PlanCard icon={FileSignature} label="Contract" value={contractLabel} sub={`${recStrategy.relativeCost}% of spot · ${recStrategy.flexibility} flexibility`} good />
          </div>

          <ChartCard title="Why this plan won" subtitle="Evidence-based rationale from the decision engine">
            <ol className="space-y-2.5">
              {reasons.map((r, i) => (
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
                  pushToast({ kind: "success", title: "Approved & queued for contracting", description: `${recVessel.type} fixture on ${contractLabel} has been logged to your workspace.` })
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
              <button
                onClick={handleGenerateReport}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-nav py-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-blue-glow"
              >
                <FileDown className="size-4" /> Generate Report
              </button>
              <button
                onClick={handleViewReport}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line py-2.5 text-[12.5px] font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
              >
                <ScrollText className="size-4" /> View Report
              </button>
            </div>

            <div className="mt-3 rounded-lg border border-line bg-panel p-3 text-[11.5px] leading-relaxed text-secondary">
              <div className="mb-1.5 font-semibold text-primary">Decision summary</div>
              <p>• Estimated total: <span className="text-primary">{formatUSD(costs.total)}</span></p>
              <p>• Wait window: <span className="text-primary">{waitDays} days</span></p>
              <p>• Confidence: <span className="text-primary">{analysis.confidence}%</span></p>
              <p>• Savings: <span className="text-good">{formatUSD(analysis.potentialSavingsUSD)} / {formatINR(analysis.potentialSavingsINR)}</span></p>
            </div>
          </ChartCard>

          <div className="rounded-xl border border-warn/30 bg-warn/5 p-4 text-[11.5px] leading-relaxed text-secondary">
            <span className="font-semibold text-warn">Vigilance note:</span> re-validate before fixture if {selectedPort.name}
            congestion crosses 70% or the 30-day freight forecast is revised above +{Math.max(10, freight.forecastChange30d + 4)}%.
          </div>
        </div>
      </div>
    </div>
  );
}

function buildReasons(analysis: import("@/lib/calculations").ProcurementAnalysis): string[] {
  const { inputs, selectedPort, routes, freight } = analysis;
  const recVessel = analysis.vessels.find((v) => v.recommended) ?? analysis.vessels[0];
  const recRoute = routes.find((r) => r.recommended) ?? routes[0];
  const recStrategy = analysis.strategies.find((s) => s.recommended) ?? analysis.strategies[0];
  const routeLabel = `${inputs.loadingPort} → ${inputs.destinationPort}`;

  return [
    `Freight trend is ${freight.trend.toLowerCase()} — the 30-day forecast is revised +${freight.forecastChange30d}%.`,
    `${recVessel.type} provides optimal cargo capacity match for ${inputs.quantity.toLocaleString()} tonnes.`,
    `All port constraints at ${selectedPort.name} are satisfied by ${recVessel.type} specifications (${recVessel.compatibilityScore}/100).`,
    `Route ${routeLabel} has acceptable operational risk (${recRoute.riskLevel}) with best cost/time balance (${recRoute.distance.toLocaleString()} nm · ${recRoute.duration} days).`,
    `${recStrategy.name} balances flexibility and cost certainty (${recStrategy.relativeCost}% of spot).`,
    `Overall expected cost is ${formatUSD(analysis.potentialSavingsUSD)} lower than repeated spot contracting.`,
  ];
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