// src/pages/WorkOrders.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getWorkOrders, updateWorkOrderStatus } from "../data/workOrders";

const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 16 };

export default function WorkOrders() {
  const [status, setStatus] = useState<"all" | "open" | "in_progress" | "done" | "cancelled">("all");
  const [asset, setAsset] = useState("");
  const [nonce, setNonce] = useState(0);

  const list = useMemo(() => {
    let wos = getWorkOrders();
    if (status !== "all") wos = wos.filter(w => w.status === status);
    if (asset.trim()) wos = wos.filter(w => w.assetId.toLowerCase().includes(asset.trim().toLowerCase()));
    return wos;
  }, [status, asset, nonce]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Work Orders</h2>

      <div style={card}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#64748b" }}>Status:</span>
          {(["all", "open", "in_progress", "done", "cancelled"] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)} style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid #e2e8f0", background: status === s ? "#f1f5f9" : "#fff" }}>
              {s.replace("_", " ")}
            </button>
          ))}
          <input placeholder="Filter by asset id…" value={asset} onChange={e => setAsset(e.target.value)} style={{ marginLeft: "auto", border: "1px solid #e2e8f0", borderRadius: 12, padding: "8px 12px" }} />
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "grid", gap: 10 }}>
          {list.length === 0 && <div style={{ color: "#94a3b8" }}>No work orders.</div>}
          {list.map(wo => (
            <div key={wo.id} style={{ display: "grid", gridTemplateColumns: "140px 1fr auto", gap: 10, alignItems: "center", padding: "10px 0", borderTop: "1px solid #f1f5f9" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{wo.id}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>{new Date(wo.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <b>{wo.assetId}</b>
                  <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #e2e8f0", fontSize: 12 }}>{wo.status.replace("_", " ")}</span>
                </div>
                <div style={{ color: "#0f172a" }}>{wo.summary}</div>
                {wo.description && <div style={{ color: "#334155", fontSize: 13 }}>{wo.description}</div>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {wo.status !== "done" && (
                  <button
                    onClick={() => { updateWorkOrderStatus(wo.id, "done"); setNonce(n => n + 1); }}
                    style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #16a34a", background: "#ecfdf5", color: "#027a48" }}
                  >
                    Mark done
                  </button>
                )}
                <Link to={`/assets/${wo.assetId}`} style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  View asset
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
