import React, { useEffect, useMemo, useState } from "react";
import type { Asset } from "../types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

/** Series keys */
type Key = "amps" | "vib" | "bearing" | "flow";

/** Consistent colors/labels/units */
const COLORS: Record<Key, string> = {
  amps:    "#0ea5e9", // blue
  vib:     "#ef4444", // red
  bearing: "#f59e0b", // amber
  flow:    "#10b981", // green
};
const LABEL: Record<Key, string> = {
  amps: "Current (A)",
  vib: "Vibration (mm/s)",
  bearing: "Bearing Temp (°C)",
  flow: "Flow",
};

type Row = { t: string; amps?: number; vib?: number; bearing?: number; flow?: number };
const toIso = (d: Date | string | number) => new Date(d).toISOString();
const isNum = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);
const wiggle = (base: number, i: number, mag = 0.05) =>
  +(
    base *
    (1 + Math.sin(i / 5) * mag + Math.cos(i / 7) * (mag * 0.6))
  ).toFixed(2);

const pickKind = (name?: string) => {
  const s = (name ?? "").toLowerCase();
  if (s.includes("pump")) return "pump" as const;
  if (s.includes("fan")) return "fan" as const;
  return "motor" as const;
};

/** Build rows from trend if present */
function fromTrend(asset: Asset): Row[] | null {
  const tr: any[] | undefined = (asset as any).trend;
  if (!Array.isArray(tr) || tr.length === 0) return null;

  // per-metric trend shape
  if (
    tr[0] &&
    (tr[0].vibrationRms !== undefined ||
      tr[0].currentAmps !== undefined ||
      tr[0].bearingTemp !== undefined ||
      tr[0].temperatureC !== undefined ||
      tr[0].flowRate !== undefined)
  ) {
    return tr.map((p: any) => ({
      t: toIso(p.t),
      vib: isNum(p.vibrationRms) ? p.vibrationRms : undefined,
      amps: isNum(p.currentAmps) ? p.currentAmps : undefined,
      bearing: isNum(p.bearingTemp)
        ? p.bearingTemp
        : isNum(p.temperatureC)
        ? p.temperatureC
        : undefined,
      flow: isNum(p.flowRate) ? p.flowRate : undefined,
    }));
  }

  // generic trend -> treat as vibration, synth others from snapshot
  const s = (asset as any).sensors ?? {};
  return tr.map((p: any, i: number) => ({
    t: toIso(p.t),
    vib: isNum(p.value) ? p.value : undefined,
    amps: isNum(s.currentAmps) ? wiggle(s.currentAmps, i) : undefined,
    bearing: isNum(s.bearingTemp)
      ? wiggle(s.bearingTemp, i, 0.02)
      : isNum((asset as any).temperatureC)
      ? wiggle((asset as any).temperatureC, i, 0.02)
      : undefined,
    flow: isNum(s.flowRate) ? wiggle(s.flowRate, i) : undefined,
  }));
}

/** Synthesize small history from current snapshot */
function fromSnapshot(asset: Asset, points = 36): Row[] {
  const s = (asset as any).sensors ?? {};
  const vib0 = isNum((asset as any).vibrationRms) ? (asset as any).vibrationRms : undefined;
  const amps0 = isNum(s.currentAmps) ? s.currentAmps : undefined;
  const bearing0 = isNum(s.bearingTemp)
    ? s.bearingTemp
    : isNum((asset as any).temperatureC)
    ? (asset as any).temperatureC
    : undefined;
  const flow0 = isNum(s.flowRate) ? s.flowRate : undefined;

  const out: Row[] = [];
  const now = Date.now();
  const step = 60_000;
  for (let i = points - 1; i >= 0; i--) {
    out.push({
      t: toIso(now - i * step),
      vib: vib0 !== undefined ? wiggle(vib0, i) : undefined,
      amps: amps0 !== undefined ? wiggle(amps0, i) : undefined,
      bearing: bearing0 !== undefined ? wiggle(bearing0, i, 0.02) : undefined,
      flow: flow0 !== undefined ? wiggle(flow0, i) : undefined,
    });
  }
  return out;
}

/** Defaults: which series start ON for each kind */
function defaultOn(kind: "pump" | "motor" | "fan"): Key[] {
  if (kind === "pump") return ["amps", "vib", "bearing", "flow"];
  // motor/fan default to these, but extras (e.g. flow) will still appear if present
  return ["amps", "bearing", "vib"];
}

const niceTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function AssetTrendChart({ asset }: { asset: Asset }) {
  const kind = pickKind(asset?.name ?? asset?.id);

  // Build rows
  const rows = useMemo(() => fromTrend(asset) ?? fromSnapshot(asset), [asset]);

  // Determine available series (has at least one numeric value)
  const available = useMemo<Key[]>(() => {
    const keys: Key[] = ["amps", "vib", "bearing", "flow"];
    return keys.filter((k) => rows.some((r) => isNum((r as any)[k])));
  }, [rows]);

  // Visibility state: by default, turn on the kind defaults; if other series have data, also turn them on
  const [visible, setVisible] = useState<Record<Key, boolean>>({
    amps: false, vib: false, bearing: false, flow: false,
  });
  useEffect(() => {
    const baseOn = new Set<Key>(defaultOn(kind));
    const next: Record<Key, boolean> = { amps: false, vib: false, bearing: false, flow: false };
    (["amps", "vib", "bearing", "flow"] as Key[]).forEach((k) => {
      next[k] = available.includes(k) && (baseOn.has(k) || true); // show all available by default
    });
    setVisible(next);
  }, [kind, available]);

  if (available.length === 0) {
    return <div style={{ padding: 12, color: "#64748b" }}>No trend data available.</div>;
  }

  const toggle = (k: Key) => setVisible((v) => ({ ...v, [k]: !v[k] }));
  const yAxisFor = (k: Key) => (k === "bearing" ? "left" : "right");

  return (
    <div>
      <style>{`
        .series-chip {
          display:inline-flex; align-items:center; gap:8px;
          border:1px solid #e2e8f0; border-radius:999px; padding:6px 10px;
          cursor:pointer; user-select:none; font-size:12px; margin:0 8px 8px 0;
          background:#fff; color:#0f172a;
        }
        .series-chip.off { opacity:.45; }
        .swatch { width:12px; height:12px; border-radius:3px; }
      `}</style>

      {/* Legend chips – now shows ALL available metrics (not filtered by type) */}
      <div style={{ marginBottom: 8 }}>
        {(["amps", "vib", "bearing", "flow"] as Key[]).map((k) =>
          available.includes(k) ? (
            <button
              key={k}
              className={`series-chip ${visible[k] ? "" : "off"}`}
              onClick={() => toggle(k)}
              title={`Toggle ${LABEL[k]}`}
            >
              <span className="swatch" style={{ background: COLORS[k] }} />
              {LABEL[k]}
            </button>
          ) : null
        )}
      </div>

      <div style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="t" minTickGap={30} tickFormatter={niceTime} />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              labelFormatter={(iso) => new Date(iso).toLocaleString()}
              formatter={(value: any, name: any) => {
                const key = name as Key;
                return [value, LABEL[key] ?? key];
              }}
            />

            {available.map((k) =>
              visible[k] ? (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  name={k as any}
                  yAxisId={yAxisFor(k)}
                  dot={false}
                  strokeWidth={2}
                  stroke={COLORS[k]}
                  isAnimationActive={false}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
