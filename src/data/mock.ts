// src/data/mock.ts
import { Asset } from "../types";

export const assets: Asset[] = [
  {
    id: "1",
    name: "Conveyor Motor A",
    type: "motor",
    location: "Line 1",
    health: 92,
    status: "Healthy",
    lastServiced: "2025-05-15",
    runtimeHours: 140,
    serviceNotes: "Replaced bearings, lubed couplings",
    trend: [],
  },
  {
    id: "2",
    name: "Process Pump 1",
    type: "pump",
    location: "Tank Farm",
    health: 61,
    status: "Warning",
    lastServiced: "2025-03-09",
    runtimeHours: 380,
    serviceNotes: "Seal inspection; minor vibration noted",
    trend: [],
  },
  {
    id: "3",
    name: "Cooling Fan F3",
    type: "fan",
    location: "Compressor Room",
    health: 28,
    status: "Critical",
    lastServiced: "2025-02-21",
    runtimeHours: 520,
    serviceNotes: "High bearing temperature; schedule replacement",
    trend: [],
  },
];
