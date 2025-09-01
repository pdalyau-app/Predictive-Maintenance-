import React from "react";

type Props = {
  label: string;
  value: string;
  sub?: string;
};

export default function KpiCard({ label, value, sub }: Props) {
  return (
    <div
      style={{
        textAlign: "left",
        padding: "14px 16px",
        borderRadius: 12,
        background: "#ffffff",
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#667085",
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{value}</div>
      {sub && (
        <div
          style={{
            display: "inline-block",
            marginTop: 6,
            fontSize: 12,
            color: "#0f172a",
            padding: "2px 8px",
            borderRadius: 999,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
