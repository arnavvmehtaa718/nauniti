// ============================================================
// NauNiti — Deterministic Calculation Engine (Demo)
// All numbers are illustrative prototype data.
// ============================================================

import {
  COST_SAVINGS,
  DEMO_SCENARIO,
  FINAL_RECOMMENDATION,
  SIMULATION_BASE,
} from "./mockData";

export type ContractStrategyKey = "spot" | "short" | "medium";

export const CONTRACT_LABELS: Record<ContractStrategyKey, string> = {
  spot: "Repeated Spot Contracts",
  short: "Short-Term Multiple-Voyage",
  medium: "Medium-Term Multiple-Voyage",
};

export const DEMURRAGE_DAILY = 22300;

/**
 * Per-voyage all-in cost (USD) for each contract strategy at 70,000 t / 4 voyages.
 */
const PER_VOYAGE_COST: Record<ContractStrategyKey, number> = {
  spot: 1_820_000,
  short: 1_730_000,
  medium: 1_670_000,
};

/**
 * Proportion of a voyage cost attributed to each cost component (short baseline).
 * These sum to 1 and let every component scale deterministically with inputs.
 */
const COMPONENT_SHARE: Record<string, number> = {
  freight: 0.844,
  fuel: 0.061,
  portCharges: 0.049,
  demurrage: 0.023,
  repositioning: 0.013,
  riskBuffer: 0.01,
};

// ------------------------------------------------------------
// Formatting helpers
// ------------------------------------------------------------

export function formatUSD(value: number, compact?: boolean): string {
  if (compact) {
    if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatINR(value: number): string {
  return `₹${(value / 1_000_000).toFixed(2)} Cr`;
}

export function formatNumber(value: number, digits = 0): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

// ------------------------------------------------------------
// Simulation
// ------------------------------------------------------------

export interface SimulationOptions {
  contract: ContractStrategyKey;
  waitDays: number;
  congestionLevel: number;
  freightDeltaPct: number;
  vessel?: string;
  port?: string;
}

export interface SimulationResult {
  totalCost: number;
  spotTotal: number;
  savings: number;
  savingsPercent: number;
  costPerTonne: number;
  costPerVoyage: number;
  freight: number;
  fuel: number;
  portCharges: number;
  demurrage: number;
  repositioning: number;
  riskBuffer: number;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  breakdown: { name: string; value: number; key: string }[];
}

export function runSimulation(opts: SimulationOptions): SimulationResult {
  const { contract, waitDays, congestionLevel, freightDeltaPct } = opts;
  const voyages = DEMO_SCENARIO.voyages;

  const voyageBase = PER_VOYAGE_COST[contract] * voyages * (1 + freightDeltaPct / 100);

  const freight = voyageBase * COMPONENT_SHARE.freight;
  const fuel = voyageBase * COMPONENT_SHARE.fuel;
  const portCharges = voyageBase * COMPONENT_SHARE.portCharges;
  const repositioning = voyageBase * COMPONENT_SHARE.repositioning;
  const riskBuffer = voyageBase * COMPONENT_SHARE.riskBuffer;

  const baseWait = 3.5;
  const waitingExcess = Math.max(0, waitDays - baseWait);
  const congestionFactor = Math.max(0.5, 1 + (congestionLevel - 55) / 100);
  const demurrage =
    voyageBase * COMPONENT_SHARE.demurrage * (1 + waitingExcess * 0.6) * congestionFactor;

  const totalCost = freight + fuel + portCharges + demurrage + repositioning + riskBuffer;
  const spotTotal = PER_VOYAGE_COST.spot * voyages * (1 + freightDeltaPct / 100);
  const savings = Math.max(0, spotTotal - totalCost);
  const costPerTonne = totalCost / DEMO_SCENARIO.quantity;

  const riskScore = riskScoreFromInputs({ contract, waitDays, congestionLevel, freightDeltaPct });

  return {
    totalCost,
    spotTotal,
    savings,
    savingsPercent: spotTotal > 0 ? (savings / spotTotal) * 100 : 0,
    costPerTonne,
    costPerVoyage: totalCost / voyages,
    freight,
    fuel,
    portCharges,
    demurrage,
    repositioning,
    riskBuffer,
    riskScore,
    riskLevel: riskLevelOf(riskScore),
    breakdown: [
      { key: "freight", name: "Freight", value: freight },
      { key: "fuel", name: "Fuel", value: fuel },
      { key: "portCharges", name: "Port Charges", value: portCharges },
      { key: "demurrage", name: "Waiting / Demurrage", value: demurrage },
      { key: "repositioning", name: "Repositioning", value: repositioning },
      { key: "riskBuffer", name: "Risk Buffer", value: riskBuffer },
    ],
  };
}

export function riskScoreFromInputs(input: {
  contract: ContractStrategyKey;
  waitDays: number;
  congestionLevel: number;
  freightDeltaPct: number;
}): number {
  let score = 62;
  if (input.contract === "spot") score += 6;
  if (input.contract === "medium") score -= 6;
  score += Math.max(0, input.congestionLevel - 55) * 0.4;
  score += Math.max(0, input.waitDays - 3.5) * 1.6;
  score += Math.max(0, input.freightDeltaPct) * 0.8;
  score += Math.min(0, input.freightDeltaPct) * 0.6;
  return clamp(Math.round(score), 0, 100);
}

export function riskLevelOf(score: number): "Low" | "Medium" | "High" {
  if (score >= 70) return "High";
  if (score >= 45) return "Medium";
  return "Low";
}

/** Default simulation = the recommended scenario (Short-Term MVP). */
export function defaultSimulation(): SimulationResult {
  return runSimulation({
    contract: "short",
    waitDays: 3.5,
    congestionLevel: 55,
    freightDeltaPct: 0,
  });
}

// ------------------------------------------------------------
// Cost & Savings aggregates
// ------------------------------------------------------------

export function savingsByCategory(year: "current" | "optimized") {
  const c = COST_SAVINGS;
  const src = year === "current" ? c.currentStrategy : c.optimizedStrategy;
  return [
    { key: "freight", name: "Freight", current: c.currentStrategy.freightCost, optimized: c.optimizedStrategy.freightCost, value: src.freightCost },
    { key: "fuel", name: "Fuel", current: c.currentStrategy.fuelCost, optimized: c.optimizedStrategy.fuelCost, value: src.fuelCost },
    { key: "portCharges", name: "Port Charges", current: c.currentStrategy.portCharges, optimized: c.optimizedStrategy.portCharges, value: src.portCharges },
    { key: "demurrage", name: "Waiting / Demurrage", current: c.currentStrategy.waitingDemurrage, optimized: c.optimizedStrategy.waitingDemurrage, value: src.waitingDemurrage },
    { key: "repositioning", name: "Repositioning", current: c.currentStrategy.repositioningCost, optimized: c.optimizedStrategy.repositioningCost, value: src.repositioningCost },
  ];
}

export function totalCurrentCost(): number {
  return COST_SAVINGS.currentStrategy.totalCost;
}

export function totalOptimizedCost(): number {
  return COST_SAVINGS.optimizedStrategy.totalCost;
}

export function recommendationEcho() {
  return {
    vessel: FINAL_RECOMMENDATION.vessel,
    route: FINAL_RECOMMENDATION.route,
    contractType: FINAL_RECOMMENDATION.contractType,
    expectedTotalCost: FINAL_RECOMMENDATION.expectedTotalCost,
    savingsUSD: FINAL_RECOMMENDATION.potentialSavingsUSD,
    savingsINR: FINAL_RECOMMENDATION.potentialSavingsINR,
    confidence: FINAL_RECOMMENDATION.confidence,
    riskLevel: FINAL_RECOMMENDATION.riskLevel,
    waitDays: FINAL_RECOMMENDATION.waitDays,
    cargo: DEMO_SCENARIO.cargo,
    quantity: DEMO_SCENARIO.quantity,
    voyages: DEMO_SCENARIO.voyages,
  };
}

export function scenarioBaseline() {
  return SIMULATION_BASE;
}