// src/types.ts
// COMPLETE FILE — drop-in replacement

export type Health = "Healthy" | "Warning" | "Critical";
export type AssetType = "motor" | "pump" | "fan";

export type TrendPoint = {
  t: string;           // ISO timestamp
  // fields used by Home/AssetDetail summary cards:
  deltaT: number;      // °C above ambient
  vibration: number;   // mm/s
  current: number;     // A

  // optional mirrors used by AssetTrendChart for richer metrics:
  bearingTemp?: number;   // °C (ambient + deltaT)
  vibrationRms?: number;  // mm/s
  currentAmps?: number;   // A
  flowRate?: number;      // m³/h (pumps)
};

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  location?: string;
  status: Health;
  health: number;           // 0–100
  lastServiced?: string;    // ISO (optional)
  runtimeHours?: number;    // optional
  serviceNotes?: string;    // optional
  trend: TrendPoint[];      // time series
}

export type Alert = {
  id: string;
  assetId: string;
  when: string;                 // ISO
  severity: "warning" | "critical";
  text: string;
};

// Some modules expect AlertItem — provide an alias so imports work.
export type AlertItem = Alert;
