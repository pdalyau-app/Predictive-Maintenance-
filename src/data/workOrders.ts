// src/data/workOrders.ts
import { WorkOrder } from "../types-extra";

const KEY = "pm_workorders_v1";

function read(): WorkOrder[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WorkOrder[]) : seed();
  } catch {
    return seed();
  }
}

function write(list: WorkOrder[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

function seed(): WorkOrder[] {
  const demo: WorkOrder[] = [
    {
      id: "WO-1001",
      assetId: "MTR-001",
      summary: "Investigate high vibration",
      description: "Vibration exceeded 7 mm/s for 15m. Inspect bearings.",
      priority: 2,
      status: "open",
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      createdBy: "system",
      evidence: { alertId: "AL-9001" },
    },
    {
      id: "WO-1002",
      assetId: "PMP-014",
      summary: "ΔT trending high",
      description: "Check cooling water flow and fan operation.",
      priority: 3,
      status: "in_progress",
      createdAt: new Date(Date.now() - 56 * 60 * 60 * 1000).toISOString(),
      createdBy: "paul",
    },
    {
      id: "WO-1003",
      assetId: "FAN-003",
      summary: "Replace belt",
      priority: 4,
      status: "done",
      createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
      createdBy: "alex",
    },
  ];
  write(demo);
  return demo;
}

let state = read();

export function getWorkOrders(): WorkOrder[] {
  return [...state].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addWorkOrder(wo: Omit<WorkOrder, "id" | "createdAt">) {
  const id = `WO-${Math.floor(1000 + Math.random() * 9000)}`;
  const createdAt = new Date().toISOString();
  state = [{ id, createdAt, ...wo }, ...state];
  write(state);
}

export function updateWorkOrderStatus(id: string, status: WorkOrder["status"]) {
  state = state.map((w) => (w.id === id ? { ...w, status } : w));
  write(state);
}

// For KPI convenience (array-like)
export const workOrders = new Proxy([] as WorkOrder[], {
  get(_t, prop) {
    if (prop === "length") return state.length;
    if (prop === Symbol.iterator) return state[Symbol.iterator].bind(state);
    // @ts-ignore index access
    return state[prop];
  },
}) as unknown as WorkOrder[];
