// src/data/alarms.ts
// COMPLETE FILE — drop-in replacement

import type { AlertItem } from "../types";

const KEY = "pm_alarms_v1";

function isAlert(x: any): x is AlertItem {
  return x && typeof x.id === "string" && typeof x.assetId === "string" && typeof x.when === "string"
    && (x.severity === "warning" || x.severity === "critical") && typeof x.text === "string";
}

export function loadAlarms(): AlertItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAlert);
  } catch {
    return [];
  }
}

export function saveAlarms(list: AlertItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

// Simple in-memory defaults if you ever want to seed; currently empty to avoid duplication with data/assets.ts
export const defaultAlarms: AlertItem[] = [];

// Convenience wrapper if you prefer an object API
export const alarmsDb = {
  load: loadAlarms,
  save: saveAlarms,
};
