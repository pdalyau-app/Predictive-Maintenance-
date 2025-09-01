// src/pages/Connections.tsx
import { useMemo, useState } from "react";
import { getConnections, addConnection, toggleConnection } from "../data/connections";
import type { ConnectionKind } from "../types-extra";

const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 16 };
const chip: React.CSSProperties = { padding: "6px 10px", borderRadius: 999, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer" };

export default function Connections() {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<ConnectionKind>("opcua");
  const [nonce, setNonce] = useState(0); // simple refetch trigger

  const list = useMemo(() => getConnections(), [nonce]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Connections</h2>
      <div style={{ color: "#64748b" }}>Create a connection to your data source (OPC UA, Modbus TCP, MQTT, CSV, or manual).</div>

      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Add connection</div>
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            <div style={{ color: "#334155", marginBottom: 4 }}>Name</div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. OPC UA — Main PLC"
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px" }}
            />
          </label>
          <label>
            <div style={{ color: "#334155", marginBottom: 4 }}>Kind</div>
            <select
              value={kind}
              onChange={e => setKind(e.target.value as ConnectionKind)}
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px" }}
            >
              <option value="opcua">OPC UA</option>
              <option value="modbus">Modbus TCP</option>
              <option value="mqtt">MQTT</option>
              <option value="csv">CSV Upload</option>
              <option value="manual">Manual</option>
            </select>
          </label>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => {
                if (!name.trim()) return;
                addConnection({ name: name.trim(), kind });
                setName("");
                setKind("opcua");
                setNonce(n => n + 1);
              }}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #60a5fa", background: "#3b82f6", color: "#fff" }}
            >
              Save connection
            </button>
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Existing connections</div>
        <div style={{ display: "grid", gap: 10 }}>
          {list.length === 0 && <div style={{ color: "#94a3b8" }}>No connections yet.</div>}
          {list.map(conn => (
            <div key={conn.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 0", borderTop: "1px solid #f1f5f9" }}>
              <div style={{ width: 8, height: 8, borderRadius: 999, background: conn.enabled ? "#16a34a" : "#94a3b8" }} />
              <div style={{ fontWeight: 700 }}>{conn.name}</div>
              <div style={{ color: "#64748b", fontSize: 12 }}>{conn.kind.toUpperCase()}</div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button
                  onClick={() => { toggleConnection(conn.id, !conn.enabled); setNonce(n => n + 1); }}
                  style={{ ...chip }}
                >
                  {conn.enabled ? "Disable" : "Enable"}
                </button>
                <button disabled style={{ ...chip, opacity: 0.6 }}>
                  Test (soon)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
