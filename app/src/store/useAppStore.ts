"use client";

import { create } from "zustand";
import {
  runSimulation,
  ContractStrategyKey,
  SimulationOptions,
  SimulationResult,
} from "@/lib/calculations";

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

  scenario: { options: SimulationOptions; result: SimulationResult };
  runScenario: (partial: Partial<SimulationOptions>) => SimulationResult;

  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;

  settings: Settings;
  updateSettings: (p: Partial<Settings>) => void;
}

let toastId = 1;

const DEFAULT_OPTIONS: SimulationOptions = {
  contract: "short",
  waitDays: 3.5,
  congestionLevel: 55,
  freightDeltaPct: 0,
  vessel: "Panamax",
  port: "Paradip",
};

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
        window.localStorage.setItem("nauniti-theme", theme);
      } catch {
        /* ignore storage/security errors */
      }
    }
  },
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),

  scenario: {
    options: DEFAULT_OPTIONS,
    result: runSimulation(DEFAULT_OPTIONS),
  },
  runScenario: (partial) => {
    const next = { ...get().scenario.options, ...partial };
    const result = runSimulation(next);
    set({ scenario: { options: next, result } });
    return result;
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

export type { ContractStrategyKey };