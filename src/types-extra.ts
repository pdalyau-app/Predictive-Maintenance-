// src/types-extra.ts
export type ConnectionKind = "opcua" | "modbus" | "mqtt" | "csv" | "manual";

export type Connection = {
  id: string;
  name: string;
  kind: ConnectionKind;
  config: any;          // endpoint/nodeIds/registers/topic/auth, etc. (kept generic for MVP)
  enabled: boolean;
  createdAt: string;
};

export type AssetInput = {
  id: string;
  label: string;        // e.g., "Motor current"
  metricKey: string;    // "current" | "vibration" | "deltaT" | "bearingTemp" | "flow" | custom
  source: {
    connectionId: string;
    address: string;    // nodeId/register/topic/address
    scale?: { m?: number; b?: number };
    units?: string;
  };
  thresholds?: { warn?: number; crit?: number; deadband?: number };
  debounce?: { requireConsecutive?: number; timeMs?: number };
  sampleMs?: number;
};

export type WorkOrder = {
  id: string;
  assetId: string;
  summary: string;
  description?: string;
  priority: 1 | 2 | 3 | 4;
  status: "open" | "in_progress" | "done" | "cancelled";
  createdAt: string;
  createdBy?: string;
  evidence?: { alertId?: string; metricSnapshot?: Record<string, number> };
};
