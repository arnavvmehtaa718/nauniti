"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckSquare,
  Crown,
  Download,
  Eye,
  FileBarChart2,
  FileDown,
  FileSpreadsheet,
  Loader2,
  Square,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import { REPORTS } from "@/lib/mockData";
import { useAppStore } from "@/store/useAppStore";
import api from "@/services/api";

type Report = (typeof REPORTS)[number];

const FORMATS = ["PDF", "Excel", "CSV"];
const SCOPES = ["Full Decision Brief", "Cost & Savings Summary", "Risk Register", "Vessel & Port Annex"];
const SECTIONS = ["Freight forecast", "Vessel compatibility", "Port congestion", "Route comparison", "Contract strategy", "Risk matrix"];

export default function ReportsPage() {
  const pushToast = useAppStore((s) => s.pushToast);
  const [reports, setReports] = useState<Report[]>([...REPORTS]);
  const [scope, setScope] = useState(SCOPES[0]);
  const [format, setFormat] = useState("PDF");
  const [sections, setSections] = useState<string[]>([SECTIONS[0], SECTIONS[4]]);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<Report | null>(null);

  const toggleSection = (s: string) =>
    setSections((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const generate = async () => {
    setGenerating(true);
    const name = `${scope} · ${format}`;
    await api.generateReport(name);
    setGenerating(false);
    const report: Report = {
      id: reports.length + 1,
      name: `${scope}`,
      route: "Hay Point → Paradip",
      cargo: "Coal",
      date: "13 Sep 2026",
      type: scope,
      status: "READY",
    };
    setReports((r) => [report, ...r]);
    pushToast({
      kind: "success",
      title: "Report generated",
      description: `${scope} (${format}) is ready in your saved reports${sections.length ? " · includes " + sections.length + " sections" : ""}.`,
    });
  };

  const columns: Column<Report>[] = [
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
    { header: "Generated", render: (r) => <span className="text-secondary">{r.date}</span> },
    { header: "Status", render: (r) => <StatusBadge status={r.status} tone="green" /> },
    {
      header: "",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setPreview(r)}
            className="grid size-7 place-items-center rounded-md border border-line text-secondary transition-colors hover:border-accent/40 hover:text-accent"
            title="Preview"
          >
            <Eye className="size-3.5" />
          </button>
          <button
            onClick={() => pushToast({ kind: "success", title: "Download started", description: `${r.name} (${r.type}) is being exported.` })}
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
        subtitle="Exportable decision artifacts for the coal chartering program — ready the latest brief or generate a custom report."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Latest report */}
        <div className="xl:col-span-2">
          <div className="relative overflow-hidden rounded-2xl border border-accent/35 bg-gradient-to-br from-card to-panel p-5">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-good/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-good">
              <Crown className="size-3.5" /> Latest decision report
            </div>
            <h2 className="text-[19px] font-semibold text-primary">{reports[0].name}</h2>
            <p className="mt-1 text-[12.5px] text-secondary">
              {reports[0].route} · {reports[0].cargo} · generated {reports[0].date}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Expected cost" value="$6.92M" />
              <MiniStat label="Savings" value="₹1.48 Cr" good />
              <MiniStat label="Confidence" value="87%" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setPreview(reports[0])}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-nav px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-blue-glow"
              >
                <Eye className="size-4" /> Preview Brief
              </button>
              <button
                onClick={() =>
                  pushToast({ kind: "success", title: "Download started", description: "Australia–Paradip Analysis (PDF)" })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-[12.5px] font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
              >
                <Download className="size-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Generate panel */}
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

      {/* Saved reports */}
      <div className="mt-4">
        <ChartCard
          title="Saved Reports"
          subtitle={`All generated artifacts · ${reports.length} on record`}
          right={
            <Link href="/risk" className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent hover:text-primary">
              Related advisories <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          <DataTable columns={columns} data={reports} rowKey={(r) => `${r.id}-${r.name}`} />
        </ChartCard>
      </div>

      {/* Preview modal */}
      <Modal open={!!preview} title={preview?.name ?? ""} subtitle={preview ? `${preview.type} · ${preview.date}` : ""} onClose={() => setPreview(null)} size="lg">
        {preview && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] text-secondary">
              <FileSpreadsheet className="size-4 text-accent" />
              Route: <span className="text-primary">{preview.route}</span> · Cargo: <span className="text-primary">{preview.cargo}</span>
            </div>
            <div className="rounded-lg border border-line bg-panel p-4">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-secondary">Contents</div>
              <ul className="space-y-1.5 text-[12px] text-secondary">
                <li className="flex items-center gap-2"><CheckSquare className="size-3.5 text-accent" /> Executive decision summary</li>
                <li className="flex items-center gap-2"><CheckSquare className="size-3.5 text-accent" /> Freight forecast & market drivers</li>
                <li className="flex items-center gap-2"><CheckSquare className="size-3.5 text-accent" /> Vessel compatibility vs port constraints</li>
                <li className="flex items-center gap-2"><CheckSquare className="size-3.5 text-accent" /> Port congestion outlook</li>
                <li className="flex items-center gap-2"><CheckSquare className="size-3.5 text-accent" /> Route comparison & cost model</li>
                <li className="flex items-center gap-2"><CheckSquare className="size-3.5 text-accent" /> Contract strategy & savings</li>
                <li className="flex items-center gap-2"><CheckSquare className="size-3.5 text-accent" /> Risk register & mitigations</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  pushToast({ kind: "success", title: "Download started", description: `${preview.name} (${preview.type})` });
                  setPreview(null);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-nav px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-blue-glow"
              >
                <Download className="size-4" /> Download
              </button>
            </div>
          </div>
        )}
      </Modal>
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