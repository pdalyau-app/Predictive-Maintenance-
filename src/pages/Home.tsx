// src/pages/Home.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets, alerts } from "../data/assets";
import { recommendations } from "../data/recommendations";
import { workOrders } from "../data/workOrders";
import type { Asset, AssetType, Health } from "../types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const chip: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #e2e8f0",
  background: "#fff",
  fontSize: 12,
  cursor: "pointer",
};

function StatusBadge({ status }: { status: Health }) {
  const map: Record<Health, { bg: string; br: string; fg: string }> = {
    Healthy: { bg: "#ecfdf3", br: "#c7f9d6", fg: "#027a48" },
    Warning: { bg: "#fffaeb", br: "#fde68a", fg: "#b54708" },
    Critical: { bg: "#fef3f2", br: "#fecaca", fg: "#b42318" },
  };
  const s = map[status];
  return (
    <span
      style={{
        background: s.bg,
        border: `1px solid ${s.br}`,
        color: s.fg,
        padding: "4px 10px",
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 12,
      }}
    >
      {status}
    </span>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div style={{ color: "#64748b", fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 22 }}>{value}</div>
    </div>
  );
}

// map range -> milliseconds
const rangeToMs = (r: "1h" | "24h" | "7d" | "30d") =>
  r === "1h"
    ? 1 * 60 * 60 * 1000
    : r === "24h"
    ? 24 * 60 * 60 * 1000
    : r === "7d"
    ? 7 * 24 * 60 * 60 * 1000
    : 30 * 24 * 60 * 60 * 1000;

export default function Home() {
  const nav = useNavigate();

  // header state (search + dropdown)
  const [q, setQ] = useState("");
  const [showAssetsMenu, setShowAssetsMenu] = useState(false);

  // range pills (drives Recent Alerts)
  const [range, setRange] = useState<"1h" | "24h" | "7d" | "30d">("24h");

  // filters
  const [typeFilter, setTypeFilter] = useState<AssetType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Health | "all">("all");

  // modals
  const [insightFor, setInsightFor] = useState<Asset | null>(null);
  const [workOrderFor, setWorkOrderFor] = useState<Asset | null>(null);

  // assets filtered
  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchQ = q.trim()
        ? (a.name + " " + a.id + " " + (a.location ?? "")).toLowerCase().includes(q.trim().toLowerCase())
        : true;
      const matchType = typeFilter === "all" || a.type === typeFilter;
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      return matchQ && matchType && matchStatus;
    });
  }, [q, typeFilter, statusFilter]);

  // KPIs
  const kpis = useMemo(
    () => ({
      total: assets.length,
      healthy: assets.filter((a) => a.status === "Healthy").length,
      warning: assets.filter((a) => a.status === "Warning").length,
      critical: assets.filter((a) => a.status === "Critical").length,
      openAlerts: alerts.length,
      openWorkOrders: workOrders.filter((wo) => wo.status !== "done").length,
    }),
    []
  );

  // Recent Alerts filtered by selected range
  const alertsInRange = useMemo(() => {
    const cutoff = Date.now() - rangeToMs(range);
    return alerts
      .filter((a) => new Date(a.when).getTime() >= cutoff)
      .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
  }, [range]);

  // Health donut (computed from assets)
  const pieData = [
    {
      name: "Healthy",
      value: assets.filter((a) => a.status === "Healthy").length,
      color: "#16a34a",
    },
    {
      name: "Warning",
      value: assets.filter((a) => a.status === "Warning").length,
      color: "#f59e0b",
    },
    {
      name: "Critical",
      value: assets.filter((a) => a.status === "Critical").length,
      color: "#dc2626",
    },
  ];

  // Top Risk Assets (simple risk: Critical first, then Warning by lowest health)
  const topRisk = useMemo(() => {
    const severityRank = (s: Health) =>
      s === "Critical" ? 2 : s === "Warning" ? 1 : 0;
    return [...assets]
      .sort(
        (a, b) =>
          severityRank(b.status) - severityRank(a.status) ||
          a.health - b.health
      )
      .slice(0, 3);
  }, []);

  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 16,
  };
  const lastPoint = (a: Asset) => a.trend[a.trend.length - 1];

  return (
    <div style={{ padding: "16px 16px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Sub-header (search + pills) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            justifyContent: "space-between",
            margin: "8px 0 12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <nav
              style={{
                position: "relative",
                display: "flex",
                gap: 12,
                color: "#334155",
              }}
            >
              <span style={{ fontWeight: 700 }}>Dashboard</span>
              <button
                onClick={() => setShowAssetsMenu((s) => !s)}
                style={{
                  background: "none",
                  border: 0,
                  cursor: "pointer",
                  color: "#334155",
                }}
              >
                Assets ▾
              </button>
              {showAssetsMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: 22,
                    left: 62,
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 8,
                    width: 180,
                    boxShadow: "0 8px 24px rgba(15,23,42,.08)",
                    zIndex: 10,
                  }}
                  onMouseLeave={() => setShowAssetsMenu(false)}
                >
                  {[
                    { label: "All assets", type: "all" as const },
                    { label: "Motors", type: "motor" as const },
                    { label: "Pumps", type: "pump" as const },
                    { label: "Fans", type: "fan" as const },
                  ].map((opt) => (
                    <div
                      key={opt.label}
                      onClick={() => {
                        setTypeFilter(opt.type);
                        setShowAssetsMenu(false);
                      }}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
              <span style={{ opacity: 0.4 }}>Settings (soon)</span>
            </nav>
          </div>

          <input
            placeholder="Search assets..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "8px 12px",
              width: 280,
              background: "#fff",
            }}
          />
        </div>

        {/* Time range chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {[
            { k: "1h", label: "Last 1h" },
            { k: "24h", label: "Last 24h" },
            { k: "7d", label: "Last 7d" },
            { k: "30d", label: "Last 30d" },
          ].map((r) => (
            <button
              key={r.k}
              onClick={() => setRange(r.k as any)}
              style={{
                ...chip,
                background: range === (r.k as any) ? "#eff6ff" : "#fff",
                borderColor:
                  range === (r.k as any) ? "#bfdbfe" : "#e2e8f0",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* KPI ribbon (6) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0,1fr))",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Kpi label="TOTAL ASSETS" value={kpis.total} />
          <Kpi label="HEALTHY" value={kpis.healthy} />
          <Kpi label="WARNING" value={kpis.warning} />
          <Kpi label="CRITICAL" value={kpis.critical} />
          <Kpi label="OPEN ALERTS" value={kpis.openAlerts} />
          <Kpi label="OPEN WORK ORDERS" value={kpis.openWorkOrders} />
        </div>

        {/* Filters bar */}
        <div style={{ ...card, padding: 10, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#64748b" }}>Type:</span>
            {(["all", "motor", "pump", "fan"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  ...chip,
                  padding: "5px 10px",
                  background: typeFilter === t ? "#f1f5f9" : "#fff",
                }}
              >
                {t === "all" ? "All" : t[0].toUpperCase() + t.slice(1) + "s"}
              </button>
            ))}
            <span style={{ color: "#64748b", marginLeft: 8 }}>
              Status:
            </span>
            {(["all", "Healthy", "Warning", "Critical"] as const).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s as any)}
                  style={{
                    ...chip,
                    padding: "5px 10px",
                    background: statusFilter === s ? "#f1f5f9" : "#fff",
                  }}
                >
                  {s === "all" ? "All" : s}
                </button>
              )
            )}
            <div
              style={{
                marginLeft: "auto",
                color: "#94a3b8",
                fontSize: 12,
              }}
            >
              {filtered.length} shown
            </div>
          </div>
        </div>

        {/* Main tri-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: 16,
          }}
        >
          {/* Left: Assets list */}
          <div style={{ gridColumn: "span 2" }}>
            <div style={{ ...card }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Assets</div>
              <div style={{ borderTop: "1px solid #f1f5f9" }} />
              {filtered.map((a) => {
                const last = lastPoint(a);
                const isCritical = a.status === "Critical";
                return (
                  <div
                    key={a.id}
                    style={{
                      padding: "12px 4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 999,
                          background: "#f1f5f9",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 800,
                          color: "#0f172a",
                        }}
                      >
                        {a.health}%
                      </div>
                      <div>
                        <Link
                          to={`/assets/${encodeURIComponent(a.id)}`}
                          style={{
                            fontWeight: 700,
                            color: "#0f172a",
                            textDecoration: "none",
                          }}
                        >
                          {a.name}
                        </Link>
                        <div style={{ color: "#64748b", fontSize: 12 }}>
                          {a.id} • {a.location ?? "—"}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>
                          ΔT {(last?.deltaT ?? 0).toFixed(1)} °C • Vib{" "}
                          {(last?.vibration ?? 0).toFixed(2)} mm/s •{" "}
                          {(last?.current ?? 0).toFixed(2)} A
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <StatusBadge status={a.status} />
                      {isCritical && (
                        <button
                          onClick={() => setInsightFor(a)}
                          style={{
                            width: 34,
                            height: 30,
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            cursor: "pointer",
                          }}
                          title="Insights"
                          aria-label={`Insights for ${a.id}`}
                        >
                          🔧
                        </button>
                      )}
                      <button
                        style={{
                          padding: "8px 12px",
                          borderRadius: 10,
                          border: "1px solid #bfdbfe",
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          fontWeight: 700,
                        }}
                        onClick={() => setWorkOrderFor(a)}
                      >
                        Take action
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Middle-right: Operational Feed */}
          <div style={{ ...card }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div style={{ fontWeight: 700 }}>Operational Feed</div>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>
                {range === "1h"
                  ? "Last 1h"
                  : range === "24h"
                  ? "Last 24h"
                  : range === "7d"
                  ? "Last 7d"
                  : "Last 30d"}
              </div>
            </div>

            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              Recent Alerts
            </div>
            <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
              {alertsInRange.length === 0 && (
                <div style={{ color: "#94a3b8", fontSize: 13 }}>
                  No alerts in this range.
                </div>
              )}
              {alertsInRange.map((al) => {
                const isCritical = al.severity === "critical";
                return (
                  <div
                    key={al.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{ color: isCritical ? "#dc2626" : "#f59e0b" }}
                    >
                      ●
                    </span>
                    <span style={{ color: "#64748b" }}>
                      {new Date(al.when).toLocaleString()}
                    </span>
                    <b style={{ color: "#0f172a" }}>{al.assetId}</b>
                    <span style={{ color: "#334155" }}>— {al.text}</span>
                    {isCritical && (
                      <button
                        onClick={() => {
                          const a = assets.find((x) => x.id === al.assetId);
                          if (a) setInsightFor(a);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 16,
                          marginLeft: 6,
                        }}
                        title="Insights"
                        aria-label={`Insights for ${al.assetId}`}
                      >
                        🔧
                      </button>
                    )}
                    <Link
                      to={`/assets/${al.assetId}`}
                      style={{ marginLeft: "auto", fontSize: 12 }}
                    >
                      View
                    </Link>
                  </div>
                );
              })}
            </div>

            <div style={{ fontWeight: 700, marginBottom: 6, marginTop: 6 }}>
              Upcoming Maintenance
            </div>
            <div
              style={{
                color: "#334155",
                fontSize: 13,
                display: "grid",
                gap: 4,
              }}
            >
              <div>
                <b>MTR-001</b> — Service due in 3 days (runtime: 312 h)
              </div>
              <div>
                <b>PMP-014</b> — Lube &amp; inspect due in 6 days
              </div>
              <div>
                <b>FAN-003</b> — Belt check due in 10 days
              </div>
            </div>
          </div>

          {/* Right: Health Summary donut + legend + drivers */}
          <div style={{ ...card }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              Health Summary
            </div>
            <div style={{ width: "100%", height: 190 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 6,
                marginTop: 6,
              }}
            >
              {pieData.map((d) => (
                <div
                  key={d.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: d.color,
                    }}
                  />
                  <span style={{ flex: 1 }}>{d.name}</span>
                  <b>{d.value}</b>
                </div>
              ))}
            </div>
            <div style={{ fontWeight: 700, marginTop: 10, marginBottom: 6 }}>
              Top Drivers
            </div>
            <div
              style={{
                color: "#334155",
                fontSize: 13,
                display: "grid",
                gap: 4,
              }}
            >
              <div>Vibration spikes (weighted 40%)</div>
              <div>ΔT vs Ambient (30%)</div>
              <div>Current imbalance (20%)</div>
              <div>Alert frequency (10%)</div>
            </div>
          </div>
        </div>

        {/* Top Risk row */}
        <div style={{ marginTop: 16, ...card }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Top Risk Assets</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0,1fr))",
              gap: 12,
            }}
          >
            {topRisk.map((a) => (
              <div
                key={a.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: 14,
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{a.name}</div>
                  <StatusBadge status={a.status} />
                </div>
                <div style={{ color: "#64748b", fontSize: 12 }}>
                  {a.id} • {a.location ?? "—"}
                </div>
                <div style={{ color: "#334155", fontSize: 13, marginTop: 6 }}>
                  Alerts last 7d:{" "}
                  {
                    alerts.filter(
                      (al) =>
                        al.assetId === a.id &&
                        Date.now() - new Date(al.when).getTime() <=
                          7 * 24 * 60 * 60 * 1000
                    ).length
                  }
                </div>
                <div style={{ color: "#334155", fontSize: 13 }}>
                  Primary risk: {a.status === "Critical" ? "Vibration" : "Current"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INSIGHTS MODAL */}
      {insightFor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
          }}
          onClick={() => setInsightFor(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #e2e8f0",
              width: 720,
              maxWidth: "96vw",
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 800 }}>
                Insights — {insightFor.name}
              </div>
              <button
                onClick={() => setInsightFor(null)}
                style={{
                  background: "none",
                  border: 0,
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: 16,
                marginTop: 10,
              }}
            >
              {/* circular gauge mimic */}
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 999,
                  border: "12px solid #e5e7eb",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: -12,
                    borderRadius: 999,
                    border: "12px solid #22c55e",
                    borderRightColor: "transparent",
                    borderBottomColor: "transparent",
                    transform: "rotate(220deg)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                  }}
                >
                  {insightFor.health}%
                </div>
              </div>

              <div>
                <div
                  style={{ color: "#64748b", fontSize: 12, marginBottom: 6 }}
                >
                  Similarity to past failures
                </div>
                <div style={{ color: "#334155" }}>
                  No strong match in the library. See suggestions below.
                </div>

                <div style={{ fontWeight: 700, marginTop: 14 }}>
                  Recommended actions
                </div>
                <div style={{ color: "#334155", marginTop: 4 }}>
                  {insightFor.status === "Critical"
                    ? recommendations[insightFor.id]?.fix ??
                      "Investigate high ΔT and vibration. Schedule inspection."
                    : "No urgent actions suggested. Continue monitoring."}
                </div>

                <div style={{ fontWeight: 700, marginTop: 14 }}>Evidence</div>
                <div style={{ color: "#334155", marginTop: 4 }}>
                  Vibration:{" "}
                  <b>{lastPoint(insightFor)?.vibration.toFixed(2)} mm/s</b>
                  <br />
                  ΔT vs ambient:{" "}
                  <b>{lastPoint(insightFor)?.deltaT.toFixed(1)} °C</b>
                  <br />
                  Current: <b>{lastPoint(insightFor)?.current.toFixed(2)} A</b>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => {
                      setInsightFor(null);
                      nav(`/assets/${encodeURIComponent(insightFor.id)}`);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      background: "#fff",
                    }}
                  >
                    View detail
                  </button>
                  <button
                    onClick={() => {
                      setWorkOrderFor(insightFor);
                      setInsightFor(null);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid #60a5fa",
                      background: "#3b82f6",
                      color: "#fff",
                    }}
                  >
                    Create work order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE WORK ORDER MODAL */}
      {workOrderFor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
          }}
          onClick={() => setWorkOrderFor(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #e2e8f0",
              width: 720,
              maxWidth: "96vw",
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 800 }}>
                Create work order — {workOrderFor.name}
              </div>
              <button
                onClick={() => setWorkOrderFor(null)}
                style={{
                  background: "none",
                  border: 0,
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <label>
                <div style={{ color: "#334155", marginBottom: 4 }}>
                  Summary
                </div>
                <input
                  style={{
                    width: "100%",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                  placeholder="Short summary"
                />
              </label>

              <label>
                <div style={{ color: "#334155", marginBottom: 4 }}>
                  Description
                </div>
                <textarea
                  rows={5}
                  style={{
                    width: "100%",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "10px 12px",
                    resize: "vertical",
                  }}
                  placeholder="What needs to be done..."
                />
              </label>

              <label>
                <div style={{ color: "#334155", marginBottom: 4 }}>
                  Priority
                </div>
                <select
                  defaultValue="3"
                  style={{
                    width: "100%",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <option value="1">1 — Urgent</option>
                  <option value="2">2 — High</option>
                  <option value="3">3 — Normal</option>
                  <option value="4">4 — Low</option>
                </select>
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <button
                  onClick={() => setWorkOrderFor(null)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setWorkOrderFor(null)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid #60a5fa",
                    background: "#3b82f6",
                    color: "#fff",
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
