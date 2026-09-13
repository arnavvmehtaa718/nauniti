"use client";

import { MapPin, Ship } from "lucide-react";

interface RouteVisualizationProps {
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  risk: string;
}

export default function RouteVisualization({
  origin,
  destination,
  distance,
  duration,
  risk,
}: RouteVisualizationProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-line bg-panel">
      <style>{`
        @keyframes route-pulse {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -340; }
        }
        @keyframes route-dot {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
        .route-traveler {
          offset-path: path("M 70,190 C 220,90 400,230 610,120");
          animation: route-dot 7s linear infinite;
        }
      `}</style>

      {/* Decorative sea grid */}
      <div className="nau-grid absolute inset-0 opacity-60" />

      <div className="relative h-[260px]">
        {/* Route path */}
        <svg viewBox="0 0 680 260" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* dashed base path */}
          <path
            d="M 70,190 C 220,90 400,230 610,120"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth={2}
            strokeDasharray="6 6"
          />
          {/* animated dashed overlay */}
          <path
            d="M 70,190 C 220,90 400,230 610,120"
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="14 10"
            style={{ animation: "route-pulse 4s linear infinite" }}
          />
        </svg>

        {/* Traveling vessel */}
        <div className="route-traveler absolute left-0 top-0">
          <div className="flex h-8 w-14 items-center justify-center gap-0.5 rounded-lg border border-accent/40 bg-navy/90 shadow-lg shadow-blue-nav/30 backdrop-blur">
            <Ship className="size-3.5 text-accent" />
            <span className="text-[9px] font-semibold text-accent">{duration}d</span>
          </div>
        </div>

        {/* Status banner */}
        <div className="absolute right-6 top-4 flex items-center gap-2 rounded-lg border border-line bg-navy/85 px-2.5 py-1.5 backdrop-blur">
          <span className="text-[10px] text-secondary">{distance.toLocaleString()} nm</span>
          <span className="text-line">·</span>
          <span className="text-[10px] text-secondary">{duration} days</span>
          <span className={`text-[10px] font-semibold ${
            risk === "High" ? "text-bad" : risk === "Medium" ? "text-warn" : "text-good"
          }`}>
            {risk} risk
          </span>
        </div>

        {/* Origin marker */}
        <div className="absolute left-6 top-[178px] flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-full bg-accent/20 text-accent">
            <MapPin className="size-3.5" />
          </span>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-secondary">Origin</div>
            <div className="text-[13px] font-semibold text-primary">{origin}</div>
          </div>
        </div>

        {/* Destination marker */}
        <div className="absolute right-6 top-[104px] flex flex-row-reverse items-center gap-2 text-right">
          <span className="grid size-6 place-items-center rounded-full bg-warn/20 text-warn">
            <MapPin className="size-3.5" />
          </span>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-secondary">Destination</div>
            <div className="text-[13px] font-semibold text-primary">{destination}</div>
          </div>
        </div>
      </div>
    </div>
  );
}