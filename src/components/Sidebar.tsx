import React from "react";
import { NavLink } from "react-router-dom";

const linkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: "#0f172a",
  fontWeight: 600,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 12,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: 0.4,
  margin: "12px 8px 6px",
};

export default function Sidebar() {
  return (
    <aside
      style={{
        position: "sticky",
        top: 64,
        alignSelf: "start",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 8,
      }}
    >
      <style>{`
        .sb-link.active {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
        }
        .sb-link:not(.active) {
          border: 1px solid #e2e8f0;
        }
        @media (max-width: 980px) {
          aside { display: none; }
        }
      `}</style>

      <div style={sectionTitle}>Overview</div>
      <NavLink to="/" end className="sb-link" style={linkStyle}>
        <span>🏠</span> <span>Dashboard</span>
      </NavLink>

      <div style={sectionTitle}>Operations</div>
      <NavLink to="/connections" className="sb-link" style={linkStyle}>
        <span>🔌</span> <span>Connections</span>
      </NavLink>
      <NavLink to="/alarms" className="sb-link" style={linkStyle}>
        <span>🚨</span> <span>Alarms</span>
      </NavLink>
      <NavLink to="/workorders" className="sb-link" style={linkStyle}>
        <span>🧾</span> <span>Work Orders</span>
      </NavLink>

      <div style={sectionTitle}>Planning</div>
      <NavLink to="/schedule" className="sb-link" style={linkStyle}>
        <span>🗓️</span> <span>Maintenance Schedule</span>
      </NavLink>

      <div style={sectionTitle}>Admin</div>
      <div
        className="sb-link"
        style={{ ...linkStyle, opacity: 0.5, cursor: "not-allowed" }}
        title="Coming soon"
      >
        <span>⚙️</span> <span>Settings</span>
      </div>
    </aside>
  );
}
