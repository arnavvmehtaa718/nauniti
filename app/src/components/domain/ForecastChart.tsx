"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatUSD } from "@/lib/calculations";
import type { FREIGHT_CHART_DATA } from "@/lib/mockData";

type DataPoint = (typeof FREIGHT_CHART_DATA)[number];

interface TooltipEntry {
  name?: string;
  value?: number | string;
  dataKey?: string;
}

function FreightTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0];
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 shadow-xl shadow-black/40">
      <div className="mb-1 text-[11px] font-medium text-secondary">{label}</div>
      {(payload as TooltipEntry[]).map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px]">
          <span
            className="size-2 rounded-full"
            style={{ background: p.dataKey?.includes("forecast") ? "#f59e0b" : "#3b82f6" }}
          />
          <span className="text-secondary">{p.name}</span>
          <span className="ml-auto font-medium text-primary">
            {typeof p.value === "number" ? formatUSD(p.value) : p.value}
          </span>
        </div>
      ))}
      {row && typeof row.value === "number" && (
        <div className="mt-1 border-t border-line pt-1 text-[10px] text-secondary">
          Confidence band {formatUSD(row.value - 250)}–{formatUSD(row.value + 250)}
        </div>
      )}
    </div>
  );
}

interface ForecastChartProps {
  data: DataPoint[];
  height?: number;
}

export default function ForecastChart({ data, height = 300 }: ForecastChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "var(--color-secondary)", fontSize: 11 }}
          axisLine={{ stroke: "var(--color-line)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--color-secondary)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
          domain={["auto", "auto"]}
        />
        <Tooltip
          content={<FreightTooltip />}
          cursor={{ stroke: "#2563eb", strokeDasharray: "4 4", strokeOpacity: 0.5 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "var(--color-secondary)" }}
          iconType="circle"
          iconSize={7}
        />
        {/* Confidence band */}
        <Area
          type="monotone"
          dataKey="upper"
          name="Upper bound"
          stackId="1"
          fill="url(#bandFill)"
          stroke="none"
        />
        <Area
          type="monotone"
          dataKey="lower"
          name="Lower bound"
          stackId="1"
          stroke="none"
          fill="url(#bandFill)"
        />
        {/* Historical */}
        <Line
          type="monotone"
          dataKey="rate"
          name="Actual rate"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#0a0e1a", stroke: "#3b82f6", strokeWidth: 2 }}
        />
        {/* Forecast */}
        <Line
          type="monotone"
          dataKey="forecast"
          name="Forecast"
          stroke="#f59e0b"
          strokeWidth={2.5}
          strokeDasharray="6 4"
          dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#0a0e1a", stroke: "#f59e0b", strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}