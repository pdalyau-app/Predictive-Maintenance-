// src/pages/Alarms.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { alerts } from "../data/assets";

const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 16 };
const chip: React.CSSProperties = { padding: "6px 10px", borderRadius: 999, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer" };

const ranges = [
  { k: "24h", ms: 24 * 60 * 60 * 1000, label: "Last 24h" },
  { k: "7d",  ms: 7 * 24 * 60 * 60 * 1000,  label: "Last 7d" },
  { k: "30d", ms: 30 * 24 * 60 * 60 * 1000, label: "Last 30d" },
  { k: "all", ms: Infinity,                 label: "All time" },
] as const;

type RangeKey = typeof ranges[number]["k"];

const ACK_KEY = "pm_ack_v1";
type AckMap = Record<string, number>; // id -> acknowledged timestamp (ms)

function loadAcks(): AckMap {
  try {
    const raw = localStorage.getItem(ACK_KEY);
    return raw ? (JSON.parse(raw) as AckMap) : {};
  } catch { return {}; }
}
function saveAcks(m: AckMap) {
  try { localStorage.setItem(ACK_KEY, JSON.stringify(m)); } catch {}
}

type Alarm = (typeof alerts)[number];

export default function Alarms() {
  const [severity, setSeverity] = useState<"all" | "warning" | "critical">("all");
  const [range, setRange] = useState<RangeKey>("7d");
  const [q, setQ] = useState("");
  const [unackedOnly, setUnackedOnly] = useState(false);

  const [acks, setAcks] = useState<AckMap>(() => loadAcks());
  useEffect(() => saveAcks(acks), [acks]);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  // NEW: escalate modal state
  const [escalateFor, setEscalateFor] = useState<Alarm | null>(null);
  const [woSummary, setWoSummary] = useState("");
  const [woDesc, setWoDesc] = useState("");
  const [woPriority, setWoPriority] = useState("2");

  const list = useMemo(() => {
    const cutoff = range === "all" ? -Infinity : Date.now() - ranges.find(r => r.k === range)!.ms;
    return alerts
      .filter(a => new Date(a.when).getTime() >= cutoff)
      .filter(a => (severity === "all" ? true : a.severity === severity))
      .filter(a => (q.trim() ? (a.assetId + " " + a.text).toLowerCase().includes(q.trim().toLowerCase()) : true))
      .filter(a => (unackedOnly ? !acks[a.id] : true))
      .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
  }, [severity, range, q, unackedOnly, acks]);

  const allVisibleSelected = list.length > 0 && list.every(a => selected.has(a.id));
  const anySelected = selected.size > 0;

  function toggleAck(id: string) {
    setAcks(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = Date.now();
      return next;
    });
  }

  function bulkAck(ids: string[]) {
    if (ids.length === 0) return;
    setAcks(prev => {
      const next = { ...prev };
      ids.forEach(id => { next[id] = Date.now(); });
      return next;
    });
    setSelected(new Set()); // clear selection after action
  }

  function toggleSelectAllVisible() {
    setSelected(prev => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        list.forEach(a => next.delete(a.id));
        return next;
      } else {
        const next = new Set(prev);
        list.forEach(a => next.add(a.id));
        return next;
      }
    });
  }

  // Prefill and open escalate modal
  function openEscalate(al: Alarm) {
    setEscalateFor(al);
    setWoSummary(`[${al.assetId}] ${al.severity.toUpperCase()} — ${al.text}`);
    setWoDesc(
      `Auto-prefilled from alarm ${al.id} at ${new Date(al.when).toLocaleString()}.\n\n` +
      `Details:\n• Asset: ${al.assetId}\n• Severity: ${al.severity}\n• Message: ${al.text}`
    );
    setWoPriority(al.severity === "critical" ? "1" : "2");
  }

  function createWorkOrderMock() {
    // NOTE: We’re not persisting to the Work Orders page yet to avoid touching other files.
    // This is a UX flow prototype only.
    console.log("Work order created (mock):", {
      assetId: escalateFor?.assetId, summary: woSummary, description: woDesc, priority: woPriority,
    });
    setEscalateFor(null);
    // optional: mark alarm as acknowledged when escalated
    if (escalateFor) toggleAck(escalateFor.id);
    alert("Work order created (mock). (This demo doesn’t persist yet.)");
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Alarms</h2>

      {/* Controls */}
      <div style={card}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#64748b" }}>Severity:</span>
          {(["all", "warning", "critical"] as const).map(s => (
            <button key={s} onClick={() => setSeverity(s)} style={{ ...chip, background: severity === s ? "#f1f5f9" : "#fff" }}>
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}

          <span style={{ color: "#64748b", marginLeft: 8 }}>Range:</span>
          {ranges.map(r => (
            <button key={r.k} onClick={() => setRange(r.k)} style={{ ...chip, background: range === r.k ? "#f1f5f9" : "#fff" }}>
              {r.label}
            </button>
          ))}

          <label style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
            <input type="checkbox" checked={unackedOnly} onChange={e => setUnackedOnly(e.target.checked)} />
            <span style={{ color: "#334155" }}>Unacknowledged only</span>
          </label>

          <input
            placeholder="Search text or asset..."
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ marginLeft: "auto", border: "1px solid #e2e8f0", borderRadius: 12, padding: "8px 12px" }}
          />
        </div>
      </div>

      {/* Bulk actions */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
            />
            <span style={{ color: "#334155" }}>
              Select all shown ({list.length})
            </span>
          </label>

          <button
            onClick={() => bulkAck(Array.from(selected))}
            style={{ ...chip, borderColor: "#60a5fa", background: anySelected ? "#3b82f6" : "#fff", color: anySelected ? "#fff" : "#64748b" }}
            disabled={!anySelected}
            title={anySelected ? "Acknowledge selected" : "Select alarms to enable"}
          >
            Acknowledge selected
          </button>

          <div style={{ marginLeft: "auto", color: "#94a3b8", fontSize: 12 }}>
            {selected.size} selected
          </div>
        </div>
      </div>

      {/* List */}
      <div style={card}>
        <div style={{ display: "grid", gap: 8 }}>
          {list.length === 0 && <div style={{ color: "#94a3b8" }}>No alarms.</div>}
          {list.map(al => {
            const isCritical = al.severity === "critical";
            const isAck = !!acks[al.id];
            const isChecked = selected.has(al.id);
            return (
              <div
                key={al.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto auto 1fr auto auto auto",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 8px",
                  borderTop: "1px solid #f1f5f9",
                  background: isCritical ? "rgba(254, 226, 226, 0.25)" : undefined,
                  borderRadius: 8,
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    setSelected(prev => {
                      const next = new Set(prev);
                      e.target.checked ? next.add(al.id) : next.delete(al.id);
                      return next;
                    });
                  }}
                />

                <span style={{ color: isCritical ? "#dc2626" : "#f59e0b" }}>●</span>

                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ color: "#64748b", whiteSpace: "nowrap" }}>
                    {new Date(al.when).toLocaleString()}
                  </span>
                  <b style={{ color: "#0f172a", whiteSpace: "nowrap" }}>{al.assetId}</b>
                  <span style={{ color: "#334155", overflow: "hidden", textOverflow: "ellipsis" }}>— {al.text}</span>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {isAck ? (
                    <span style={{ padding: "2px 8px", borderRadius: 999, background: "#ecfdf5", border: "1px solid #bbf7d0", color: "#065f46", fontSize: 12 }}>
                      Acknowledged
                    </span>
                  ) : (
                    <span style={{ padding: "2px 8px", borderRadius: 999, background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", fontSize: 12 }}>
                      Unacknowledged
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => toggleAck(al.id)}
                    style={{
                      ...chip,
                      borderColor: isAck ? "#94a3b8" : "#60a5fa",
                      background: isAck ? "#f8fafc" : "#dbeafe",
                      color: isAck ? "#334155" : "#1d4ed8",
                    }}
                  >
                    {isAck ? "Unacknowledge" : "Acknowledge"}
                  </button>
                  <Link to={`/assets/${al.assetId}`} style={{ ...chip, textDecoration: "none" }}>
                    View asset
                  </Link>
                </div>

                {/* NEW: Escalate */}
                <button
                  onClick={() => openEscalate(al)}
                  style={{ ...chip, borderColor: "#34d399", background: "#ecfdf5", color: "#065f46" }}
                  title="Escalate to Work Order"
                >
                  Escalate
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ESCALATE MODAL (mock create) */}
      {escalateFor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 80,
          }}
          onClick={() => setEscalateFor(null)}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 800 }}>
                Escalate to Work Order — {escalateFor.assetId}
              </div>
              <button
                onClick={() => setEscalateFor(null)}
                style={{ background: "none", border: 0, fontSize: 18, cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <div style={{ color: "#64748b", fontSize: 12 }}>
                From alarm {escalateFor.id} at {new Date(escalateFor.when).toLocaleString()}
              </div>

              <label>
                <div style={{ color: "#334155", marginBottom: 4 }}>Summary</div>
                <input
                  value={woSummary}
                  onChange={(e) => setWoSummary(e.target.value)}
                  style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px" }}
                />
              </label>

              <label>
                <div style={{ color: "#334155", marginBottom: 4 }}>Description</div>
                <textarea
                  rows={5}
                  value={woDesc}
                  onChange={(e) => setWoDesc(e.target.value)}
                  style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px", resize: "vertical" }}
                />
              </label>

              <label>
                <div style={{ color: "#334155", marginBottom: 4 }}>Priority</div>
                <select
                  value={woPriority}
                  onChange={(e) => setWoPriority(e.target.value)}
                  style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px" }}
                >
                  <option value="1">1 — Urgent</option>
                  <option value="2">2 — High</option>
                  <option value="3">3 — Normal</option>
                  <option value="4">4 — Low</option>
                </select>
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                <button
                  onClick={() => setEscalateFor(null)}
                  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff" }}
                >
                  Cancel
                </button>
                <button
                  onClick={createWorkOrderMock}
                  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #34d399", background: "#10b981", color: "#fff" }}
                >
                  Create work order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
