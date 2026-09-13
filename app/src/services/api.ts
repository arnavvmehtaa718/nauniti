// ============================================================
// NauNiti — API Service Layer
// DEMO MODE: every function returns mock data via a simulated
// latency. Swap these with real fetch() calls in production.
// ============================================================

import {
  AI_RESPONSES,
  ALERTS,
  CONTRACT_STRATEGIES,
  COST_BREAKDOWN,
  COST_SAVINGS,
  FREIGHT_CHART_DATA,
  FREIGHT_RATES,
  MARKET_DRIVERS,
  PORT_CONGESTION_CHART_DATA,
  PORTS,
  REPORTS,
  RISK_SCORE,
  RISKS,
  ROUTES,
  VESSELS,
} from "@/lib/mockData";
import { CONTRACT_LABELS, runSimulation } from "@/lib/calculations";

const LATENCY = 350;

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), LATENCY));
}

export const api = {
  getFreightRates: () => delay({ rates: FREIGHT_RATES, chart: FREIGHT_CHART_DATA, drivers: MARKET_DRIVERS }),
  getVessels: () => delay({ vessels: VESSELS }),
  getPorts: () => delay({ ports: PORTS }),
  getPortCongestion: () => delay({ chart: PORT_CONGESTION_CHART_DATA }),
  getRoutes: () => delay({ routes: ROUTES }),
  getRisks: () => delay({ risks: RISKS, score: RISK_SCORE, alerts: ALERTS }),
  getContracts: () => delay({ strategies: CONTRACT_STRATEGIES, breakdown: COST_BREAKDOWN }),
  getCostSavings: () => delay(COST_SAVINGS),
  getReports: () => delay(REPORTS),
  getFullDashboard: () =>
    delay({
      rates: FREIGHT_RATES,
      chart: FREIGHT_CHART_DATA,
      ports: PORTS,
      vessels: VESSELS,
      routes: ROUTES,
      alerts: ALERTS,
    }),
  generateReport: (name: string) =>
    delay({ ok: true, name, generatedAt: new Date().toISOString() }),
  runScenario: (opts: Parameters<typeof runSimulation>[0]) =>
    delay(runSimulation(opts)),
  askAssistant: async (question: string) => {
    const known = AI_RESPONSES[question];
    if (known) return delay({ answer: known.answer, actions: known.actions ?? [], source: "knowledge-base" });
    return delay({
      answer: `I can help you with this chartering decision. Based on the current scenario (${CONTRACT_LABELS.short}), I would recommend reviewing the freight window, port congestion, and vessel compatibility before committing. Try one of the suggested questions for a detailed, data-backed response.`,
      actions: ["View Recommendation", "Run Simulation", "View Risk Center"],
      source: "inference",
    });
  },
};

export default api;