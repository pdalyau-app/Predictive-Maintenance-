import React from "react";
import { format, parseISO } from "date-fns";
import type { Asset } from "../types";

export default function AssetFacts({ asset }: { asset: Asset }) {
  const lastService = asset.lastServiced ? format(parseISO(asset.lastServiced), "dd MMM yyyy") : "-";
  const runtime = typeof asset.runtimeHoursSinceService === "number"
    ? `${asset.runtimeHoursSinceService.toFixed(1)} h`
    : "-";
  const warnings = asset.previousWarnings ?? [];

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <Fact title="Runtime since last service" value={runtime} />
        <Fact title="Last serviced" value={lastService} />
        <Fact title="Previous warnings" value={`${warnings.length}`} />
      </div>

      {warnings.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Warning history</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {warnings.map((w, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                <span style={{ color: "#64748b" }}>
                  {format(parseISO(w.date), "dd MMM yyyy")} —{" "}
                </span>
                {w.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Fact({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 12, color: "#64748b" }}>{title}</div>
      <div style={{ fontWeight: 800, fontSize: 18 }}>{value}</div>
    </div>
  );
}
