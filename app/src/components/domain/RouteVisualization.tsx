"use client";

import { useCallback, useEffect, useRef } from "react";
import { MapPin, Ship } from "lucide-react";
import type { Map as LeafletMap, TileLayer } from "leaflet";
import { useAppStore } from "@/store/useAppStore";
import {
  DEFAULT_DESTINATION,
  DEFAULT_ORIGIN,
  PORT_COORDS,
  type PortCoord,
} from "@/lib/portCoordinates";

const TILE_ATTRIB =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function tileUrl(theme: "dark" | "light"): string {
  return theme === "dark"
    ? "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
    : "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";
}

// ------------------------------------------------------------
// Geographic helpers (pure math, safe on server)
// ------------------------------------------------------------

function toRad(d: number): number {
  return (d * Math.PI) / 180;
}
function toDeg(r: number): number {
  return (r * 180) / Math.PI;
}

/** Smooth interpolation along the great circle between two ports. */
function gcInterpolate(a: PortCoord, b: PortCoord, t: number): PortCoord {
  const phi1 = toRad(a.lat);
  const lambda1 = toRad(a.lng);
  const phi2 = toRad(b.lat);
  const lambda2 = toRad(b.lng);
  const sinP1 = Math.sin(phi1);
  const cosP1 = Math.cos(phi1);
  const sinP2 = Math.sin(phi2);
  const cosP2 = Math.cos(phi2);

  const cosDelta = sinP1 * sinP2 + cosP1 * cosP2 * Math.cos(lambda2 - lambda1);
  const delta = Math.acos(Math.min(1, Math.max(-1, cosDelta)));
  if (delta < 1e-9) return a;

  const sinDelta = Math.sin(delta);
  const A = Math.sin((1 - t) * delta) / sinDelta;
  const B = Math.sin(t * delta) / sinDelta;

  const x = A * cosP1 * Math.cos(lambda1) + B * cosP2 * Math.cos(lambda2);
  const y = A * cosP1 * Math.sin(lambda1) + B * cosP2 * Math.sin(lambda2);
  const z = A * sinP1 + B * sinP2;

  return {
    lat: toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))),
    lng: toDeg(Math.atan2(y, x)),
  };
}

interface SweptPoint {
  x: number;
  y: number;
}

function fmt(n: number): string {
  return n.toFixed(1);
}

/** Catmull-Rom to cubic-Bezier smooth path through projected route points. */
function smoothPathD(pts: SweptPoint[]): string {
  if (pts.length < 2) return "";
  const ps = [pts[0], pts[0], ...pts, pts[pts.length - 1]];
  let d = `M ${fmt(pts[0].x)} ${fmt(pts[0].y)}`;
  for (let i = 1; i < ps.length - 2; i++) {
    const p0 = ps[i - 1];
    const p1 = ps[i];
    const p2 = ps[i + 1];
    const p3 = ps[i + 2];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${fmt(c1x)} ${fmt(c1y)}, ${fmt(c2x)} ${fmt(c2y)}, ${fmt(p2.x)} ${fmt(p2.y)}`;
  }
  return d;
}

function positionChip(el: HTMLDivElement | null, x: number, y: number) {
  if (!el) return;
  el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
  el.style.visibility = "visible";
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

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
  const theme = useAppStore((s) => s.theme);

  const mapElRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const basePathRef = useRef<SVGPathElement>(null);
  const overlayPathRef = useRef<SVGPathElement>(null);
  const shipRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<TileLayer | null>(null);

  // Re-project route / markers onto the live map whenever input changes.
  const syncRef = useRef<() => void>(() => {});
  const sync = useCallback(() => {
    const map = mapRef.current;
    const wrap = wrapRef.current;
    if (!map || !wrap) return;

    const start = PORT_COORDS[origin] ?? PORT_COORDS[DEFAULT_ORIGIN];
    const end = PORT_COORDS[destination] ?? PORT_COORDS[DEFAULT_DESTINATION];
    const bounds: [[number, number], [number, number]] = [
      [start.lat, start.lng],
      [end.lat, end.lng],
    ];

    map.fitBounds(bounds, {
      paddingTopLeft: [34, 30],
      paddingBottomRight: [34, 30],
      animate: false,
    });

    const w = wrap.clientWidth || 680;
    const h = wrap.clientHeight || 260;

    const SEGMENTS = 10;
    const pts: SweptPoint[] = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const p = gcInterpolate(start, end, i / SEGMENTS);
      pts.push(map.latLngToContainerPoint([p.lat, p.lng]));
    }
    const path = smoothPathD(pts);

    svgRef.current?.setAttribute("viewBox", `0 0 ${w} ${h}`);
    basePathRef.current?.setAttribute("d", path);
    overlayPathRef.current?.setAttribute("d", path);

    if (shipRef.current) {
      shipRef.current.style.offsetPath = `path("${path}")`;
      shipRef.current.style.visibility = "visible";
      // Restart the offset animation so the vessel always departs from origin.
      shipRef.current.style.animation = "none";
      void shipRef.current.offsetWidth;
      shipRef.current.style.animation = "route-dot 7s linear infinite";
    }

    const p0 = map.latLngToContainerPoint([start.lat, start.lng]);
    const pN = map.latLngToContainerPoint([end.lat, end.lng]);
    positionChip(originRef.current, p0.x, p0.y);
    positionChip(destRef.current, pN.x, pN.y);
  }, [origin, destination]);

  // Create the Leaflet map once, client-side only.
  useEffect(() => {
    let disposed = false;

    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (disposed || !mapElRef.current) return;

      const map = L.map(mapElRef.current, {
        zoomControl: false,
        attributionControl: true,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      });
      map.attributionControl.setPrefix(false);

      const tile = L.tileLayer(tileUrl(theme), {
        attribution: TILE_ATTRIB,
        maxZoom: 18,
        minZoom: 1,
      }).addTo(map);

      mapRef.current = map;
      tileRef.current = tile;

      syncRef.current();
    })();

    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      tileRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the latest sync routine in a ref and re-run it whenever the ports change.
  useEffect(() => {
    syncRef.current = sync;
    syncRef.current();
  }, [sync]);

  // Swap basemap tiles when the theme changes.
  useEffect(() => {
    tileRef.current?.setUrl(tileUrl(theme));
  }, [theme]);

  // Keep the projected overlay aligned while the card resizes.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      mapRef.current?.invalidateSize();
      syncRef.current();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-line bg-navy">
      <style>{`
        @keyframes route-pulse {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -340; }
        }
        @keyframes route-dot {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
      `}</style>

      {/* Real geographic basemap (CARTO/OSM tiles) */}
      <div ref={mapElRef} className="absolute inset-0 z-0" aria-hidden="true" />

      {/* Existing animated corridor overlay, projected onto the live map */}
      <div ref={wrapRef} className="relative z-10 h-[260px] w-full pointer-events-none">
        <svg
          ref={svgRef}
          viewBox="0 0 680 260"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* dashed base path */}
          <path
            ref={basePathRef}
            d="M 70,190 C 220,90 400,230 610,120"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth={2}
            strokeDasharray="6 6"
          />
          {/* animated dashed overlay */}
          <path
            ref={overlayPathRef}
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
        <div className="route-traveler absolute left-0 top-0" ref={shipRef} style={{ visibility: "hidden" }}>
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
        <div
          ref={originRef}
          className="absolute left-0 top-0 z-20 flex items-center gap-2"
          style={{ visibility: "hidden" }}
        >
          <span className="grid size-6 place-items-center rounded-full bg-accent/20 text-accent">
            <MapPin className="size-3.5" />
          </span>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-secondary">Origin</div>
            <div className="text-[13px] font-semibold text-primary">{origin}</div>
          </div>
        </div>

        {/* Destination marker */}
        <div
          ref={destRef}
          className="absolute left-0 top-0 z-20 flex flex-row-reverse items-center gap-2 text-right"
          style={{ visibility: "hidden" }}
        >
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