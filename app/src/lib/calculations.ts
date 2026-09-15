// ============================================================
// OceanIQ — Deterministic Calculation Engine
// All numbers are illustrative prototype data.
// ============================================================

import { PORTS } from "./mockData";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export type ContractStrategyKey = "spot" | "short" | "medium";

export const CONTRACT_LABELS: Record<ContractStrategyKey, string> = {
  spot: "Repeated Spot Contracts",
  short: "Short-Term Multiple-Voyage",
  medium: "Medium-Term Multiple-Voyage",
};

export interface ProcurementInputs {
  cargo: string;
  quantity: number;
  voyages: number;
  originCountry: string;
  loadingPort: string;
  destinationPort: string;
  contractHorizon: string;
  contractStrategy: ContractStrategyKey;
}

export interface VesselRecommendation {
  type: string;
  dwt: string;
  costPerDay: number;
  score: number;
  recommended: boolean;
  availability: "High" | "Medium" | "Low";
  portCompatibility: "Pass" | "Restricted" | "Fail";
  compatibilityScore: number;
}

export interface PortDetail {
  name: string;
  congestion: "Low" | "Medium" | "High";
  congestionLevel: number;
  waitingTime: number;
  maxDraft: number;
  maxLOA: number;
  maxBeam: number;
  cargoHandlingCapacity: number;
  berthsAvailable: number;
  totalBerths: number;
  suitableVessels: string[];
  riskLevel: "Low" | "Medium" | "High";
}

export interface RouteOption {
  name: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  freightCost: number;
  fuelCost: number;
  portCharges: number;
  riskLevel: "Low" | "Medium" | "High";
  recommended: boolean;
  note: string;
}

export interface CostBreakdown {
  freightCost: number;
  fuelCost: number;
  portCharges: number;
  waitingDemurrage: number;
  repositioningCost: number;
  riskBuffer: number;
  total: number;
}

export interface RiskItem {
  category: string;
  severity: "Low" | "Medium" | "High";
  probability: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  suggestedAction: string;
  status: "New" | "Reviewed" | "Resolved";
  color: "green" | "amber" | "red";
}

export interface StrategyComparison {
  name: string;
  code: string;
  totalCost: number;
  costPerTonne: number;
  costPerVoyage: number;
  savings: number;
  priceCertainty: "Low" | "Medium" | "High";
  flexibility: "Low" | "Medium" | "High";
  marketExposure: "Low" | "Medium" | "High";
  operationalRisk: "Low" | "Medium" | "High";
  recommended: boolean;
  relativeCost: number;
}

export interface FreightForecast {
  current: number;
  predicted30d: number;
  weeklyChange: number;
  forecastChange30d: number;
  confidence: number;
  trend: "Increasing" | "Decreasing" | "Stable";
  chartingWindow: string;
}

export interface AnalysisAlert {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  severity: "High" | "Medium" | "Low";
  status: "New" | "Reviewed";
  action: string;
}

export interface ProcurementAnalysis {
  inputs: ProcurementInputs;
  freight: FreightForecast;
  vessels: VesselRecommendation[];
  selectedPort: PortDetail;
  allPorts: PortDetail[];
  routes: RouteOption[];
  costs: CostBreakdown;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  risks: RiskItem[];
  alerts: AnalysisAlert[];
  strategies: StrategyComparison[];
  potentialSavingsUSD: number;
  potentialSavingsINR: number;
  savingsPercent: number;
  confidence: number;
}

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
  return `\u20B9${(value / 1_000_000).toFixed(2)} Cr`;
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

export function riskLevelOf(score: number): "Low" | "Medium" | "High" {
  if (score >= 70) return "High";
  if (score >= 45) return "Medium";
  return "Low";
}

// ------------------------------------------------------------
// Seed / reference data for deterministic calculations
// ------------------------------------------------------------

const CARGO_WEIGHT_FACTORS: Record<string, number> = {
  Coal: 1.0,
  "Iron Ore": 1.12,
  "Coking Coal": 1.05,
  "Thermal Coal": 0.95,
  Limestone: 0.88,
  "Steel Products": 1.18,
};

const ORIGIN_DISTANCE_BASE: Record<string, Record<string, number>> = {
  Australia: { "Hay Point": 6420, Newcastle: 6580, Gladstone: 6700, Dampier: 7100 },
  "South Africa": { "Richards Bay": 5200, Saldanha: 5600 },
  Indonesia: { "Tanjung Bara": 3800, Tarahan: 4200 },
  Brazil: { "Tubarão": 8900, Itaqui: 9200 },
  USA: { "Marseilles": 10500, "Corpus Christi": 11200 },
  Russia: { Nakhodka: 7800, Murmansk: 9800 },
};

const ORIGIN_FREIGHT_BASE: Record<string, number> = {
  Australia: 1_560_000,
  "South Africa": 1_250_000,
  Indonesia: 920_000,
  Brazil: 2_100_000,
  USA: 2_500_000,
  Russia: 1_850_000,
};

const VESSEL_SPECS: Record<string, { draft: number; loa: number; beam: number; cargo: number }> = {
  Handysize: { draft: 10.5, loa: 180, beam: 28, cargo: 32000 },
  Supramax: { draft: 12.8, loa: 199, beam: 32, cargo: 58000 },
  Panamax: { draft: 13.5, loa: 225, beam: 32, cargo: 70000 },
  Capesize: { draft: 18.9, loa: 292, beam: 45, cargo: 150000 },
};

const VESSEL_BASE_COST: Record<string, number> = {
  Handysize: 28000,
  Supramax: 25000,
  Panamax: 22300,
  Capesize: 21000,
};

const VESSEL_AVAILABILITY: Record<string, "High" | "Medium" | "Low"> = {
  Handysize: "High",
  Supramax: "Medium",
  Panamax: "Medium",
  Capesize: "Low",
};

const PER_VOYAGE_SPOT_BASE: Record<ContractStrategyKey, number> = {
  spot: 1_820_000,
  short: 1_730_000,
  medium: 1_670_000,
};

// Distance-based route adjustments for alternative routes
const ROUTE_ALTERNATIVES: { name: string; distMultiplier: number; risk: "Low" | "Medium" | "High"; note: string; rec: boolean }[] = [
  { name: "Recommended Route", distMultiplier: 1.0, risk: "Medium", note: "Best balance", rec: true },
  { name: "Southern Alternative", distMultiplier: 1.07, risk: "Low", note: "Lower risk", rec: false },
  { name: "Northern Alternative", distMultiplier: 1.11, risk: "High", note: "Avoid", rec: false },
];

// ------------------------------------------------------------
// Core deterministic analysis computation
// ------------------------------------------------------------

function selectVessel(quantity: number): string {
  if (quantity <= 45000) return "Handysize";
  if (quantity <= 60000) return "Supramax";
  if (quantity <= 85000) return "Panamax";
  return "Capesize";
}

function findPort(name: string) {
  return PORTS.find((p) => p.name === name) ?? PORTS[0];
}

function computeRouteCost(
  baseFreight: number,
  distance: number,
  baseDistance: number,
  quantity: number,
  voyage: number,
  vesselDailyRate: number,
): { freight: number; fuel: number; portCharges: number } {
  const distRatio = distance / baseDistance;
  const qtyRatio = quantity / 70000;
  const baseFreightScaled = baseFreight * distRatio * qtyRatio;
  const fuel = vesselDailyRate * 18 * distRatio * 0.75;
  const portCharges = 85000 * qtyRatio;
  return { freight: baseFreightScaled, fuel, portCharges };
}

export function computeAnalysis(inputs: ProcurementInputs): ProcurementAnalysis {
  const { cargo, quantity, voyages, originCountry, loadingPort, destinationPort, contractStrategy } = inputs;

  // Vessel selection
  const vesselType = selectVessel(quantity);
  const vesselDailyRate = VESSEL_BASE_COST[vesselType] ?? 22300;

  // Port data
  const destPort = findPort(destinationPort);
  const portDetail: PortDetail = {
    name: destPort.name,
    congestion: destPort.congestion,
    congestionLevel: destPort.congestionLevel,
    waitingTime: destPort.waitingTime,
    maxDraft: destPort.maxDraft,
    maxLOA: destPort.maxLOA,
    maxBeam: destPort.maxBeam,
    cargoHandlingCapacity: destPort.cargoHandlingCapacity,
    berthsAvailable: destPort.berthsAvailable,
    totalBerths: destPort.totalBerths,
    suitableVessels: destPort.suitableVessels,
    riskLevel: destPort.riskLevel,
  };

  const allPorts: PortDetail[] = PORTS.map((p) => ({
    name: p.name,
    congestion: p.congestion,
    congestionLevel: p.congestionLevel,
    waitingTime: p.waitingTime,
    maxDraft: p.maxDraft,
    maxLOA: p.maxLOA,
    maxBeam: p.maxBeam,
    cargoHandlingCapacity: p.cargoHandlingCapacity,
    berthsAvailable: p.berthsAvailable,
    totalBerths: p.totalBerths,
    suitableVessels: p.suitableVessels,
    riskLevel: p.riskLevel,
  }));

  // Vessel scoring
  const spec = VESSEL_SPECS[vesselType];
  const portSpec = { draft: destPort.maxDraft, loa: destPort.maxLOA, beam: destPort.maxBeam, cargo: destPort.cargoHandlingCapacity };
  const draftOk = spec.draft <= portSpec.draft;
  const loaOk = spec.loa <= portSpec.loa;
  const beamOk = spec.beam <= portSpec.beam;
  const cargoOk = spec.cargo <= portSpec.cargo;
  const compatibilityScore = ((draftOk ? 25 : 0) + (loaOk ? 25 : 0) + (beamOk ? 25 : 0) + (cargoOk ? 25 : 0));
  const portCompatibility: "Pass" | "Restricted" | "Fail" = compatibilityScore === 100 ? "Pass" : compatibilityScore >= 50 ? "Restricted" : "Fail";

  const vesselRecommendations: VesselRecommendation[] = Object.keys(VESSEL_SPECS)
    .map((type): VesselRecommendation => {
      const s = VESSEL_SPECS[type];
      const isRecommended = type === vesselType;
      const dOk = s.draft <= portSpec.draft;
      const lOk = s.loa <= portSpec.loa;
      const bOk = s.beam <= portSpec.beam;
      const cOk = s.cargo <= portSpec.cargo;
      const comp = (dOk ? 25 : 0) + (lOk ? 25 : 0) + (bOk ? 25 : 0) + (cOk ? 25 : 0);
      const sizeFit = quantity <= s.cargo && quantity > s.cargo * 0.3 ? 20 : quantity <= s.cargo * 1.5 ? 10 : 0;
      const costScore = s.cargo >= quantity ? Math.round(20 - ((VESSEL_BASE_COST[type] - 21000) / 7000)) : 5;
      const score = clamp(comp * 0.4 + sizeFit + costScore + (isRecommended ? 15 : 0), 0, 100);
      return {
        type,
        dwt: `${(s.cargo / 1000).toFixed(0)}K DWT`,
        costPerDay: VESSEL_BASE_COST[type],
        score: Math.round(score),
        recommended: isRecommended,
        availability: VESSEL_AVAILABILITY[type],
        portCompatibility: comp === 100 ? "Pass" : comp >= 50 ? "Restricted" : "Fail",
        compatibilityScore: comp,
      };
    })
    .sort((a, b) => b.score - a.score);

  // Routes
  const distances = ORIGIN_DISTANCE_BASE[originCountry];
  const baseDistance = distances?.[loadingPort] ?? 6420;
  const baseFreightCost = ORIGIN_FREIGHT_BASE[originCountry] ?? 1_560_000;
  const freightMult = CARGO_WEIGHT_FACTORS[cargo] ?? 1.0;

  const routes: RouteOption[] = ROUTE_ALTERNATIVES.map((alt) => {
    const distance = Math.round(baseDistance * alt.distMultiplier);
    const duration = +(18.5 * alt.distMultiplier).toFixed(1);
    const { freight, fuel, portCharges } = computeRouteCost(baseFreightCost * freightMult, distance, baseDistance, quantity, 1, vesselDailyRate);
    return {
      name: alt.name,
      origin: loadingPort,
      destination: destinationPort,
      distance,
      duration,
      freightCost: Math.round(freight),
      fuelCost: Math.round(fuel),
      portCharges: Math.round(portCharges),
      riskLevel: alt.risk,
      recommended: alt.rec,
      note: alt.note,
    };
  });

  const recRoute = routes.find((r) => r.recommended) ?? routes[0];

  // Costs (per-voyage for selected contract, then x voyages)
  const recDistRatio = recRoute.distance / 6420;
  const qtyRatio = quantity / 70000;
  const baseVoyageCost = PER_VOYAGE_SPOT_BASE[contractStrategy] * recDistRatio * qtyRatio * freightMult;

  const freight = Math.round(baseVoyageCost * 0.844 * voyages);
  const fuelCost = Math.round(baseVoyageCost * 0.061 * voyages);
  const portCharges = Math.round(baseVoyageCost * 0.049 * voyages);
  const waitingDemurrage = Math.round(destPort.waitingTime * vesselDailyRate * 0.35 * voyages);
  const repositioningCost = Math.round(baseVoyageCost * 0.013 * voyages);
  const riskBuffer = Math.round(baseVoyageCost * 0.01 * voyages);
  const totalCost = freight + fuelCost + portCharges + waitingDemurrage + repositioningCost + riskBuffer;

  const spotTotal = PER_VOYAGE_SPOT_BASE.spot * recDistRatio * qtyRatio * freightMult * voyages;
  const optimizedTotal = totalCost;
  const savingsVsSpot = Math.max(0, spotTotal - optimizedTotal);
  const savingsPct = spotTotal > 0 ? (savingsVsSpot / spotTotal) * 100 : 0;

  const costs: CostBreakdown = {
    freightCost: freight,
    fuelCost,
    portCharges,
    waitingDemurrage,
    repositioningCost,
    riskBuffer,
    total: totalCost,
  };

  // Risk
  let riskScore = 55;
  if (contractStrategy === "spot") riskScore += 8;
  if (contractStrategy === "medium") riskScore -= 5;
  riskScore += Math.max(0, destPort.congestionLevel - 50) * 0.3;
  riskScore += Math.max(0, destPort.waitingTime - 3) * 1.5;
  if (distanceToRisk(baseDistance) === "High") riskScore += 5;
  else if (distanceToRisk(baseDistance) === "Low") riskScore -= 3;
  riskScore = clamp(Math.round(riskScore), 0, 100);
  const riskLevel: "Low" | "Medium" | "High" = riskScore >= 70 ? "High" : riskScore >= 45 ? "Medium" : "Low";

  const risks: RiskItem[] = [
    {
      category: "Freight Rate Volatility",
      severity: riskScore > 65 ? "High" : "Medium",
      probability: "High",
      impact: "High",
      suggestedAction: "Review chartering window",
      status: "New",
      color: riskScore > 65 ? "red" : "amber",
    },
    {
      category: "Port Congestion",
      severity: destPort.congestionLevel > 60 ? "High" : "Medium",
      probability: destPort.congestionLevel > 60 ? "High" : "Medium",
      impact: "Medium",
      suggestedAction: "Evaluate alternative port",
      status: destPort.congestionLevel > 60 ? "New" : "Reviewed",
      color: destPort.congestionLevel > 60 ? "red" : "amber",
    },
    {
      category: "Weather / Cyclone",
      severity: "Low",
      probability: "Medium",
      impact: "Medium",
      suggestedAction: "Monitor forecast",
      status: "Reviewed",
      color: "green",
    },
    {
      category: "Geopolitical Disruption",
      severity: "Low",
      probability: "High",
      impact: "High",
      suggestedAction: "Recalculate cost and route",
      status: "New",
      color: baseDistance > 8000 ? "red" : "amber",
    },
    {
      category: "Vessel Availability",
      severity: vesselRecommendations[0]?.availability === "Low" ? "High" : "Medium",
      probability: "Medium",
      impact: "Medium",
      suggestedAction: "Compare alternative vessel",
      status: "Reviewed",
      color: vesselRecommendations[0]?.availability === "Low" ? "red" : "amber",
    },
    {
      category: "Forecast Uncertainty",
      severity: "Medium",
      probability: "Medium",
      impact: "Medium",
      suggestedAction: "Use wider risk buffer",
      status: "Reviewed",
      color: "amber",
    },
  ];

  // Alerts
  const alerts: AnalysisAlert[] = [
    {
      id: 1,
      title: "Freight volatility rising",
      description: `30-day forecast increased ${Math.round(savingsPct * 2.3) + 5}%. Review chartering window.`,
      date: "13 Sep 2026",
      location: `${originCountry} \u2192 ${destinationPort}`,
      severity: "High",
      status: "New",
      action: "Review chartering window",
    },
    {
      id: 2,
      title: `${destPort.name} congestion watch`,
      description: `Expected waiting time reached ${destPort.waitingTime} days. Evaluate alternative port.`,
      date: "12 Sep 2026",
      location: `${destPort.name} Port`,
      severity: destPort.congestionLevel > 60 ? "High" : "Medium",
      status: destPort.congestionLevel > 60 ? "New" : "Reviewed",
      action: "Evaluate alternative port",
    },
    {
      id: 3,
      title: "Cyclone monitoring update",
      description: "No immediate operational disruption. Monitor forecast.",
      date: "11 Sep 2026",
      location: "East Coast India",
      severity: "Low",
      status: "Reviewed",
      action: "Monitor forecast",
    },
    {
      id: 4,
      title: "Geopolitical route advisory",
      description: "Potential disruption may affect transit assumptions. Recalculate cost.",
      date: "10 Sep 2026",
      location: "Indian Ocean corridor",
      severity: baseDistance > 8000 ? "Medium" : "Low",
      status: "New",
      action: "Recalculate cost",
    },
  ];

  // Contract strategies
  const strategies: StrategyComparison[] = (["spot", "short", "medium"] as ContractStrategyKey[]).map((key) => {
    const perVoyageCost = PER_VOYAGE_SPOT_BASE[key] * recDistRatio * qtyRatio * freightMult;
    const stratTotal = Math.round(perVoyageCost * voyages);
    const stratSavings = key === "spot" ? 0 : Math.max(0, spotTotal - stratTotal);
    return {
      name: CONTRACT_LABELS[key],
      code: key.toUpperCase(),
      totalCost: stratTotal,
      costPerTonne: stratTotal / quantity,
      costPerVoyage: perVoyageCost,
      savings: stratSavings,
      priceCertainty: key === "medium" ? "High" : key === "short" ? "Medium" : "Low",
      flexibility: key === "spot" ? "High" : key === "short" ? "Medium" : "Low",
      marketExposure: key === "spot" ? "High" : key === "short" ? "Medium" : "Low",
      operationalRisk: "Medium" as const,
      recommended: key === contractStrategy,
      relativeCost: key === "spot" ? 100 : Math.round((stratTotal / (PER_VOYAGE_SPOT_BASE.spot * recDistRatio * qtyRatio * freightMult * voyages)) * 100),
    };
  });

  // Freight forecast (scales with route distance and market conditions)
  const currentRate = Math.round(vesselDailyRate * (1 + (baseDistance - 6000) / 10000));
  const freightForecastChange = clamp(Math.round(5 + (baseDistance - 6000) / 500 + destPort.congestionLevel / 15), 3, 25);
  const freightForecast: FreightForecast = {
    current: currentRate,
    predicted30d: Math.round(currentRate * (1 + freightForecastChange / 100)),
    weeklyChange: +(2 + (destPort.congestionLevel - 50) / 50).toFixed(1),
    forecastChange30d: freightForecastChange,
    confidence: clamp(90 - Math.round(destPort.congestionLevel / 10) - Math.round(baseDistance / 2000), 65, 95),
    trend: "Increasing",
    chartingWindow: destPort.congestionLevel > 60 ? "Next 3 days" : "Next 7 days",
  };

  const confidence = freightForecast.confidence;

  return {
    inputs,
    freight: freightForecast,
    vessels: vesselRecommendations,
    selectedPort: portDetail,
    allPorts,
    routes,
    costs,
    riskScore,
    riskLevel,
    risks,
    alerts,
    strategies,
    potentialSavingsUSD: Math.round(savingsVsSpot),
    potentialSavingsINR: Math.round(savingsVsSpot * 83),
    savingsPercent: +savingsPct.toFixed(1),
    confidence,
  };
}

function distanceToRisk(dist: number): "Low" | "Medium" | "High" {
  if (dist > 8500) return "High";
  if (dist > 6500) return "Medium";
  return "Low";
}

/** Default procurement inputs = the demo scenario */
export const DEFAULT_INPUTS: ProcurementInputs = {
  cargo: "Coal",
  quantity: 70000,
  voyages: 4,
  originCountry: "Australia",
  loadingPort: "Hay Point",
  destinationPort: "Paradip",
  contractHorizon: "3 Months",
  contractStrategy: "short",
};
