import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type CalEvent = {
  id: string;
  title: string;
  date: string;     // YYYY-MM-DD
  assetId: string;
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 16,
};

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
const toISO = (d: Date) => d.toISOString().slice(0, 10);

export default function Schedule() {
  const [current, setCurrent] = useState(() => new Date());

  // Seed events (replace later with computed/real data)
  const events: CalEvent[] = [
    { id: "MTR-001", title: "Service due",        date: toISO(addDays(new Date(), 3)),  assetId: "MTR-001" },
    { id: "PMP-014", title: "Lube & inspect due", date: toISO(addDays(new Date(), 6)),  assetId: "PMP-014" },
    { id: "FAN-003", title: "Belt check due",     date: toISO(addDays(new Date(), 10)), assetId: "FAN-003" },
  ];

  const monthGrid = useMemo(() => {
    const start = startOfMonth(current);
    const end = endOfMonth(current);
    const startWeekday = (start.getDay() + 6) % 7; // Monday = 0
    const gridStart = addDays(start, -startWeekday);
    const endWeekday = (end.getDay() + 6) % 7;
    const gridEnd = addDays(end, 6 - endWeekday);
    const days: Date[] = [];
    for (let d = new Date(gridStart); d <= gridEnd; d = addDays(d, 1)) days.push(new Date(d));
    return days;
  }, [current]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    for (const e of events) {
      (map[e.date] ??= []).push(e);
    }
    return map;
  }, [events]);

  const monthLabel = current.toLocaleString([], { month: "long", year: "numeric" });
  const today = new Date();

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Maintenance Schedule</h2>

      {/* Toolbar */}
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff" }}
        >
          ← Prev
        </button>
        <div style={{ marginLeft: 8, fontWeight: 800 }}>{monthLabel}</div>
        <button
          onClick={() => setCurrent(new Date())}
          style={{ marginLeft: "auto", padding: "6px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff" }}
        >
          Today
        </button>
        <button
          onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff" }}
        >
          Next →
        </button>
      </div>

      {/* Calendar – full width up to 1440px */}
      <div style={{ ...card }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0,1fr))",
            gap: 12,
            marginBottom: 10,
            color: "#64748b",
            fontSize: 12,
          }}
        >
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
            <div key={d} style={{ textAlign: "center" }}>{d}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: 12 }}>
          {monthGrid.map((d, i) => {
            const isThisMonth = d.getMonth() === current.getMonth();
            const key = toISO(d);
            const todaysEvents = eventsByDate[key] ?? [];
            const isToday = sameDay(d, today);

            return (
              <div
                key={i}
                style={{
                  minHeight: 140,                 // taller cells for wider layout
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  background: isThisMonth ? "#fff" : "#f8fafc",
                  position: "relative",
                  padding: 10,
                }}
              >
                <div style={{ position: "absolute", top: 8, right: 10, fontSize: 12, color: isThisMonth ? "#334155" : "#94a3b8" }}>
                  {d.getDate()}
                </div>

                {isToday && (
                  <div style={{ position: "absolute", top: 8, left: 10, fontSize: 11, color: "#0ea5e9" }}>
                    Today
                  </div>
                )}

                <div style={{ display: "grid", gap: 8, marginTop: 24 }}>
                  {todaysEvents.map(e => (
                    <div
                      key={e.id}
                      style={{
                        border: "1px solid #bfdbfe",
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        borderRadius: 10,
                        padding: "6px 8px",
                        fontSize: 12,
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <span>🛠️</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{e.id}</div>
                        <div>{e.title}</div>
                      </div>
                      <Link to={`/assets/${encodeURIComponent(e.assetId)}`} style={{ fontSize: 12 }}>
                        View
                      </Link>
                    </div>
                  ))}

                  {todaysEvents.length === 0 && (
                    <div style={{ color: "#94a3b8", fontSize: 12 }}>—</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div style={{ ...card, color: "#334155", fontSize: 13 }}>
        <b>Tip:</b> We widened the global container to 1440px and increased cell height. If you want even wider, change
        <code> maxWidth: 1440 </code> in `App.tsx` and here to 1600–1800.
      </div>
    </div>
  );
}
