// src/components/MotorDiagram.tsx
import React from "react";
import type { Asset } from "../types";

/**
 * Presentation-focused diagram that shows *where* measurements come from.
 * - Numbered callouts on the SVG
 * - Matching legend with brief explanations and live values (if available)
 * - Self-contained styles (no external CSS needed)
 */
export default function MotorDiagram({ asset }: { asset?: Asset }) {
  const s = asset?.sensors ?? {};

  const fmt = (n?: number, unit = "", digits = 1) =>
    typeof n === "number" ? `${n.toFixed(digits)}${unit}` : "—";

  const bearingTemp = fmt(s.bearingTemp, "°C");
  const bodyTemp = fmt(s.bodyTemp, "°C");
  const amps = fmt(s.currentAmps, " A", 1);
  const flow = fmt(s.flowRate, " u", 1);
  const vib =
    typeof asset?.vibrationRms === "number" ? `${asset.vibrationRms.toFixed(1)} mm/s` : "—";

  return (
    <div>
      {/* Scoped styles so you don't have to add anything to styles.css */}
      <style>{`
        .mdg-wrap { --ring:#e2e8f0; --ink:#0f172a; --muted:#64748b; }
        .mdg-title { font-weight: 700; margin-bottom: 8px; }
        .mdg-legend { display:grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
        .mdg-item { background:#fff; border:1px solid var(--ring); border-radius:10px; padding:8px; }
        .mdg-item h4 { margin:0 0 2px 0; font-size:14px; font-weight:700; color:var(--ink); }
        .mdg-item p { margin:0; font-size:12px; color:var(--muted); }
        .mdg-value { font-weight:800; margin-left:auto; }
        .mdg-k { display:inline-grid; place-items:center; width:18px; height:18px; border-radius:999px; color:#fff; font-weight:800; font-size:11px; margin-right:6px; }
        @keyframes mdgPulse { 0%{transform:scale(1);opacity:1} 50%{transform:scale(1.35);opacity:.75} 100%{transform:scale(1);opacity:1} }
        .mdg-dot { transform-origin:center; animation: mdgPulse 1.6s ease-in-out infinite; }
        .mdg-num { font:600 9px/1 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; fill:#ffffff; }
      `}</style>

      <div className="mdg-wrap">
        <div className="mdg-title">Measurement points</div>

        {/* Motor block diagram */}
        <svg
          viewBox="0 0 460 200"
          width="100%"
          height="200"
          role="img"
          aria-label="Motor measurement points"
        >
          {/* Motor body */}
          <rect x="70" y="60" width="200" height="80" rx="12" fill="#e5e7eb" stroke="#94a3b8" />
          {/* End bells (bearing housings) */}
          <rect x="60" y="70" width="18" height="60" rx="6" fill="#e2e8f0" stroke="#94a3b8" />
          <rect x="270" y="70" width="18" height="60" rx="6" fill="#e2e8f0" stroke="#94a3b8" />
          {/* Shaft / coupling */}
          <rect x="288" y="96" width="40" height="8" rx="3" fill="#cbd5e1" />
          {/* Fan (static cross, we keep it simple & light) */}
          <circle cx="330" cy="100" r="12" fill="#cbd5e1" stroke="#94a3b8" />
          <line x1="330" y1="88" x2="330" y2="112" stroke="#94a3b8" />
          <line x1="318" y1="100" x2="342" y2="100" stroke="#94a3b8" />

          {/* Supply cable + clamp CT (left) */}
          <line x1="30" y1="100" x2="60" y2="100" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
          <circle cx="52" cy="100" r="10" fill="none" stroke="#64748b" strokeWidth="3" />

          {/* Process pipe + flow arrow (right) */}
          <line x1="342" y1="100" x2="430" y2="100" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
          <polygon points="418,95 430,100 418,105" fill="#64748b" />

          {/* Callouts 1..4 (numbered dots that pulse) */}
          <Callout x={279} y={100} n={1} color="#22c55e" title="1 — Bearing housing (vibration + temperature)" />
          <Callout x={170} y={100} n={2} color="#0ea5e9" title="2 — Motor body (surface temperature)" />
          <Callout x={52}  y={100} n={3} color="#6366f1" title="3 — Phase cables (current/amps)" />
          <Callout x={405} y={100} n={4} color="#f59e0b" title="4 — Process line (flowrate)" />
        </svg>

        {/* Legend with live values (if available) */}
        <div className="mdg-legend">
          <LegendItem
            n={1}
            color="#22c55e"
            title="Bearing housing"
            desc="Accelerometer (vibration) + RTD/thermistor (temperature)"
            value={`${bearingTemp}${vib !== "—" ? ` • ${vib}` : ""}`}
          />
          <LegendItem
            n={2}
            color="#0ea5e9"
            title="Motor body"
            desc="Surface temperature (thermal trend)"
            value={bodyTemp}
          />
          <LegendItem
            n={3}
            color="#6366f1"
            title="Cables"
            desc="Clamp-on current transformer (amps)"
            value={amps}
          />
          <LegendItem
            n={4}
            color="#f59e0b"
            title="Flowmeter"
            desc="Inline/strap-on meter (process flow)"
            value={flow}
          />
        </div>
      </div>
    </div>
  );
}

/** Pulsing, numbered dot on the SVG, with a title tooltip */
function Callout({
  x, y, n, color, title,
}: { x: number; y: number; n: number; color: string; title: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="7" fill={color} className="mdg-dot">
        <title>{title}</title>
      </circle>
      <text x={x} y={y + 3} textAnchor="middle" className="mdg-num">
        {n}
      </text>
    </g>
  );
}

/** Legend row: colored number, label + description, and current value */
function LegendItem({
  n, color, title, desc, value,
}: { n: number; color: string; title: string; desc: string; value?: string }) {
  return (
    <div className="mdg-item" style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span className="mdg-k" style={{ background: color }}>{n}</span>
      <div style={{ minWidth: 0 }}>
        <h4>{title}</h4>
        <p title={desc}>{desc}</p>
      </div>
      {value && <div className="mdg-value">{value}</div>}
    </div>
  );
}
