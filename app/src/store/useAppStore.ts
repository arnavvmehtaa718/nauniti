"use client";

import { create } from "zustand";
import {
  computeAnalysis,
  DEFAULT_INPUTS,
  type ProcurementInputs,
  type ProcurementAnalysis,
} from "@/lib/calculations";

export interface GeneratedReport {
  id: number;
  name: string;
  route: string;
  cargo: string;
  quantity: number;
  voyages: number;
  origin: string;
  loadingPort: string;
  destinationPort: string;
  date: string;
  type: string;
  status: "READY";
  format: string;
  sections: string[];
  analysis: ProcurementAnalysis;
}

function dateLabel(d: Date): string {
  const month = d.toLocaleString("en-US", { month: "short" });
  return `${d.getDate()} ${month} ${d.getFullYear()}`;
}

function buildReport(
  analysis: ProcurementAnalysis,
  id: number,
  format: string,
  sections: string[],
  scope?: string,
  date = new Date(),
): GeneratedReport {
  const { inputs } = analysis;
  const name = scope || "Full Decision Brief";
  return {
    id,
    name,
    route: `${inputs.loadingPort} \u2192 ${inputs.destinationPort}`,
    cargo: inputs.cargo,
    quantity: inputs.quantity,
    voyages: inputs.voyages,
    origin: inputs.originCountry,
    loadingPort: inputs.loadingPort,
    destinationPort: inputs.destinationPort,
    date: dateLabel(date),
    type: name,
    status: "READY",
    format,
    sections,
    analysis,
  };
}

export type UserRole =
  | "Procurement Operator"
  | "Procurement Analyst"
  | "Risk Manager"
  | "Executive";

export interface Toast {
  id: number;
  title: string;
  description?: string;
  kind: "success" | "info" | "warning";
}

export interface Settings {
  currency: "USD" | "INR";
  weightUnit: "Tonnes" | "Metric Tonnes";
  defaultCargo: string;
  defaultDestinationPort: string;
  defaultVessel: string;
  notificationDigest: boolean;
  alertsEnabled: boolean;
}

interface AppState {
  isAuthenticated: boolean;
  userName: string;
  userRole: UserRole;
  login: (name: string, role: UserRole) => void;
  logout: () => void;

  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;

  procurement: {
    inputs: ProcurementInputs;
    analysis: ProcurementAnalysis;
  };
  runAnalysis: (partial?: Partial<ProcurementInputs>) => ProcurementAnalysis;

  reports: GeneratedReport[];
  addReport: (format: string, sections: string[], scope?: string) => GeneratedReport;

  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;

  settings: Settings;
  updateSettings: (p: Partial<Settings>) => void;
}

let toastId = 1;

const initialAnalysis = computeAnalysis(DEFAULT_INPUTS);

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  userName: "",
  userRole: "Procurement Analyst",
  login: (userName, userRole) => set({ isAuthenticated: true, userName, userRole }),
  logout: () => set({ isAuthenticated: false, userName: "" }),

  theme: "dark",
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      try {
        document.documentElement.classList.toggle("light", theme === "light");
        document.documentElement.style.colorScheme = theme;
        window.localStorage.setItem("oceaniq-theme", theme);
      } catch {
        /* ignore storage/security errors */
      }
    }
  },
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),

  procurement: {
    inputs: DEFAULT_INPUTS,
    analysis: initialAnalysis,
  },
  runAnalysis: (partial) => {
    const current = get().procurement.inputs;
    const next = { ...current, ...partial };
    const analysis = computeAnalysis(next);
    set({ procurement: { inputs: next, analysis } });
    return analysis;
  },

  reports: [buildReport(initialAnalysis, 1, "PDF", ["Freight forecast", "Contract strategy"])],
  addReport: (format, sections, scope) => {
    const analysis = get().procurement.analysis;
    const report = buildReport(analysis, get().reports.length + 1, format, sections, scope);
    set((s) => ({ reports: [report, ...s.reports] }));
    return report;
  },

  toasts: [],
  pushToast: (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: toastId++ }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  settings: {
    currency: "USD",
    weightUnit: "Tonnes",
    defaultCargo: "Coal",
    defaultDestinationPort: "Paradip",
    defaultVessel: "Panamax",
    notificationDigest: true,
    alertsEnabled: true,
  },
  updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
}));
