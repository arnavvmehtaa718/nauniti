"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Anchor,
  CalendarDays,
  ClipboardList,
  FlaskConical,
  Loader2,
  MapPin,
  PackageSearch,
  Route,
  Ship,
  Sparkles,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { DEMO_SCENARIO, PORTS, VESSELS } from "@/lib/mockData";
import { formatUSD, CONTRACT_LABELS, type ContractStrategyKey } from "@/lib/calculations";
import { useAppStore } from "@/store/useAppStore";

const CARGO_TYPES = ["Coal", "Iron Ore", "Coking Coal", "Thermal Coal", "Limestone", "Steel Products"];
const ORIGIN_COUNTRIES = ["Australia", "South Africa", "Indonesia", "Brazil", "USA", "Russia"];
const LOADING_PORTS: Record<string, string[]> = {
  Australia: ["Hay Point", "Newcastle", "Gladstone", "Dampier"],
  "South Africa": ["Richards Bay", "Saldanha"],
  Indonesia: ["Tanjung Bara", "Tarahan"],
  Brazil: ["Tubarão", "Itaqui"],
  USA: ["Marseilles", "Corpus Christi"],
  Russia: ["Nakhodka", "Murmansk"],
};
const HORIZONS = ["1 Month", "3 Months", "6 Months", "12 Months"];

export default function ProcurementPage() {
  const router = useRouter();
  const runScenario = useAppStore((s) => s.runScenario);
  const pushToast = useAppStore((s) => s.pushToast);

  const [cargo, setCargo] = useState(DEMO_SCENARIO.cargo);
  const [quantity, setQuantity] = useState(DEMO_SCENARIO.quantity);
  const [voyages, setVoyages] = useState(DEMO_SCENARIO.voyages);
  const [originCountry, setOriginCountry] = useState(DEMO_SCENARIO.originCountry);
  const [loadingPort, setLoadingPort] = useState(DEMO_SCENARIO.loadingPort);
  const [destinationPort, setDestinationPort] = useState(DEMO_SCENARIO.destinationPort);
  const [horizon, setHorizon] = useState(DEMO_SCENARIO.contractHorizon);
  const [contract, setContract] = useState<ContractStrategyKey>("short");
  const [delivery, setDelivery] = useState(DEMO_SCENARIO.deliveryDate);
  const [generating, setGenerating] = useState(false);

  const destination = PORTS.find((p) => p.name === destinationPort) ?? PORTS[0];
  const recommendedVessel = VESSELS.find((v) => v.recommended)?.type ?? "Panamax";

  const handleGenerate = () => {
    setGenerating(true);
    runScenario({ contract });
    setTimeout(() => {
      pushToast({
        kind: "success",
        title: "Analysis generated",
        description: `Scenario locked: ${quantity.toLocaleString()} t ${cargo}, ${voyages} voyages, ${loadingPort} → ${destinationPort}.`,
      });
      router.push("/recommendation");
    }, 1000);
  };

  const loadingPorts = LOADING_PORTS[originCountry] ?? LOADING_PORTS.Australia;

  const inputClass =
    "h-10 w-full rounded-lg border border-line bg-panel px-3 text-[13px] text-primary placeholder:text-secondary/60 focus:border-accent focus:ring-1 focus:ring-accent/40 focus:outline-none";

  return (
    <div>
      <PageHeader
        title="New Procurement Analysis"
        subtitle="Define charter requirements to generate a NauNiti decision brief with freight, vessel, port, route and contract recommendations."
        right={
          <button
            onClick={() => router.push("/simulation")}
            className="inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-[12.5px] font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
          >
            <FlaskConical className="size-4" />
            Skip to What-If
          </button>
        }
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
                {PORTS.map((p) => (
                  <option key={p.name}>{p.name}</option>
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
                        ? "Balanced · NauNiti default"
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
          </div>
        </div>

        {/* Live summary */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-accent/35 bg-card p-4">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
              <ClipboardList className="size-3.5" /> Scenario summary
            </div>
            <div className="space-y-2.5">
              <SummaryRow icon={PackageSearch} label="Cargo" value={`${cargo} · ${quantity.toLocaleString()} t · ${voyages} voyage${voyages > 1 ? "s" : ""}`} />
              <SummaryRow icon={Route} label="Route" value={`${loadingPort}, ${originCountry} → ${destinationPort}`} />
              <SummaryRow icon={Anchor} label="Discharge port" value={`${destination?.name} · draft ${destination?.maxDraft}m · congestion ${destination?.congestionLevel}%`} />
              <SummaryRow icon={Ship} label="Recommended vessel" value={recommendedVessel} />
              <SummaryRow icon={CalendarDays} label="Horizon / delivery" value={`${horizon} · ${delivery}`} />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-card p-4">
            <div className="text-[10px] uppercase tracking-wider text-secondary">Estimated program cost</div>
            <div className="mt-1 text-[24px] font-semibold text-primary">{formatUSD(6_920_000)}</div>
            <div className="text-[11px] text-good">−4.9% vs repeated spot ({formatUSD(360_000)} saved)</div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-secondary">
              <MapPin className="size-3.5 text-accent" />
              Forecast confidence 87% · 30-day rate view: +11.5%
            </div>
          </div>

          <p className="rounded-xl border border-line bg-panel p-3 text-[11px] leading-relaxed text-secondary">
            Estimate uses the NauNiti deterministic cost engine across freight, fuel, port charges,
            waiting/demurrage, repositioning and risk buffer. Adjust sliders in{" "}
            <button onClick={() => router.push("/simulation")} className="font-medium text-accent hover:text-primary">
              Simulation / What-If
            </button>{" "}
            for sensitivity analysis.
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