// ============================================================
// NauNiti Mock Data - Centralized Data Store
// DEMO MODE: All values are illustrative simulated prototype data.
// ============================================================

export const DEMO_SCENARIO = {
  cargo: 'Coal',
  quantity: 70000,
  voyages: 4,
  originCountry: 'Australia',
  loadingPort: 'Hay Point',
  destinationPort: 'Paradip',
  contractHorizon: '3 Months',
  contractStrategy: 'Short-Term Multiple-Voyage',
  recommendedVessel: 'Panamax',
  deliveryDate: '15 Dec 2026',
};

// ---- FREIGHT RATE DATA ----
export const FREIGHT_RATES = {
  current: 20450,
  predicted30d: 22800,
  weeklyChange: 2.6,
  forecastChange30d: 11.5,
  confidence: 87,
  trend: 'Increasing' as const,
  chartingWindow: 'NEXT 7 DAYS',
};

export const FREIGHT_CHART_DATA = [
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

export const MARKET_DRIVERS = [
  'Fuel price trend',
  'Commodity demand',
  'Seasonality',
  'Port congestion',
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

export const PORT_CONSTRAINTS = {
  paradip: {
    draft: { required: 14.0, limit: 15.0, unit: 'm' },
    loa: { required: 225, limit: 245, unit: 'm' },
    beam: { required: 32, limit: 40, unit: 'm' },
    cargoHandling: { required: 70000, limit: 85000, unit: 'tonnes' },
  },
};

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

export const PORT_CONGESTION_CHART_DATA = [
  { date: '1 Sep', actual: 2.8, forecast: null },
  { date: '5 Sep', actual: 3.1, forecast: null },
  { date: '10 Sep', actual: 3.5, forecast: null },
  { date: '13 Sep', actual: 3.5, forecast: 3.5 },
  { date: '17 Sep', actual: null, forecast: 3.8 },
  { date: '20 Sep', actual: null, forecast: 4.1 },
  { date: '25 Sep', actual: null, forecast: 3.9 },
  { date: '30 Sep', actual: null, forecast: 3.6 },
];

// ---- ROUTE DATA ----
export interface Route {
  name: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  freightCost: number;
  fuelCost: number;
  portCharges: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommended: boolean;
  note: string;
}

export const ROUTES: Route[] = [
  {
    name: 'Recommended Route',
    origin: 'Hay Point',
    destination: 'Paradip',
    distance: 6420,
    duration: 18.5,
    freightCost: 1560000,
    fuelCost: 420000,
    portCharges: 85000,
    riskLevel: 'Medium',
    recommended: true,
    note: 'Best balance',
  },
  {
    name: 'Southern Alternative',
    origin: 'Hay Point',
    destination: 'Paradip',
    distance: 6880,
    duration: 20.2,
    freightCost: 1680000,
    fuelCost: 450000,
    portCharges: 85000,
    riskLevel: 'Low',
    recommended: false,
    note: 'Lower risk',
  },
  {
    name: 'Northern Alternative',
    origin: 'Hay Point',
    destination: 'Paradip',
    distance: 7120,
    duration: 21.0,
    freightCost: 1740000,
    fuelCost: 480000,
    portCharges: 90000,
    riskLevel: 'High',
    recommended: false,
    note: 'Avoid',
  },
];

// ---- RISK DATA ----
export interface Risk {
  category: string;
  severity: 'Low' | 'Medium' | 'High';
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  suggestedAction: string;
  status: 'New' | 'Reviewed' | 'Resolved';
  color: 'green' | 'amber' | 'red';
}

export const RISKS: Risk[] = [
  {
    category: 'Freight Rate Volatility',
    severity: 'High',
    probability: 'High',
    impact: 'High',
    suggestedAction: 'Review chartering window',
    status: 'New',
    color: 'amber',
  },
  {
    category: 'Port Congestion',
    severity: 'Medium',
    probability: 'High',
    impact: 'Medium',
    suggestedAction: 'Evaluate alternative port',
    status: 'Reviewed',
    color: 'amber',
  },
  {
    category: 'Weather / Cyclone',
    severity: 'Low',
    probability: 'Medium',
    impact: 'Medium',
    suggestedAction: 'Monitor forecast',
    status: 'Reviewed',
    color: 'green',
  },
  {
    category: 'Geopolitical Disruption',
    severity: 'Low',
    probability: 'High',
    impact: 'High',
    suggestedAction: 'Recalculate cost and route',
    status: 'New',
    color: 'red',
  },
  {
    category: 'Vessel Availability',
    severity: 'Medium',
    probability: 'Medium',
    impact: 'Medium',
    suggestedAction: 'Compare alternative vessel',
    status: 'Reviewed',
    color: 'amber',
  },
  {
    category: 'Forecast Uncertainty',
    severity: 'Medium',
    probability: 'Medium',
    impact: 'Medium',
    suggestedAction: 'Use wider risk buffer',
    status: 'Reviewed',
    color: 'amber',
  },
];

export const RISK_SCORE = 62;

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

// ---- CONTRACT STRATEGY DATA ----
export interface ContractStrategy {
  name: string;
  code: string;
  totalCost: number;
  costPerTonne: number;
  costPerVoyage: number;
  savings: number;
  priceCertainty: 'Low' | 'Medium' | 'High';
  flexibility: 'Low' | 'Medium' | 'High';
  marketExposure: 'Low' | 'Medium' | 'High';
  operationalRisk: 'Low' | 'Medium' | 'High';
  recommended: boolean;
  relativeCost: number;
}

export const CONTRACT_STRATEGIES: ContractStrategy[] = [
  {
    name: 'Repeated Spot Contracts',
    code: 'SPOT',
    totalCost: 7280000,
    costPerTonne: 104,
    costPerVoyage: 1820000,
    savings: 0,
    priceCertainty: 'Low',
    flexibility: 'High',
    marketExposure: 'High',
    operationalRisk: 'Medium',
    recommended: false,
    relativeCost: 100,
  },
  {
    name: 'Short-Term Multiple-Voyage Contract',
    code: 'SHORT',
    totalCost: 6920000,
    costPerTonne: 98.9,
    costPerVoyage: 1730000,
    savings: 360000,
    priceCertainty: 'Medium',
    flexibility: 'Medium',
    marketExposure: 'Medium',
    operationalRisk: 'Medium',
    recommended: true,
    relativeCost: 90,
  },
  {
    name: 'Medium-Term Multiple-Voyage Contract',
    code: 'MEDIUM',
    totalCost: 6680000,
    costPerTonne: 95.4,
    costPerVoyage: 1670000,
    savings: 600000,
    priceCertainty: 'High',
    flexibility: 'Low',
    marketExposure: 'Low',
    operationalRisk: 'Medium',
    recommended: false,
    relativeCost: 86,
  },
];

export const COST_BREAKDOWN = {
  freightCost: 5840000,
  fuelCost: 420000,
  portCharges: 340000,
  waitingDemurrage: 160000,
  repositioningCost: 90000,
  riskBuffer: 70000,
  total: 6920000,
};

// ---- COST & SAVINGS DATA ----
export const COST_SAVINGS = {
  currentStrategy: {
    name: 'Repeated Spot Contracts',
    totalCost: 7280000,
    freightCost: 6240000,
    fuelCost: 450000,
    portCharges: 360000,
    waitingDemurrage: 140000,
    repositioningCost: 90000,
  },
  optimizedStrategy: {
    name: 'Short-Term Multiple-Voyage (NauNiti Recommended)',
    totalCost: 6920000,
    freightCost: 5840000,
    fuelCost: 420000,
    portCharges: 340000,
    waitingDemurrage: 160000,
    repositioningCost: 90000,
  },
  potentialSavingsUSD: 360000,
  potentialSavingsINR: 14800000,
  savingsPercent: 4.9,
};

// ---- REPORTS DATA ----
export const REPORTS = [
  {
    id: 1,
    name: 'Australia–Paradip Analysis',
    route: 'Hay Point → Paradip',
    cargo: 'Coal',
    date: '13 Sep 2026',
    type: 'Procurement',
    status: 'READY' as const,
  },
  {
    id: 2,
    name: 'Port Congestion Review',
    route: 'East Coast India',
    cargo: 'Coal',
    date: '12 Sep 2026',
    type: 'Risk Report',
    status: 'READY' as const,
  },
  {
    id: 3,
    name: 'Vessel Comparison Report',
    route: 'Australia → Paradip',
    cargo: 'Coal',
    date: '11 Sep 2026',
    type: 'Vessel Analysis',
    status: 'READY' as const,
  },
  {
    id: 4,
    name: 'Contract Strategy Summary',
    route: 'Australia → Paradip',
    cargo: 'Coal',
    date: '10 Sep 2026',
    type: 'Cost Analysis',
    status: 'READY' as const,
  },
];

// ---- AI ASSISTANT DATA ----
export const AI_SUGGESTIONS = [
  'Why is Panamax recommended?',
  'Should I charter now or wait?',
  'Compare Paradip and Gangavaram.',
  'What happens if congestion increases?',
  'Which contract strategy is better?',
  'Why is the market risk medium?',
  'What is the total expected cost?',
  'Explain the route optimization.',
];

export const AI_RESPONSES: Record<string, { answer: string; actions?: string[] }> = {
  'Why is Panamax recommended?': {
    answer: `**Panamax is the recommended vessel type** for this cargo and route combination based on the following analysis:

1. **Cargo Capacity Match** — The 70,000 tonne coal cargo falls within the optimal loading range for a Panamax vessel (60K–85K DWT), ensuring efficient capacity utilization.

2. **Port Compatibility** — Paradip port allows vessels with draft up to 15.0m, LOA up to 245m, and beam up to 40m. Panamax specifications satisfy all three constraints with a Pass status.

3. **Cost Efficiency** — At ₹22,300/day, Panamax offers the best balance of cost per tonne and daily charter rate among compatible vessels.

4. **Vessel Availability** — Current market availability for Panamax class in the Australia–India corridor is Medium, which is acceptable for the planned charter window.

5. **Overall Recommendation Score** — Panamax achieved a composite score of **87/100**, the highest among all evaluated vessel types.

*Note: Capesize vessels are restricted at Paradip due to draft constraints.*`,
    actions: ['View Vessel Details', 'Run Simulation', 'Compare Vessels', 'View Port Constraints'],
  },
  'Should I charter now or wait?': {
    answer: `**Recommended action: Charter within the next 7 days.**

Based on our freight rate forecast analysis:

- **Current Rate:** $20,450/day
- **Predicted Rate (30 days):** $22,800/day (+11.5%)
- **Forecast Confidence:** 87%

**Market Drivers supporting this recommendation:**
- Fuel prices trending upward
- Seasonal coal demand increase
- Paradip port congestion is medium — within acceptable range now
- Panamax availability window is currently favorable

**Risk of waiting beyond 7 days:**
- Estimated additional cost: ~$36,000–$50,000 per voyage
- For 4 voyages: potential additional exposure of $144K–$200K

**Conclusion:** The market window is favorable. Chartering within 7 days is advised to lock in current rates before the expected 11.5% increase.`,
    actions: ['View Freight Forecast', 'Run What-If Simulation', 'View Risk Assessment'],
  },
  'Compare Paradip and Gangavaram.': {
    answer: `**Port Comparison: Paradip vs Gangavaram**

| Metric | Paradip | Gangavaram |
|--------|---------|------------|
| Congestion | Medium (55%) | Low (25%) |
| Waiting Time | 3.5 days | 1.2 days |
| Max Draft | 14.5m | 16.5m |
| Handling Cap | 85,000 T/day | 95,000 T/day |
| Berths | 6/9 available | 5/7 available |
| Risk Level | Medium | Low |
| Suitable Vessels | Supramax, Panamax | Panamax, Capesize |

**Gangavaram Advantages:**
- Lower congestion → 2.3 fewer waiting days
- Higher cargo handling capacity
- Lower operational risk
- Deeper draft allows larger vessels

**Paradip Advantages:**
- Primary SAIL procurement port (established relationships)
- More berths available overall
- Closer to SAIL's Odisha steel plants
- Lower logistics cost to end destination

**Recommendation:** For this specific scenario (Coal, 70K tonnes, Panamax), Paradip remains the preferred choice due to proximity to SAIL facilities. Gangavaram is a viable alternative if port congestion increases significantly.`,
    actions: ['View Port Analytics', 'Compare All Ports', 'View Route Optimization'],
  },
  'What happens if congestion increases?': {
    answer: `**Congestion Sensitivity Analysis**

If Paradip congestion increases from **Medium (55%) to High (80%)**:

**Operational Impact:**
- Waiting time increases from 3.5 days → 5.5–7 days
- Additional demurrage cost: ~$22,300/day × 2.5 days = **+$55,750/voyage**
- For 4 voyages: **+$223,000 additional cost**

**Total Cost Impact:**
- Current estimate: $6.92M → Revised: **$7.14M** (+3.2%)
- Potential savings vs spot: reduced from ₹1.48 Cr → ~₹1.01 Cr

**Risk Escalation:**
- Port risk: Medium → High
- Overall risk score: 62/100 → 71/100

**Recommended Actions:**
1. Monitor Paradip congestion weekly
2. Pre-evaluate Gangavaram as backup (waiting time: 1.2 days)
3. Add congestion buffer to contract terms
4. Consider staggered voyage timing to avoid peak congestion

*This is a simulated sensitivity analysis based on prototype data.*`,
    actions: ['View Port Analytics', 'Run Simulation', 'View Risk Center'],
  },
  'Which contract strategy is better?': {
    answer: `**Contract Strategy Comparison for this scenario:**

**For 70,000 tonnes Coal, 4 voyages, 3-month horizon:**

| Strategy | Total Cost | Cost/Tonne | Flexibility | Risk |
|----------|-----------|-----------|-------------|------|
| Repeated Spot | $7.28M | $104/t | High | High |
| **Short-Term MVP** ✓ | **$6.92M** | **$98.9/t** | Medium | Medium |
| Medium-Term MVP | $6.68M | $95.4/t | Low | Lower |

**NauNiti Recommendation: Short-Term Multiple-Voyage Contract**

**Why not spot?**
- $360K higher total cost
- Full market volatility exposure
- No price certainty across voyages

**Why not medium-term?**
- Low flexibility — difficult to adjust if SAIL demand changes
- Locks in pricing for longer horizon with uncertain coal demand
- Higher commitment risk

**Short-Term MVC balances:**
- ✅ $360K savings vs spot
- ✅ Moderate market exposure
- ✅ Flexibility to renegotiate after horizon
- ✅ Manageable operational risk

*Potential savings: ₹1.48 Cr (illustrative estimate)*`,
    actions: ['View Contract Strategy', 'View Cost & Savings', 'Generate Report'],
  },
};

// ---- SIMULATION DATA ----
export const SIMULATION_BASE = {
  freightCost: 1820000,
  idleTime: 3.5,
  riskLevel: 'High' as const,
  portRisk: 'Medium' as const,
  totalCost: 7280000,
  contractStrategy: 'Repeated Spot',
  vessel: 'Panamax',
  port: 'Paradip',
  charterDate: 'Today',
};

// ---- FINAL RECOMMENDATION ----
export const FINAL_RECOMMENDATION = {
  strategy: 'Wait 7 Days + Panamax + Hay Point → Paradip + Short-Term Multiple-Voyage Contract',
  waitDays: 7,
  vessel: 'Panamax',
  route: 'Hay Point → Paradip',
  contractType: 'Short-Term Multiple-Voyage Contract',
  expectedTotalCost: 6920000,
  potentialSavingsUSD: 360000,
  potentialSavingsINR: 14800000,
  riskLevel: 'Medium' as const,
  confidence: 87,
  reasons: [
    'Freight trend is unfavorable for delaying beyond the recommended window.',
    'Panamax provides optimal cargo capacity match for 70,000 tonnes.',
    'All port constraints at Paradip are satisfied by Panamax specifications.',
    'Route has acceptable operational risk (Medium) with best cost/time balance.',
    'Short-Term Multiple-Voyage contract balances flexibility and cost certainty.',
    'Overall expected cost is $360K lower than repeated spot contracting.',
  ],
};
