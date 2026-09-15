"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Crown,
  Download,
  Eye,
  FileBarChart2,
  FileDown,
  Loader2,
  Square,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAppStore, type GeneratedReport } from "@/store/useAppStore";
import { formatUSD } from "@/lib/calculations";

const SCOPES = ["Full Decision Brief", "Cost & Savings Summary", "Risk Register", "Vessel & Port Annex"];
const FORMATS = ["PDF", "Excel", "CSV"];
const SECTIONS = ["Freight forecast", "Vessel compatibility", "Port congestion", "Route comparison", "Contract strategy", "Risk matrix"];

export default function ReportsPage() {
  const router = useRouter();
  const analysis = useAppStore((s) => s.procurement.analysis);
  const reports = useAppStore((s) => s.reports);
  const addReport = useAppStore((s) => s.addReport);
  const pushToast = useAppStore((s) => s.pushToast);

  const { inputs } = analysis;

  const [scope, setScope] = useState(SCOPES[0]);
  const [format, setFormat] = useState("PDF");
  const [sections, setSections] = useState<string[]>([SECTIONS[0], SECTIONS[4]]);
  const [generating, setGenerating] = useState(false);

  const toggleSection = (s: string) =>
    setSections((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const generate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 400));
    const report = addReport(format, sections, scope);
    setGenerating(false);
    pushToast({
      kind: "success",
      title: "Report generated",
      description: `${report.name} (${format}) is ready in your saved reports${sections.length ? " \u00B7 includes " + sections.length + " sections" : ""}.`,
    });
    router.push(`/reports/${report.id}`);
  };

  const columns: Column<GeneratedReport>[] = [
    {
      header: "Report",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-accent/12 text-accent">
            <FileBarChart2 className="size-4" />
          </span>
          <div>
            <div className="font-medium text-primary">{r.name}</div>
            <div className="text-[10px] text-secondary">{r.route}</div>
          </div>
        </div>
      ),
    },
    { header: "Type", render: (r) => <span className="text-secondary">{r.type}</span> },
    { header: "Cargo", render: (r) => <span className="text-secondary">{r.cargo}</span> },
    { header: "Quantity", render: (r) => <span className="text-secondary">{r.quantity.toLocaleString()} t</span> },
    { header: "Generated", render: (r) => <span className="text-secondary">{r.date}</span> },
    { header: "Status", render: (r) => <StatusBadge status={r.status} tone="green" /> },
    {
      header: "",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => router.push(`/reports/${r.id}`)}
            className="grid size-7 place-items-center rounded-md border border-line text-secondary transition-colors hover:border-accent/40 hover:text-accent"
            title="Preview"
          >
            <Eye className="size-3.5" />
          </button>
          <button
            onClick={() => pushToast({ kind: "success", title: "Download started", description: `${r.name} (${r.format}) is being exported.` })}
            className="grid size-7 place-items-center rounded-md border border-line text-secondary transition-colors hover:border-good/40 hover:text-good"
            title="Download"
          >
            <Download className="size-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Reports & Downloads"
        subtitle={`Exportable decision artifacts for the ${inputs.cargo} chartering program \u2014 ready the latest brief or generate a custom report.`}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="relative overflow-hidden rounded-2xl border border-accent/35 bg-gradient-to-br from-card to-panel p-5">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-good/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-good">
              <Crown className="size-3.5" /> Latest decision report
            </div>
            <h2 className="text-[19px] font-semibold text-primary">{reports[0].name}</h2>
            <p className="mt-1 text-[12.5px] text-secondary">
              {reports[0].route} \u00B7 {reports[0].cargo} ({reports[0].quantity.toLocaleString()} t \u00B7 {reports[0].voyages} voyages) \u00B7 generated {reports[0].date}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Expected cost" value={formatUSD(reports[0].analysis.costs.total)} />
              <MiniStat label="Savings" value={formatUSD(reports[0].analysis.potentialSavingsUSD)} good />
              <MiniStat label="Confidence" value={`${reports[0].analysis.confidence}%`} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => router.push(`/reports/${reports[0].id}`)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-nav px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-blue-glow"
              >
                <Eye className="size-4" /> Preview Brief
              </button>
              <button
                onClick={() =>
                  pushToast({ kind: "success", title: "Download started", description: `${reports[0].name} (${reports[0].format})` })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-[12.5px] font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
              >
                <Download className="size-4" /> Download {reports[0].format}
              </button>
            </div>
          </div>
        </div>

        <div>
          <ChartCard title="Generate New Report" subtitle="Compose an exportable brief from the current scenario">
            <div className="space-y-3.5">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">Report scope</label>
                <div className="space-y-1.5">
                  {SCOPES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setScope(s)}
                      className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-[12px] transition-colors ${
                        scope === s ? "border-accent bg-accent/10 text-accent" : "border-line bg-panel text-secondary hover:border-accent/40"
                      }`}
                    >
                      {scope === s ? <CheckSquare className="size-3.5 shrink-0" /> : <Square className="size-3.5 shrink-0" />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">Format</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {FORMATS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`rounded-lg border py-1.5 text-[12px] font-medium transition-colors ${
                        format === f ? "border-accent bg-accent/10 text-accent" : "border-line bg-panel text-secondary hover:border-accent/40"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
                  Include sections ({sections.length})
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SECTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSection(s)}
                      className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
                        sections.includes(s)
                          ? "border-accent/50 bg-accent/10 text-accent"
                          : "border-line bg-panel text-secondary hover:border-accent/40"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generate}
                disabled={generating || sections.length === 0}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-nav text-[12.5px] font-semibold text-white transition-colors hover:bg-blue-glow disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Composing report…
                  </>
                ) : (
                  <>
                    <FileDown className="size-4" /> Generate Report
                  </>
                )}
              </button>
            </div>
          </ChartCard>
        </div>
      </div>

      <div className="mt-4">
        <ChartCard
          title="Saved Reports"
          subtitle={`All generated artifacts \u00B7 ${reports.length} on record`}
          right={
            <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent">
              {inputs.loadingPort} \u2192 {inputs.destinationPort}
            </span>
          }
        >
          <DataTable columns={columns} data={reports} rowKey={(r) => `${r.id}-${r.name}`} />
        </ChartCard>
      </div>
    </div>
  );
}

function MiniStat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wider text-secondary">{label}</div>
      <div className={`mt-0.5 text-[16px] font-semibold ${good ? "text-good" : "text-primary"}`}>{value}</div>
    </div>
  );
}