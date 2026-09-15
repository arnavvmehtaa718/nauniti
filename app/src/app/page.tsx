"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Anchor,
  ArrowRight,
  BrainCircuit,
  LineChart,
  Loader2,
  Lock,
  Map,
  PiggyBank,
  Sailboat,
  ShieldCheck,
  Ship,
  User,
} from "lucide-react";
import { useAppStore, type UserRole } from "@/store/useAppStore";

const ROLES: { role: UserRole; desc: string; icon: typeof User }[] = [
  { role: "Procurement Operator", desc: "Execute chartering & voyage plans", icon: Sailboat },
  { role: "Procurement Analyst", desc: "Analyze routes, costs & contracts", icon: LineChart },
  { role: "Risk Manager", desc: "Monitor market, port & weather risk", icon: ShieldCheck },
  { role: "Executive", desc: "Review decisions & approve spend", icon: BrainCircuit },
];

const FEATURES = [
  { icon: LineChart, title: "Freight Rate Forecast", desc: "AI-driven 30-day rate outlook with confidence bands" },
  { icon: Map, title: "Route & Vessel Optimization", desc: "Compatibility checks against live port constraints" },
  { icon: ShieldCheck, title: "Risk Decision Intelligence", desc: "Quantified risk scores with suggested mitigations" },
  { icon: PiggyBank, title: "Cost Savings Analysis", desc: "Strategy comparisons yielding potential savings" },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Procurement Analyst");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name to continue.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      login(name.trim(), role);
      router.push("/dashboard");
    }, 900);
  };

  return (
    <div className="nau-grid min-h-screen bg-navy">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-12 px-6 py-10 lg:px-0">
        {/* Branding panel */}
        <div className="max-w-xl lg:pr-6">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-blue-nav shadow-xl shadow-blue-glow/40">
              <Ship className="size-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-primary">
                Ocean<span className="text-accent">IQ</span>
              </div>
              <div className="text-[11px] font-medium uppercase tracking-widest text-secondary">
                Maritime Chartering Intelligence
              </div>
            </div>
          </div>

          <h1 className="mt-8 text-3xl font-semibold leading-tight tracking-tight text-primary lg:text-4xl">
            Ship smarter. <br />
            <span className="bg-gradient-to-r from-accent to-good bg-clip-text text-transparent">
              Decide with confidence.
            </span>
          </h1>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-secondary">
            End-to-end decision intelligence for bulk dry-bulk chartering — freight forecasting,
            vessel &amp; port compatibility, route optimization, contract strategy and quantified
            risk — tailored for SAIL procurement planning.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-line bg-card/70 p-3.5">
                <f.icon className="size-4.5 text-accent" />
                <div className="mt-2 text-[13px] font-semibold text-primary">{f.title}</div>
                <div className="mt-0.5 text-[11px] leading-snug text-secondary">{f.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2 text-[10.5px] text-secondary">
            <span className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1">
              <Anchor className="size-3" /> Hay Point \u2192 Paradip
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1">
              <LineChart className="size-3" /> 30-day rate forecast
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1">
              <ShieldCheck className="size-3" /> Quantified risk scores
            </span>
          </div>
        </div>

        {/* Login card */}
        <div className="mt-10 w-full max-w-md lg:mt-0">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-line bg-card p-6 shadow-2xl shadow-black/40"
          >
            <div className="mb-5">
              <h2 className="text-[20px] font-semibold text-primary">Sign in to your workspace</h2>
              <p className="mt-1 text-[12px] text-secondary">
                Continue to your chartering decision console
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
                  Full name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Arnav Sharma"
                    className="h-10 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-[13px] text-primary placeholder:text-secondary/60 focus:border-accent focus:ring-1 focus:ring-accent/40 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-[13px] text-primary placeholder:text-secondary/60 focus:border-accent focus:ring-1 focus:ring-accent/40 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary">
                  Select role
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {ROLES.map((r) => (
                    <button
                      type="button"
                      key={r.role}
                      onClick={() => setRole(r.role)}
                      className={`flex items-center gap-3 rounded-lg border p-2.5 text-left transition-all ${
                        role === r.role
                          ? "border-accent bg-accent/10 shadow-sm shadow-blue-nav/20"
                          : "border-line bg-panel hover:border-accent/40"
                      }`}
                    >
                      <span
                        className={`grid size-8 shrink-0 place-items-center rounded-md ${
                          role === r.role ? "bg-accent text-white" : "bg-white/5 text-secondary"
                        }`}
                      >
                        <r.icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-[12.5px] font-medium ${role === r.role ? "text-accent" : "text-primary"}`}>
                          {r.role}
                        </span>
                        <span className="block truncate text-[10.5px] text-secondary">{r.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-3 rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-[11.5px] text-bad">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-nav text-[13.5px] font-semibold text-white transition-colors hover:bg-blue-glow disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Authenticating…
                </>
              ) : (
                <>
                  Sign in to OceanIQ <ArrowRight className="size-4" />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-[10.5px] text-secondary">
              Demo build — any name and password are accepted. Cargo scenario: 70,000 t coal ·
              Australia → Paradip · 4 voyages.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
