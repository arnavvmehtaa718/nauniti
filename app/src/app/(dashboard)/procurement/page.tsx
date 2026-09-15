"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Anchor,
  CalendarDays,
  ClipboardList,
  FileDown,
  Loader2,
  MapPin,
  PackageSearch,
  Route,
  ScrollText,
  Ship,
  Sparkles,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { DEFAULT_INPUTS, formatUSD, CONTRACT_LABELS, type ContractStrategyKey } from "@/lib/calculations";
import { useAppStore } from "@/store/useAppStore";

const CARGO_TYPES = ["Coal", "Iron Ore", "Coking Coal", "Thermal Coal", "Limestone", "Steel Products"];
const ORIGIN_COUNTRIES = ["Australia", "South Africa", "Indonesia", "Brazil", "USA", "Russia"];
const LOADING_PORTS: Record<string, string[]> = {
  Australia: ["Hay Point", "Newcastle", "Gladstone", "Dampier"],
  "South Africa": ["Richards Bay", "Saldanha"],
  Indonesia: ["Tanjung Bara", "Tarahan"],
  Brazil: ["Tubar\u00E3o", "Itaqui"],
  USA: ["Marseilles", "Corpus Christi"],
  Russia: ["Nakhodka", "Murmansk"],
};
const HORIZONS = ["1 Month", "3 Months", "6 Months", "12 Months"];
const DESTINATION_PORTS = ["Paradip", "Visakhapatnam", "Gangavaram", "Gopalpur", "Dhamra", "Haldia"];

export default function ProcurementPage() {
  const router = useRouter();
  const runAnalysis = useAppStore((s) => s.runAnalysis);
  const addReport = useAppStore((s) => s.addReport);
  const reports = useAppStore((s) => s.reports);
  const pushToast = useAppStore((s) => s.pushToast);
  const analysis = useAppStore((s) => s.procurement.analysis);

  const [cargo, setCargo] = useState(DEFAULT_INPUTS.cargo);
  const [quantity, setQuantity] = useState(DEFAULT_INPUTS.quantity);
  const [voyages, setVoyages] = useState(DEFAULT_INPUTS.voyages);
  const [originCountry, setOriginCountry] = useState(DEFAULT_INPUTS.originCountry);
  const [loadingPort, setLoadingPort] = useState(DEFAULT_INPUTS.loadingPort);
  const [destinationPort, setDestinationPort] = useState(DEFAULT_INPUTS.destinationPort);
  const [horizon, setHorizon] = useState(DEFAULT_INPUTS.contractHorizon);
  const [contract, setContract] = useState<ContractStrategyKey>(DEFAULT_INPUTS.contractStrategy);
  const [delivery, setDelivery] = useState("15 Dec 2026");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    runAnalysis({ cargo, quantity, voyages, originCountry, loadingPort, destinationPort, contractHorizon: horizon, contractStrategy: contract });
    setTimeout(() => {
      pushToast({
        kind: "success",
        title: "Analysis generated",
        description: `Scenario locked: ${quantity.toLocaleString()} t ${cargo}, ${voyages} voyages, ${loadingPort} \u2192 ${destinationPort}.`,
      });
      setGenerating(false);
      router.push("/recommendation");
    }, 600);
  };

  const handleGenerateReport = () => {
    runAnalysis({ cargo, quantity, voyages, originCountry, loadingPort, destinationPort, contractHorizon: horizon, contractStrategy: contract });
    const report = addReport("PDF", ["Freight forecast", "Vessel compatibility", "Port congestion", "Route comparison", "Contract strategy", "Risk matrix"]);
    pushToast({
      kind: "success",
      title: "Report generated",
      description: `${report.name} (${report.cargo} \u00B7 ${report.quantity.toLocaleString()} t) \u00B7 ${report.route}`,
    });
    router.push(`/reports/${report.id}`);
  };

  const loadingPorts = LOADING_PORTS[originCountry] ?? LOADING_PORTS.Australia;

  const inputClass =
    "h-10 w-full rounded-lg border border-line bg-panel px-3 text-[13px] text-primary placeholder:text-secondary/60 focus:border-accent focus:ring-1 focus:ring-accent/40 focus:outline-none";

  return (
    <div>
      <PageHeader
        title="New Procurement Analysis"
        subtitle="Define charter requirements to generate an OceanIQ decision brief with freight, vessel, port, route and contract recommendations."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Form */}
        <div className="rounded-xl border border-line bg-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-accent/12 text-accent">
              <PackageSearch className="size-4" />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-primary">Cargo & Voyage Details</h2>
              <p className="text-[11px] text-secondary">All fields feed the deterministic cost model in real time.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
                Cargo type
              </label>
              <select value={cargo} onChange={(e) => setCargo(e.target.value)} className={inputClass}>
                {CARGO_TYPES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
                Contract horizon
              </label>
              <select value={horizon} onChange={(e) => setHorizon(e.target.value)} className={inputClass}>
                {HORIZONS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
                Quantity ({quantity.toLocaleString()} tonnes)
              </label>
              <input
                type="range"
                min={30000}
                max={150000}
                step={5000}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="h-10 w-full accent-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
                Voyages ({voyages})
              </label>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={voyages}
                onChange={(e) => setVoyages(Number(e.target.value))}
                className="h-10 w-full accent-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
                Origin country
              </label>
              <select
                value={originCountry}
                onChange={(e) => {
                  setOriginCountry(e.target.value);
                  setLoadingPort(LOADING_PORTS[e.target.value]?.[0] ?? loadingPort);
                }}
                className={inputClass}
              >
                {ORIGIN_COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
                Loading port
              </label>
              <select value={loadingPort} onChange={(e) => setLoadingPort(e.target.value)} className={inputClass}>
                {loadingPorts.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
                Destination port
              </label>
              <select value={destinationPort} onChange={(e) => setDestinationPort(e.target.value)} className={inputClass}>
                {DESTINATION_PORTS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
                Preferred delivery
              </label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary" />
                <input value={delivery} onChange={(e) => setDelivery(e.target.value)} className={`${inputClass} pl-9`} />
              </div>
            </div>
          </div>

          {/* Contract strategy */}
          <div className="mt-5">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
              Contract strategy preference
            </label>
            <div className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(CONTRACT_LABELS) as ContractStrategyKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setContract(key)}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    contract === key
                      ? "border-accent bg-accent/10 shadow-sm shadow-blue-nav/20"
                      : "border-line bg-panel hover:border-accent/40"
                  }`}
                >
                  <div className={`text-[12.5px] font-semibold ${contract === key ? "text-accent" : "text-primary"}`}>
                    {CONTRACT_LABELS[key]}
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-secondary">
                    {key === "spot"
                      ? "Max flexibility, max exposure"
                      : key === "short"
                        ? "Balanced \u00B7 OceanIQ default"
                        : "Min cost, min flexibility"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-nav text-[13.5px] font-semibold text-white transition-colors hover:bg-blue-glow disabled:cursor-not-allowed disabled:opacity-70"
            >
              {generating ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Running multi-factor analysis…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Generate Analysis & Decision Brief
                </>
              )}
            </button>
            <div className="mt-2.5 flex gap-2">
              <button
                onClick={handleGenerateReport}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/10 text-[12.5px] font-medium text-accent transition-colors hover:bg-accent/20"
              >
                <FileDown className="size-4" /> Generate Report
              </button>
              <button
                onClick={() => {
                  const latest = reports[0];
                  if (latest) router.push(`/reports/${latest.id}`);
                }}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-panel text-[12.5px] font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
              >
                <ScrollText className="size-4" /> View Report
              </button>
            </div>
          </div>
        </div>

        {/* Live summary */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-accent/35 bg-card p-4">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
              <ClipboardList className="size-3.5" /> Scenario summary
            </div>
            <div className="space-y-2.5">
              <SummaryRow icon={PackageSearch} label="Cargo" value={`${cargo} \u00B7 ${quantity.toLocaleString()} t \u00B7 ${voyages} voyage${voyages > 1 ? "s" : ""}`} />
              <SummaryRow icon={Route} label="Route" value={`${loadingPort}, ${originCountry} \u2192 ${destinationPort}`} />
              <SummaryRow icon={Anchor} label="Discharge port" value={`${analysis.selectedPort.name} \u00B7 draft ${analysis.selectedPort.maxDraft}m \u00B7 congestion ${analysis.selectedPort.congestionLevel}%`} />
              <SummaryRow icon={Ship} label="Recommended vessel" value={analysis.vessels.find((v) => v.recommended)?.type ?? "Panamax"} />
              <SummaryRow icon={CalendarDays} label="Horizon / delivery" value={`${horizon} \u00B7 ${delivery}`} />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-card p-4">
            <div className="text-[10px] uppercase tracking-wider text-secondary">Estimated program cost</div>
            <div className="mt-1 text-[24px] font-semibold text-primary">{formatUSD(analysis.costs.total)}</div>
            <div className="text-[11px] text-good">
              {analysis.savingsPercent > 0
                ? `\u2212${analysis.savingsPercent}% vs repeated spot (${formatUSD(analysis.potentialSavingsUSD)} saved)`
                : "At spot rate"}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-secondary">
              <MapPin className="size-3.5 text-accent" />
              Forecast confidence {analysis.confidence}% \u00B7 30-day rate view: +{analysis.freight.forecastChange30d}%
            </div>
          </div>

          <p className="rounded-xl border border-line bg-panel p-3 text-[11px] leading-relaxed text-secondary">
            Estimate uses the OceanIQ deterministic cost engine across freight, fuel, port charges,
            waiting/demurrage, repositioning and risk buffer. Adjust inputs above and re-run for updated results.
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Ship;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-4 shrink-0 text-accent" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-secondary">{label}</div>
        <div className="truncate text-[12.5px] font-medium text-primary">{value}</div>
      </div>
    </div>
  );
}
