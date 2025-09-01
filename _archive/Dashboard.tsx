import React, { useMemo } from "react";
import type { Asset, HealthStatus } from "../types";
import { assets as seedAssets } from "../data/mock";

function getHealth(a: Asset): HealthStatus {
  if (a.health) return a.health;
  if (a.status) return a.status.toLowerCase() as HealthStatus;
  return "healthy";
}

export default function Dashboard() {
  const assets = seedAssets;

  const summary = useMemo(() => {
    const healthy = assets.filter(a => getHealth(a) === "healthy").length;
    const warning = assets.filter(a => getHealth(a) === "warning").length;
    const critical = assets.filter(a => getHealth(a) === "critical").length;
    return { healthy, warning, critical, total: assets.length };
  }, [assets]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Dashboard</h2>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <KPI title="Total" value={summary.total} />
        <KPI title="Healthy" value={summary.healthy} />
        <KPI title="Warning" value={summary.warning} />
        <KPI title="Critical" value={summary.critical} />
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Asset Telemetry</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: 8 }}>Asset</th>
                <th style={{ padding: 8, textAlign: "right" }}>Ambient (°C)</th>
                <th style={{ padding: 8, textAlign: "right" }}>Temp (°C)</th>
                <th style={{ padding: 8, textAlign: "right" }}>ΔT (°C)</th>
                <th style={{ padding: 8, textAlign: "right" }}>Vibration (RMS)</th>
                <th style={{ padding: 8 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(a => {
                const ambient = typeof a.ambientC === "number" ? a.ambientC : undefined;
                const temp = typeof a.temperatureC === "number" ? a.temperatureC : undefined;
                const vib = typeof a.vibrationRms === "number" ? a.vibrationRms : undefined;
                const dT = (typeof temp === "number" && typeof ambient === "number")
                  ? Number((temp - ambient).toFixed(0))
                  : undefined;

                const status = (a.status ?? getHealth(a)).toString();
                const statusLc = status.toLowerCase();
                const badgeBg =
                  statusLc === "healthy" ? "#dcfce7" :
                  statusLc === "warning" ? "#fef3c7" : "#fee2e2";
                const badgeFg =
                  statusLc === "healthy" ? "#166534" :
                  statusLc === "warning" ? "#92400e" : "#991b1b";

                return (
                  <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: 8 }}>
                      <div style={{ fontWeight: 600 }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{a.id}</div>
                    </td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      {typeof ambient === "number" ? ambient : "-"}
                    </td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      {typeof temp === "number" ? temp : "-"}
                    </td>
                    <td style={{ padding: 8, textAlign: "right",
                      color: typeof dT === "number"
                        ? (dT >= 25 ? "#b42318" : dT >= 12 ? "#b54708" : "#0f172a")
                        : "#0f172a"
                    }}>
                      {typeof dT === "number" ? dT : "-"}
                    </td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      {typeof vib === "number" ? vib.toFixed(1) : "-"}
                    </td>
                    <td style={{ padding: 8 }}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: badgeBg,
                        color: badgeFg,
                        border: "1px solid #eee",
                        fontSize: 12,
                      }}>
                        {status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPI({ title, value }: { title: string; value: number }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 12, color: "#64748b" }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
