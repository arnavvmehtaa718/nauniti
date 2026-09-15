"use client";

import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import RiskBadge from "@/components/ui/RiskBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import RiskGauge from "@/components/domain/RiskGauge";
import AlertCard, { type AlertItem } from "@/components/domain/AlertCard";
import { useAppStore } from "@/store/useAppStore";
import type { RiskItem } from "@/lib/calculations";

export default function RiskPage() {
  const analysis = useAppStore((s) => s.procurement.analysis);
  const pushToast = useAppStore((s) => s.pushToast);

  const { risks, alerts, riskScore, inputs } = analysis;

  const actions = Object.values(
    risks.reduce<Record<string, { action: string; count: number }>>((acc, r) => {
      acc[r.suggestedAction] = acc[r.suggestedAction] ?? { action: r.suggestedAction, count: 0 };
      acc[r.suggestedAction].count += 1;
      return acc;
    }, {})
  );

  const columns: Column<RiskItem>[] = [
    {
      header: "Risk Category",
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className={`grid size-7 place-items-center rounded-md ${r.color === "red" ? "bg-bad/12 text-bad" : r.color === "amber" ? "bg-warn/12 text-warn" : "bg-good/12 text-good"}`}>
            <ShieldAlert className="size-3.5" />
          </span>
          <span className="font-medium text-primary">{r.category}</span>
        </div>
      ),
    },
    { header: "Severity", render: (r) => <RiskBadge level={r.severity} label={r.severity} /> },
    { header: "Probability", render: (r) => <StatusBadge status={r.probability} tone={r.probability === "High" ? "amber" : r.probability === "Medium" ? "blue" : "green"} /> },
    { header: "Impact", render: (r) => <StatusBadge status={r.impact} tone={r.impact === "High" ? "red" : r.impact === "Medium" ? "amber" : "green"} /> },
    {
      header: "Suggested Action",
      render: (r) => (
        <button
          onClick={() =>
            pushToast({ kind: "info", title: r.suggestedAction, description: `Advisory queued for "${r.category}".` })
          }
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent transition-colors hover:text-primary"
        >
          <CheckCircle2 className="size-3.5" /> {r.suggestedAction}
        </button>
      ),
    },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Risk & Alerts"
        subtitle={`Quantified risk posture for the ${inputs.quantity.toLocaleString()} t ${inputs.cargo} program with live advisories and recommended mitigation actions.`}
        right={
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-[12px] font-medium text-warn">
            <Bell className="size-4" />
            {alerts.filter((a) => a.status === "New").length} new alerts
          </span>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div>
          <ChartCard title="Program Risk Score" subtitle="Composite of market, port, weather & operations">
            <div className="flex justify-center">
              <RiskGauge score={riskScore} />
            </div>
            <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-warn/25 bg-warn/5 p-3 text-[11.5px] leading-relaxed text-secondary">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-warn" />
              <span>
                Score is driven chiefly by <span className="text-warn">freight volatility</span> and{" "}
                <span className="text-warn">port congestion</span>. Current posture is {analysis.riskLevel.toLowerCase()}.
              </span>
            </div>
          </ChartCard>
        </div>

        <div>
          <ChartCard title="Recommended Actions" subtitle="Grouped mitigation across all open risks">
            <div className="space-y-2">
              {actions.map((a) => (
                <div key={a.action} className="flex items-center justify-between rounded-lg border border-line bg-panel px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-accent" />
                    <span className="text-[12.5px] font-medium text-primary">{a.action}</span>
                  </div>
                  <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-secondary">
                    {a.count} risk{a.count > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        <div className="xl:row-span-2">
          <ChartCard title="Alerts Timeline" subtitle="Chronological operational advisories">
            <div className="space-y-2.5">
              {alerts.map((a) => (
                <AlertCard
                  key={a.id}
                  alert={a as AlertItem}
                  onAction={(alert) =>
                    pushToast({ kind: "warning", title: alert.action, description: `Auto-action queued for alert #${alert.id}.` })
                  }
                />
              ))}
            </div>
          </ChartCard>
        </div>

        <div className="xl:col-span-2">
          <ChartCard title="Risk Matrix" subtitle="Probability \u00D7 impact with mitigation and status">
            <DataTable columns={columns} data={risks} rowKey={(r) => r.category} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
