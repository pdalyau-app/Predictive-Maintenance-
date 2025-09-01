export interface Recommendation {
  fix: string;
  similarCase: string;
  outcome: string;
}

export const recommendations: Record<string, Recommendation> = {
  "MTR-001": {
    fix: "Replace bearings, re-tension belt, refresh thermal paste",
    similarCase: "Motor MTR-009 (Nov 2024)",
    outcome: "Bearing replacement reduced ΔT to nominal within 24h",
  },
  "PMP-014": {
    fix: "Inspect seal, balance impeller, lubricate bearings",
    similarCase: "Pump PMP-011 (Jan 2025)",
    outcome: "Seal replacement eliminated vibration spikes",
  },
  "FAN-003": {
    fix: "Replace fan belt, grease bearings, verify alignment",
    similarCase: "Fan FAN-007 (Sep 2024)",
    outcome: "Belt replacement resolved current spikes",
  },
};
