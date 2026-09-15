"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Ship,
  Waves,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import VesselCard from "@/components/domain/VesselCard";
import { useAppStore } from "@/store/useAppStore";
import type { VesselRecommendation } from "@/lib/calculations";

interface VesselSpec {
  draft: number;
  loa: number;
  beam: number;
  cargo: number;
}

const VESSEL_SPECS: Record<string, VesselSpec> = {
  Handysize: { draft: 10.5, loa: 180, beam: 28, cargo: 32000 },
  Supramax: { draft: 12.8, loa: 199, beam: 32, cargo: 58000 },
  Panamax: { draft: 13.5, loa: 225, beam: 32, cargo: 70000 },
  Capesize: { draft: 18.9, loa: 292, beam: 45, cargo: 150000 },
};

interface ConstraintRow {
  constraint: string;
  unit: string;
  limit: string;
  required: string;
}

function compliance(spec: VesselSpec, constraint: string, portConstraints: { draft: number; loa: number; beam: number; cargo: number }): "Pass" | "Restricted" | "Fail" {
  const v = constraint === "Draft"
    ? spec.draft
    : constraint === "Length overall (LOA)"
      ? spec.loa
      : constraint === "Beam"
        ? spec.beam
        : spec.cargo;
  const limit = constraint === "Cargo handling" ? portConstraints.cargo : constraint === "Draft" ? portConstraints.draft : constraint === "Beam" ? portConstraints.beam : portConstraints.loa;
  if (v > limit) return "Fail";
  return "Pass";
}

export default function VesselsPage() {
  const analysis = useAppStore((s) => s.procurement.analysis);
  const [selected, setSelected] = useState<VesselRecommendation | null>(analysis.vessels.find((v) => v.recommended) ?? null);

  const { inputs, selectedPort } = analysis;
  const portConstraints = { draft: selectedPort.maxDraft, loa: selectedPort.maxLOA, beam: selectedPort.maxBeam, cargo: selectedPort.cargoHandlingCapacity };

  const constraintRows: ConstraintRow[] = [
    { constraint: "Draft", unit: "m", limit: portConstraints.draft.toFixed(1), required: (portConstraints.draft - 1).toFixed(1) },
    { constraint: "Length overall (LOA)", unit: "m", limit: portConstraints.loa.toString(), required: (portConstraints.loa - 20).toString() },
    { constraint: "Beam", unit: "m", limit: portConstraints.beam.toString(), required: (portConstraints.beam - 8).toString() },
    { constraint: "Cargo handling", unit: "t/day", limit: portConstraints.cargo.toLocaleString(), required: inputs.quantity.toLocaleString() },
  ];

  const columns: Column<VesselRecommendation>[] = [
    {
      header: "Vessel",
      render: (v) => (
        <div className="flex items-center gap-2">
          <Ship className="size-4 text-accent" />
          <div>
            <div className="font-medium text-primary">{v.type}</div>
            <div className="text-[10px] text-secondary">{v.dwt}</div>
          </div>
          {v.recommended && (
            <span className="rounded bg-good/15 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase text-good">
              Recommended
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Charter Cost",
      align: "right",
      render: (v) => (
        <span className="text-primary">${v.costPerDay.toLocaleString()}/day</span>
      ),
    },
    {
      header: "Availability",
      render: (v) => <StatusBadge status={v.availability} tone={v.availability === "High" ? "green" : v.availability === "Medium" ? "amber" : "red"} />,
    },
    {
      header: "Score",
      align: "right",
      render: (v) => (
        <div className="flex items-center justify-end gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
            <div
              className={`h-full rounded-full ${v.score >= 70 ? "bg-good" : v.score >= 50 ? "bg-warn" : "bg-bad"}`}
              style={{ width: `${v.score}%` }}
            />
          </div>
          <span className="w-8 text-primary">{v.score}</span>
        </div>
      ),
    },
    {
      header: selectedPort.name,
      render: (v) => <StatusBadge status={v.portCompatibility} tone={v.portCompatibility === "Pass" ? "green" : v.portCompatibility === "Restricted" ? "amber" : "red"} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Vessel Recommendation"
        subtitle={`Fleet compatibility screening against ${selectedPort.name} constraints for ${inputs.quantity.toLocaleString()} t ${inputs.cargo} with recommended charter pick.`}
      />

      <div className="grid gap-4 pt-2 md:grid-cols-2 xl:grid-cols-4">
        {analysis.vessels.map((v) => (
          <VesselCard
            key={v.type}
            vessel={{
              type: v.type,
              dwt: v.dwt,
              portCompatibility: v.portCompatibility,
              estimatedCost: v.costPerDay,
              costPerDay: v.costPerDay,
              recommended: v.recommended,
              score: v.score,
              availability: v.availability,
              compatibilityScore: v.compatibilityScore,
            }}
            selected={selected?.type === v.type}
            onSelect={setSelected as any}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title={`${selectedPort.name} Port Constraints vs Vessel Specifications`}
            subtitle="Spec-level compliance against draft, LOA, beam and cargo-handling limits"
            right={
              <span className="inline-flex items-center gap-1.5 text-[11px] text-good">
                <CheckCircle2 className="size-3.5" />
                {selected?.type} fits constraints
              </span>
            }
          >
            <DataTable
              columns={[
                { header: "Constraint", render: (r: ConstraintRow) => <span className="font-medium text-primary">{r.constraint}</span> },
                { header: `${selectedPort.name} Limit`, align: "right", render: (r: ConstraintRow) => <span className="text-secondary">{r.limit} {r.unit}</span> },
                { header: "Required", align: "right", render: (r: ConstraintRow) => <span className="text-secondary">{r.required} {r.unit}</span> },
                ...analysis.vessels.map(
                  (v): Column<ConstraintRow> => ({
                    header: v.type,
                    render: (r: ConstraintRow) => {
                      const spec = VESSEL_SPECS[v.type];
                      const status = compliance(spec, r.constraint, portConstraints);
                      return (
                        <StatusBadge
                          status={status}
                          tone={status === "Pass" ? "green" : status === "Restricted" ? "amber" : "red"}
                        />
                      );
                    },
                  })
                ),
              ]}
              data={constraintRows}
              rowKey={(r) => r.constraint}
            />
            <p className="mt-3 text-[11px] leading-relaxed text-secondary">
              {selected?.portCompatibility === "Pass"
                ? `${selected.type} clears all limits with a ${selected.score}/100 composite score and is the recommended charter pick.`
                : `${selected?.type} may be restricted at ${selectedPort.name} — check constraint details above.`}
            </p>
          </ChartCard>
        </div>

        <div className="flex flex-col gap-4">
          <ChartCard title="Selected Charter" subtitle={selected ? `${selected.type} \u00B7 ${selected.dwt}` : ""}>
            {selected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-line bg-panel p-3">
                  <span className="text-[12px] text-secondary">Recommended score</span>
                  <span className="text-[15px] font-semibold text-primary">{selected.score}/100</span>
                </div>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between"><span className="text-secondary">Charter cost</span><span className="text-primary">${selected.costPerDay.toLocaleString()}/day</span></div>
                  <div className="flex justify-between"><span className="text-secondary">Est. per voyage</span><span className="text-primary">${Math.round(selected.costPerDay * 18).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-secondary">{selectedPort.name} compatibility</span><StatusBadge status={selected.portCompatibility} tone={selected.portCompatibility === "Pass" ? "green" : "amber"} /></div>
                  <div className="flex justify-between"><span className="text-secondary">Cargo fit</span><span className="text-primary">{VESSEL_SPECS[selected.type].cargo.toLocaleString()} t \u2713</span></div>
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-secondary">Select a vessel to inspect charter detail.</p>
            )}
          </ChartCard>

          <div className="flex items-start gap-3 rounded-xl border border-line bg-panel p-3.5 text-[11.5px] leading-relaxed text-secondary">
            <Waves className="mt-0.5 size-4 shrink-0 text-accent" />
            <p>
              Port compatibility screens 4 constraints: draft, LOA, beam and cargo-handling rate.
              Winter draft restrictions can bind during post-monsoon — flagged in the Risk Center.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ChartCard title="Vessel Comparison" subtitle="Side-by-side cost, availability and score">
          <DataTable columns={columns} data={analysis.vessels} rowKey={(v) => v.type} />
        </ChartCard>
      </div>
    </div>
  );
}
