// src/data/assets.ts
// COMPLETE FILE — drop-in replacement
import type { Asset, Alert, TrendPoint } from "../types";

// Helper to generate synthetic trend rows with the fields the UI expects.
function mkTrend(opts: {
  minutes?: number;
  deltaT?: number;      // °C above ambient baseline
  vibration?: number;   // mm/s baseline
  current?: number;     // A baseline
  flow?: number | null; // m³/h baseline (only for pumps)
  ambient?: number;     // ambient baseline °C
} = {}): TrendPoint[] {
  const {
    minutes = 240,
    deltaT = 4.0,
    vibration = 2.2,
    current = 10.0,
    flow = null,
    ambient = 22,
  } = opts;

  const now = Date.now();
  const step = 60_000; // 1 point per min
  const jitter = (base: number, i: number, mag = 0.08) =>
    +(base * (1 + Math.sin(i / 7) * mag + Math.cos(i / 11) * (mag * 0.5))).toFixed(2);

  const out: TrendPoint[] = [];

  for (let i = minutes - 1; i >= 0; i--) {
    const dT = +jitter(deltaT, i, 0.05).toFixed(1);
    const vib = jitter(vibration, i, 0.07);
    const amps = jitter(current, i, 0.05);
    const row: TrendPoint = {
      t: new Date(now - i * step).toISOString(),
      deltaT: dT,
      vibration: vib,
      current: amps,
      // mirrors for AssetTrendChart:
      bearingTemp: +(ambient + dT).toFixed(1),
      vibrationRms: vib,
      currentAmps: amps,
      ...(typeof flow === "number" ? { flowRate: jitter(flow, i, 0.06) } : {}),
    };
    out.push(row);
  }
  return out;
}

// --------- ASSETS ---------

export const assets: Asset[] = [
  {
    id: "MTR-001",
    name: "Main Conveyor Motor",
    type: "motor",
    location: "Line 1 — Head",
    status: "Critical",
    health: 54,
    lastServiced: "2025-08-18T10:00:00Z",
    runtimeHours: 312.4,
    serviceNotes: "Brush wear suspected; check bearings.",
    trend: mkTrend({ deltaT: 8.5, vibration: 5.1, current: 13.2 }),
  },
  {
    id: "PMP-014",
    name: "Process Pump 14",
    type: "pump",
    location: "Skid A — Bay 3",
    status: "Warning",
    health: 71,
    lastServiced: "2025-08-11T10:00:00Z",
    runtimeHours: 228.9,
    serviceNotes: "Grease bearings; inspect seals.",
    trend: mkTrend({ deltaT: 6.2, vibration: 3.4, current: 11.4, flow: 22 }),
  },
  {
    id: "FAN-003",
    name: "Cooling Fan 3",
    type: "fan",
    location: "HVAC Roof",
    status: "Warning",
    health: 76,
    lastServiced: "2025-08-02T10:00:00Z",
    runtimeHours: 185.2,
    serviceNotes: "Belt check recommended.",
    trend: mkTrend({ deltaT: 5.0, vibration: 3.1, current: 8.6 }),
  },

  // New assets
  {
    id: "MTR-010",
    name: "Main Mill Motor",
    type: "motor",
    location: "Line 2 — Bay A",
    status: "Warning",
    health: 68,
    lastServiced: "2025-08-20T09:00:00Z",
    runtimeHours: 190.5,
    serviceNotes: "Noise noted on startup; monitor vibration.",
    trend: mkTrend({ deltaT: 6.5, vibration: 3.2, current: 12.1 }),
  },
  {
    id: "PMP-021",
    name: "Transfer Pump 21",
    type: "pump",
    location: "Tank Farm — South",
    status: "Healthy",
    health: 88,
    lastServiced: "2025-08-08T08:30:00Z",
    runtimeHours: 140.0,
    serviceNotes: "All within spec.",
    trend: mkTrend({ deltaT: 3.8, vibration: 1.8, current: 9.4, flow: 30 }),
  },
  {
    id: "FAN-009",
    name: "Extraction Fan 9",
    type: "fan",
    location: "Packaging Hall",
    status: "Healthy",
    health: 92,
    lastServiced: "2025-08-28T12:00:00Z",
    runtimeHours: 96.3,
    serviceNotes: "Replace filter next service interval.",
    trend: mkTrend({ deltaT: 3.0, vibration: 1.5, current: 6.8 }),
  },
  {
    id: "MTR-022",
    name: "Palletizer Motor",
    type: "motor",
    location: "Dispatch — Cell 2",
    status: "Healthy",
    health: 90,
    lastServiced: "2025-08-12T10:00:00Z",
    runtimeHours: 130.7,
    serviceNotes: "No issues; lubrication OK.",
    trend: mkTrend({ deltaT: 3.9, vibration: 1.6, current: 7.9 }),
  },
  {
    id: "PMP-032",
    name: "CIP Return Pump",
    type: "pump",
    location: "Utilities — CIP",
    status: "Warning",
    health: 72,
    lastServiced: "2025-07-30T10:00:00Z",
    runtimeHours: 260.1,
    serviceNotes: "Seal seepage observed; monitor.",
    trend: mkTrend({ deltaT: 6.0, vibration: 3.3, current: 10.8, flow: 18 }),
  },
  {
    id: "FAN-012",
    name: "Cooling Tower Fan",
    type: "fan",
    location: "Outside — CT-1",
    status: "Critical",
    health: 52,
    lastServiced: "2025-07-20T10:00:00Z",
    runtimeHours: 350.9,
    serviceNotes: "High vibration at 75% duty; inspect hub/bearing.",
    trend: mkTrend({ deltaT: 8.9, vibration: 5.6, current: 14.0 }),
  },
  {
    id: "MTR-031",
    name: "Conveyor Lift Motor",
    type: "motor",
    location: "Line 3 — Lift",
    status: "Healthy",
    health: 95,
    lastServiced: "2025-08-29T10:00:00Z",
    runtimeHours: 62.2,
    serviceNotes: "New brushes fitted; baseline captured.",
    trend: mkTrend({ deltaT: 3.1, vibration: 1.2, current: 6.3 }),
  },
];

// --------- ALERTS ---------

export const alerts: Alert[] = [
  {
    id: "al-mtr001-1",
    assetId: "MTR-001",
    when: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1h ago
    severity: "critical",
    text: "Vibration trending up vs baseline",
  },
  {
    id: "al-pmp014-1",
    assetId: "PMP-014",
    when: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
    severity: "warning",
    text: "Seal temperature elevated",
  },
  {
    id: "al-fan003-1",
    assetId: "FAN-003",
    when: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26h ago
    severity: "warning",
    text: "Belt slip detected intermittently",
  },
  {
    id: "al-mtr010-1",
    assetId: "MTR-010",
    when: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    severity: "warning",
    text: "Current imbalance vs phase B",
  },
  {
    id: "al-fan012-1",
    assetId: "FAN-012",
    when: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5h ago
    severity: "critical",
    text: "High vibration at 75% duty",
  },
  {
    id: "al-pmp032-1",
    assetId: "PMP-032",
    when: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    severity: "warning",
    text: "Seal leakage rate above threshold",
  },
];
