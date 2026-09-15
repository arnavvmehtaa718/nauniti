// ============================================================
// OceanIQ Mock Data - Centralized Data Store
// DEMO MODE: All values are illustrative simulated prototype data.
// ============================================================

// ---- FREIGHT RATE DATA ----
export interface FreightChartPoint {
  date: string;
  rate: number | null;
  forecast: number | null;
  lower: number | null;
  upper: number | null;
}

export const FREIGHT_CHART_DATA: FreightChartPoint[] = [
  { date: '13 Aug', rate: 18200, forecast: null, lower: null, upper: null },
  { date: '20 Aug', rate: 18600, forecast: null, lower: null, upper: null },
  { date: '27 Aug', rate: 19100, forecast: null, lower: null, upper: null },
  { date: '03 Sep', rate: 19800, forecast: null, lower: null, upper: null },
  { date: '10 Sep', rate: 20100, forecast: null, lower: null, upper: null },
  { date: '13 Sep', rate: 20450, forecast: 20450, lower: 20200, upper: 20700 },
  { date: '20 Sep', rate: null, forecast: 21100, lower: 20600, upper: 21600 },
  { date: '27 Sep', rate: null, forecast: 21800, lower: 21100, upper: 22500 },
  { date: '04 Oct', rate: null, forecast: 22300, lower: 21400, upper: 23200 },
  { date: '11 Oct', rate: null, forecast: 22800, lower: 21800, upper: 23800 },
];

// ---- VESSEL DATA ----
export interface Vessel {
  type: string;
  dwt: string;
  portCompatibility: 'Pass' | 'Restricted' | 'Fail';
  estimatedCost: number;
  costPerDay: number;
  recommended: boolean;
  score: number;
  availability: 'High' | 'Medium' | 'Low';
  compatibilityScore: number;
}

export const VESSELS: Vessel[] = [
  {
    type: 'Handysize',
    dwt: '10K–40K DWT',
    portCompatibility: 'Pass',
    estimatedCost: 28000,
    costPerDay: 28000,
    recommended: false,
    score: 62,
    availability: 'High',
    compatibilityScore: 70,
  },
  {
    type: 'Supramax',
    dwt: '50K–60K DWT',
    portCompatibility: 'Pass',
    estimatedCost: 25000,
    costPerDay: 25000,
    recommended: false,
    score: 74,
    availability: 'Medium',
    compatibilityScore: 78,
  },
  {
    type: 'Panamax',
    dwt: '60K–85K DWT',
    portCompatibility: 'Pass',
    estimatedCost: 22300,
    costPerDay: 22300,
    recommended: true,
    score: 87,
    availability: 'Medium',
    compatibilityScore: 87,
  },
  {
    type: 'Capesize',
    dwt: '100K+ DWT',
    portCompatibility: 'Restricted',
    estimatedCost: 21000,
    costPerDay: 21000,
    recommended: false,
    score: 45,
    availability: 'Low',
    compatibilityScore: 45,
  },
];

// ---- PORT DATA ----
export interface Port {
  name: string;
  country: string;
  state?: string;
  coast?: string;
  congestion: 'Low' | 'Medium' | 'High';
  congestionLevel: number;
  waitingTime: number;
  waitingRange?: string;
  cargoHandlingCapacity: number;
  maxDraft: number;
  maxLOA: number;
  maxBeam: number;
  berthsAvailable: number;
  totalBerths: number;
  suitableVessels: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
}

export const PORTS: Port[] = [
  {
    name: 'Paradip',
    country: 'India',
    state: 'Odisha',
    coast: 'East Coast',
    congestion: 'Medium',
    congestionLevel: 55,
    waitingTime: 3.5,
    waitingRange: '8–12 hrs',
    cargoHandlingCapacity: 85000,
    maxDraft: 14.5,
    maxLOA: 290,
    maxBeam: 45,
    berthsAvailable: 6,
    totalBerths: 9,
    suitableVessels: ['Supramax', 'Panamax', 'Handysize'],
    riskLevel: 'Medium',
  },
  {
    name: 'Visakhapatnam',
    country: 'India',
    congestion: 'Low',
    congestionLevel: 30,
    waitingTime: 1.8,
    waitingRange: '18–24 hrs',
    cargoHandlingCapacity: 90000,
    maxDraft: 15.5,
    maxLOA: 300,
    maxBeam: 48,
    berthsAvailable: 8,
    totalBerths: 12,
    suitableVessels: ['Panamax', 'Capesize', 'Supramax'],
    riskLevel: 'Low',
  },
  {
    name: 'Gangavaram',
    country: 'India',
    congestion: 'Low',
    congestionLevel: 25,
    waitingTime: 1.2,
    waitingRange: '6–10 hrs',
    cargoHandlingCapacity: 95000,
    maxDraft: 16.5,
    maxLOA: 310,
    maxBeam: 50,
    berthsAvailable: 5,
    totalBerths: 7,
    suitableVessels: ['Panamax', 'Capesize'],
    riskLevel: 'Low',
  },
  {
    name: 'Gopalpur',
    country: 'India',
    congestion: 'High',
    congestionLevel: 78,
    waitingTime: 5.2,
    waitingRange: '36–48 hrs',
    cargoHandlingCapacity: 60000,
    maxDraft: 12.5,
    maxLOA: 200,
    maxBeam: 32,
    berthsAvailable: 2,
    totalBerths: 4,
    suitableVessels: ['Handysize', 'Supramax'],
    riskLevel: 'High',
  },
  {
    name: 'Dhamra',
    country: 'India',
    congestion: 'Medium',
    congestionLevel: 60,
    waitingTime: 2.8,
    waitingRange: '12–18 hrs',
    cargoHandlingCapacity: 75000,
    maxDraft: 14.0,
    maxLOA: 260,
    maxBeam: 42,
    berthsAvailable: 3,
    totalBerths: 5,
    suitableVessels: ['Panamax', 'Supramax'],
    riskLevel: 'Medium',
  },
  {
    name: 'Haldia',
    country: 'India',
    congestion: 'High',
    congestionLevel: 82,
    waitingTime: 6.1,
    waitingRange: '',
    cargoHandlingCapacity: 55000,
    maxDraft: 11.0,
    maxLOA: 180,
    maxBeam: 28,
    berthsAvailable: 2,
    totalBerths: 6,
    suitableVessels: ['Handysize'],
    riskLevel: 'High',
  },
];

// ---- ALERT DATA ----
export const ALERTS = [
  {
    id: 1,
    title: 'Freight volatility rising',
    description: '30-day forecast increased 11.5%. Review chartering window.',
    date: '13 Sep 2026',
    location: 'Australia → Paradip',
    severity: 'High' as const,
    status: 'New' as const,
    action: 'Review chartering window',
  },
  {
    id: 2,
    title: 'Paradip congestion watch',
    description: 'Expected waiting time reached 3.5 days. Evaluate alternative port.',
    date: '12 Sep 2026',
    location: 'Paradip Port',
    severity: 'Medium' as const,
    status: 'Reviewed' as const,
    action: 'Evaluate alternative port',
  },
  {
    id: 3,
    title: 'Cyclone monitoring update',
    description: 'No immediate operational disruption. Monitor forecast.',
    date: '11 Sep 2026',
    location: 'East Coast India',
    severity: 'Low' as const,
    status: 'Reviewed' as const,
    action: 'Monitor forecast',
  },
  {
    id: 4,
    title: 'Geopolitical route advisory',
    description: 'Potential disruption may affect transit assumptions. Recalculate cost.',
    date: '10 Sep 2026',
    location: 'Indian Ocean corridor',
    severity: 'Medium' as const,
    status: 'New' as const,
    action: 'Recalculate cost',
  },
];