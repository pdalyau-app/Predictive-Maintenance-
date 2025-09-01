// src/pages/AssetDetail.tsx
// COMPLETE FILE — drop-in replacement

import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import type { Asset } from "../types";
import { assets } from "../data/assets";
import AssetTrendChart from "../components/AssetTrendChart";

const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 16 };

function Fact({ title, value, wide = false }: { title: string; value: string; wide?: boolean }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "160px 1fr",
      gap: 10,
      padding: "8px 0",
      borderTop: "1px solid #f1f5f9",
      gridColumn: wide ? "1 / -1" as any : undefined
    }}>
      <div style={{ color: "#64748b" }}>{title}</div>
      <div style={{ color: "#0f172a", fontWeight: 600 }}>{value}</div>
    </div>
  );
}

export default function AssetDetail() {
  const { assetId } = useParams<{ assetId: string }>();

  // Find the asset (can be undefined on first render / invalid id)
  const asset: Asset | undefined = useMemo(
    () => assets.find((a) => a.id === assetId),
    [assetId]
  );

  if (!asset) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
        <div style={card}>
          <h2 style={{ margin: 0 }}>Asset not found</h2>
          <div style={{ marginTop: 12 }}>
            <Link to="/">← Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  const lastServicedText = asset.lastServiced
    ? new Date(asset.lastServiced).toLocaleDateString()
    : "-";

  const runtimeText = typeof asset.runtimeHours === "number"
    ? `${asset.runtimeHours.toFixed(1)} h`
    : "-";

  const notesText = asset.serviceNotes ?? "-";

  // latest trend point
  const lastPoint = asset.trend?.[asset.trend.length - 1];
  const tempText = lastPoint ? `${(lastPoint.bearingTemp ?? lastPoint.deltaT)?.toString()}°C` : "-";
  const vibText = lastPoint ? `${(lastPoint.vibrationRms ?? lastPoint.vibration)?.toString()} mm/s` : "-";
  const ampsText = lastPoint ? `${(lastPoint.currentAmps ?? lastPoint.current)?.toString()} A` : "-";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
      {/* Header */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Link to="/" style={{ fontSize: 14 }}>← Back</Link>
          <h2 style={{ margin: 0 }}>{asset.name}</h2>
          <div style={{
            marginLeft: "auto",
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            fontSize: 12
          }}>
            {asset.id}
          </div>
        </div>
        <div style={{ marginTop: 8, color: "#64748b" }}>
          {asset.type.toUpperCase()} · {asset.location ?? "—"}
        </div>
      </div>

      {/* Snapshot KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
        <div style={card}>
          <div style={{ fontSize: 12, color: "#667085", textTransform: "uppercase", letterSpacing: 0.4 }}>Bearing Temp</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{tempText}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, color: "#667085", textTransform: "uppercase", letterSpacing: 0.4 }}>Vibration</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{vibText}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, color: "#667085", textTransform: "uppercase", letterSpacing: 0.4 }}>Current</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{ampsText}</div>
        </div>
      </div>

      {/* Trend Chart */}
      <div style={card}>
        <h3 style={{ margin: "0 0 8px" }}>Trend</h3>
        <AssetTrendChart asset={asset} />
      </div>

      {/* Facts */}
      <div style={{ ...card, display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", columnGap: 24 }}>
        <h3 style={{ margin: "0 0 8px 0", gridColumn: "1 / -1" }}>Facts</h3>
        <Fact title="Status" value={asset.status} />
        <Fact title="Health" value={`${asset.health}%`} />
        <Fact title="Last serviced" value={lastServicedText} />
        <Fact title="Runtime since last service" value={runtimeText} />
        <Fact title="What was done" value={notesText} wide />
      </div>
    </div>
  );
}
