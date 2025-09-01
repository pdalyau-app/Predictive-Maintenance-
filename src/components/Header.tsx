// src/components/Header.tsx
import { Link, NavLink } from "react-router-dom";
import React from "react";

const navLinkStyle: React.CSSProperties = {
  color: "#334155",
  textDecoration: "none",
  padding: "6px 8px",
  borderRadius: 8,
};

export default function Header() {
  return (
    <header
      style={{
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1440,     // <-- match App container
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Link to="/" style={{ textDecoration: "none", color: "#0f172a" }}>
            <div style={{ fontWeight: 800, letterSpacing: 0.4 }}>
              Predictive Maintenance AI
            </div>
          </Link>
          <nav style={{ display: "flex", gap: 10 }}>
            <NavLink to="/" style={navLinkStyle} end>
              Dashboard
            </NavLink>
            <NavLink to="/connections" style={navLinkStyle}>
              Connections
            </NavLink>
            <NavLink to="/alarms" style={navLinkStyle}>
              Alarms
            </NavLink>
            <NavLink to="/workorders" style={navLinkStyle}>
              Work Orders
            </NavLink>
            <NavLink to="/schedule" style={navLinkStyle}>
              Schedule
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
