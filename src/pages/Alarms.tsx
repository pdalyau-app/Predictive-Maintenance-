// src/pages/Alarms.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { alerts } from "../data/assets";

const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 16 };
const ranges = [
  { k: "24h", ms: 24 * 60 * 60 * 1000, label: "Last 24h" },
  { k: "7d",  ms: 7 * 24 * 60 * 60 * 1000,  label: "Last 7d" },
  { k: "30d", ms: 30 * 24 * 60 * 60 * 1000, label: "Last 30d" },
  { k: "all", ms: Infinity,                 label: "All time" },
] as const;

export default function Alarms() {
  const [severity, setSeverity] = useState<"all" | "warning" | "critical">("all");
  const [range, setRange] = useState<(typeof ranges)[number]["k"]>("7d");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const cutoff = range === "all" ? -Infinity : Date.now() - ranges.find(r => r.k === range)!.ms;
    return alerts
      .filter(a => new Date(a.when).getTime() >= cutoff)
      .filter(a => (severity === "all" ? true : a.severity === severity))
      .filter(a => (q.trim() ? (a.assetId + " " + a.text).toLowerCase().includes(q.trim().toLowerCase()) : true))
      .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
  }, [severity, range, q]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Alarms</h2>

      <div style={card}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#64748b" }}>Severity:</span>
          {(["all", "warning", "critical"] as const).map(s => (
            <button key={s} onClick={() => setSeverity(s)} style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid #e2e8f0", background: severity === s ? "#f1f5f9" : "#fff" }}>
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
          <span style={{ color: "#64748b", marginLeft: 8 }}>Range:</span>
          {ranges.map(r => (
            <button key={r.k} onClick={() => setRange(r.k)} style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid #e2e8f0", background: range === r.k ? "#f1f5f9" : "#fff" }}>
              {r.label}
            </button>
          ))}
          <input placeholder="Search text or asset..." value={q} onChange={e => setQ(e.target.value)} style={{ marginLeft: "auto", border: "1px solid #e2e8f0", borderRadius: 12, padding: "8px 12px" }} />
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "grid", gap: 8 }}>
          {list.length === 0 && <div style={{ color: "#94a3b8" }}>No alarms.</div>}
          {list.map(al => {
            const isCritical = al.severity === "critical";
            return (
              <div key={al.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid #f1f5f9" }}>
                <span style={{ color: isCritical ? "#dc2626" : "#f59e0b" }}>●</span>
                <span style={{ color: "#64748b" }}>{new Date(al.when).toLocaleString()}</span>
                <b style={{ color: "#0f172a" }}>{al.assetId}</b>
                <span style={{ color: "#334155" }}>— {al.text}</span>
                <Link to={`/assets/${al.assetId}`} style={{ marginLeft: "auto", fontSize: 12 }}>View asset</Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
