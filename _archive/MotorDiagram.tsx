// src/components/MotorDiagram.tsx
import React from "react";
import type { Asset } from "../types";

/**
 * Data-driven equipment diagram:
 * - Auto-picks a template (motor/pump/fan) from the asset name
 * - Numbered callouts + legend built from config
 * - Safe with missing values (shows "—")
 * - All styles are scoped inside; no extra CSS needed
 */
type ValueSpec = {
  path: string;   // e.g. "sensors.bearingTemp" or "vibrationRms"
  unit?: string;  // "°C", " A", etc.
  digits?: number;
  label?: string;
};

type Callout = {
  n: number;
  x: number;
  y: number;
  color: string;
  title: string;
  desc: string;
  values?: ValueSpec[];
};

type DiagramTemplate = {
  key: "motor" | "pump" | "fan";
  viewBox: string;
  base: React.FC;        // <- fixed: no JSX.Element typing
  callouts: Callout[];
};

// helpers
const getByPath = (obj: any, path: string) => {
  try { return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj); }
  catch { return undefined; }
};

const fmtVal = (raw: unknown, unit = "", digits = 1) =>
  typeof raw === "number" && Number.isFinite(raw) ? `${raw.toFixed(digits)}${unit}` : "—";

const pickTemplate = (name?: string): DiagramTemplate["key"] => {
  const s = (name ?? "").toLowerCase();
  if (s.includes("pump")) return "pump";
  if (s.includes("fan")) return "fan";
  return "motor";
};

// ----- templates -----
const MotorBase: React.FC = () => (
  <>
    <rect x="70" y="60" width="200" height="80" rx="12" fill="#e5e7eb" stroke="#94a3b8" />
    <rect x="60" y="70" width="18" height="60" rx="6" fill="#e2e8f0" stroke="#94a3b8" />
    <rect x="270" y="70" width="18" height="60" rx="6" fill="#e2e8f0" stroke="#94a3b8" />
    <rect x="288" y="96" width="40" height="8" rx="3" fill="#cbd5e1" />
    <circle cx="330" cy="100" r="12" fill="#cbd5e1" stroke="#94a3b8" />
    <line x1="330" y1="88" x2="330" y2="112" stroke="#94a3b8" />
    <line x1="318" y1="100" x2="342" y2="100" stroke="#94a3b8" />
    <line x1="30" y1="100" x2="60" y2="100" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
    <circle cx="52" cy="100" r="10" fill="none" stroke="#64748b" strokeWidth="3" />
    <line x1="342" y1="100" x2="430" y2="100" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
    <polygon points="418,95 430,100 418,105" fill="#64748b" />
  </>
);

const MOTOR_TEMPLATE: DiagramTemplate = {
  key: "motor",
  viewBox: "0 0 460 200",
  base: MotorBase,
  callouts: [
    {
      n: 1, x: 279, y: 100, color: "#22c55e",
      title: "Bearing housing (vibration + temperature)",
      desc: "Accelerometer (vibration), RTD/thermistor (temperature)",
      values: [
        { path: "sensors.bearingTemp", unit: "°C", digits: 1, label: "Temp" },
        { path: "vibrationRms", unit: " mm/s", digits: 1, label: "Vibe" },
      ],
    },
    {
      n: 2, x: 170, y: 100, color: "#0ea5e9",
      title: "Motor body (surface temperature)",
      desc: "Surface temperature for thermal trend",
      values: [{ path: "sensors.bodyTemp", unit: "°C", digits: 1, label: "Temp" }],
    },
    {
      n: 3, x: 52, y: 100, color: "#6366f1",
      title: "Phase cables (current/amps)",
      desc: "Clamp-on current transformer",
      values: [{ path: "sensors.currentAmps", unit: " A", digits: 1, label: "Amps" }],
    },
    {
      n: 4, x: 405, y: 100, color: "#f59e0b",
      title: "Process line (flowrate)",
      desc: "Inline / strap-on flowmeter",
      values: [{ path: "sensors.flowRate", unit: " u", digits: 1, label: "Flow" }],
    },
  ],
};

const PumpBase: React.FC = () => (
  <>
    <rect x="90" y="70" width="160" height="60" rx="10" fill="#e5e7eb" stroke="#94a3b8" />
    <circle cx="80" cy="100" r="12" fill="#e2e8f0" stroke="#94a3b8" />
    <circle cx="260" cy="100" r="12" fill="#e2e8f0" stroke="#94a3b8" />
    <rect x="30" y="70" width="40" height="60" rx="6" fill="#cbd5e1" stroke="#94a3b8" />
    <line x1="12" y1="100" x2="30" y2="100" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
    <line x1="272" y1="100" x2="430" y2="100" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
    <polygon points="418,95 430,100 418,105" fill="#64748b" />
  </>
);

const PUMP_TEMPLATE: DiagramTemplate = {
  key: "pump",
  viewBox: "0 0 460 200",
  base: PumpBase,
  callouts: [
    {
      n: 1, x: 100, y: 100, color: "#22c55e",
      title: "Pump bearing (vibration + temperature)",
      desc: "Accelerometer + temperature",
      values: [
        { path: "sensors.bearingTemp", unit: "°C", digits: 1, label: "Temp" },
        { path: "vibrationRms", unit: " mm/s", digits: 1, label: "Vibe" },
      ],
    },
    {
      n: 2, x: 170, y: 100, color: "#0ea5e9",
      title: "Casing temperature",
      desc: "Thermal trend",
      values: [{ path: "sensors.bodyTemp", unit: "°C", digits: 1, label: "Temp" }],
    },
    {
      n: 3, x: 40, y: 100, color: "#6366f1",
      title: "Motor supply (amps)",
      desc: "Clamp-on CT",
      values: [{ path: "sensors.currentAmps", unit: " A", digits: 1, label: "Amps" }],
    },
    {
      n: 4, x: 405, y: 100, color: "#f59e0b",
      title: "Discharge line (flowrate)",
      desc: "Inline flowmeter",
      values: [{ path: "sensors.flowRate", unit: " u", digits: 1, label: "Flow" }],
    },
  ],
};

const FanBase: React.FC = () => (
  <>
    <rect x="40" y="80" width="380" height="40" rx="6" fill="#e5e7eb" stroke="#94a3b8" />
    <circle cx="230" cy="100" r="16" fill="#cbd5e1" stroke="#94a3b8" />
    <line x1="230" y1="84" x2="230" y2="116" stroke="#94a3b8" />
    <line x1="214" y1="100" x2="246" y2="100" stroke="#94a3b8" />
    <rect x="200" y="126" width="60" height="16" rx="4" fill="#e2e8f0" stroke="#94a3b8" />
    <polygon points="402,96 420,100 402,104" fill="#64748b" />
  </>
);

const FAN_TEMPLATE: DiagramTemplate = {
  key: "fan",
  viewBox: "0 0 460 200",
  base: FanBase,
  callouts: [
    {
      n: 1, x: 230, y: 100, color: "#22c55e",
      title: "Fan hub (vibration)",
      desc: "Accelerometer at hub",
      values: [{ path: "vibrationRms", unit: " mm/s", digits: 1, label: "Vibe" }],
    },
    {
      n: 2, x: 230, y: 132, color: "#0ea5e9",
      title: "Motor pack (temperature)",
      desc: "Thermal trend",
      values: [{ path: "sensors.bodyTemp", unit: "°C", digits: 1, label: "Temp" }],
    },
    {
      n: 3, x: 60, y: 100, color: "#6366f1",
      title: "Supply (amps)",
      desc: "Clamp-on CT",
      values: [{ path: "sensors.currentAmps", unit: " A", digits: 1, label: "Amps" }],
    },
    {
      n: 4, x: 410, y: 100, color: "#f59e0b",
      title: "Airflow (proxy)",
      desc: "Duct flow (if available)",
      values: [{ path: "sensors.flowRate", unit: " u", digits: 1, label: "Flow" }],
    },
  ],
};

const TEMPLATES: Record<DiagramTemplate["key"], DiagramTemplate> = {
  motor: MOTOR_TEMPLATE,
  pump: PUMP_TEMPLATE,
  fan: FAN_TEMPLATE,
};

// component
export default function MotorDiagram({
  asset,
  template,
}: {
  asset?: Asset;
  template?: DiagramTemplate["key"];
}) {
  const chosenKey = template ?? pickTemplate(asset?.name ?? asset?.id);
  const tpl = TEMPLATES[chosenKey] ?? TEMPLATES.motor;

  const dt =
    typeof asset?.temperatureC === "number" && typeof asset?.ambientC === "number"
      ? asset.temperatureC - asset.ambientC
      : undefined;

  const Base = tpl.base;

  return (
    <div>
      <style>{`
        .dg-wrap { --ring:#e2e8f0; --ink:#0f172a; --muted:#64748b; }
        .dg-title { font-weight:700; margin-bottom:8px; }
        .dg-legend { display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:8px; }
        .dg-item { background:#fff; border:1px solid var(--ring); border-radius:10px; padding:8px; }
        .dg-item h4 { margin:0 0 2px 0; font-size:14px; font-weight:700; color:var(--ink); }
        .dg-item p { margin:0; font-size:12px; color:var(--muted); }
        .dg-val { font-weight:800; margin-left:auto; white-space:nowrap; }
        .dg-k { display:inline-grid; place-items:center; width:18px; height:18px; border-radius:999px; color:#fff; font-weight:800; font-size:11px; margin-right:6px; }
        @keyframes dgPulse { 0%{transform:scale(1);opacity:1} 50%{transform:scale(1.35);opacity:.75} 100%{transform:scale(1);opacity:1} }
        .dg-dot { transform-origin:center; animation: dgPulse 1.6s ease-in-out infinite; }
        .dg-num { font:600 9px/1 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; fill:#ffffff; }
      `}</style>

      <div className="dg-wrap">
        <div className="dg-title">Measurement points ({tpl.key})</div>

        <svg viewBox={tpl.viewBox} width="100%" height="200" role="img" aria-label={`${tpl.key} measurement points`}>
          <Base />
          {tpl.callouts.map(co => (
            <g key={co.n}>
              <circle cx={co.x} cy={co.y} r="7" fill={co.color} className="dg-dot">
                <title>{`${co.n} — ${co.title}`}</title>
              </circle>
              <text x={co.x} y={co.y + 3} textAnchor="middle" className="dg-num">{co.n}</text>
            </g>
          ))}
        </svg>

        <div className="dg-legend">
          {tpl.callouts.map(co => {
            const valueText = (co.values ?? [])
              .map(v => {
                const raw = getByPath(asset, v.path);
                const label = v.label ? `${v.label}: ` : "";
                return `${label}${fmtVal(raw, v.unit, v.digits ?? 1)}`;
              })
              .filter(Boolean)
              .join(" • ");

            return (
              <div className="dg-item" key={`lg-${co.n}`}>
                <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center" }}>
                    <span className="dg-k" style={{ background: co.color }}>{co.n}</span>
                    <div>
                      <h4>{co.title}</h4>
                      <p>{co.desc}</p>
                    </div>
                  </div>
                  {valueText && <div className="dg-val">{valueText}</div>}
                </div>
              </div>
            );
          })}

          {typeof dt === "number" && (
            <div className="dg-item">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <h4>ΔT vs ambient</h4>
                  <p>Temperature rise (asset − ambient)</p>
                </div>
                <div className="dg-val">{fmtVal(dt, " °C", 0)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
