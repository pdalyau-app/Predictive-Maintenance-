// src/components/TrendChart.tsx
import React from "react";

type Props = {
  title?: string;
  labels: string[];
  seriesA: number[];          // Temperature (°C)
  seriesB: number[];          // Vibration (mm/s)
  avgSeriesA?: number[];      // Optional smoothed temp for selected asset
  avgSeriesB?: number[];      // Optional smoothed vib for selected asset
  tempWarn?: number;
  tempCrit?: number;
  vibWarn?: number;
  vibCrit?: number;
  tempHealthy?: [number, number];
  vibHealthy?: [number, number];
};

export default function TrendChart({
  title = "Temperature & Vibration",
  labels,
  seriesA,
  seriesB,
  avgSeriesA,
  avgSeriesB,
  tempWarn = 75,
  tempCrit = 90,
  vibWarn = 3.5,
  vibCrit = 5.5,
  tempHealthy = [40, 75],
  vibHealthy = [0.8, 3.5],
}: Props) {
  const width = 900;
  const height = 300;
  const padding = { top: 20, right: 58, bottom: 28, left: 54 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const n = Math.min(labels.length, seriesA.length, seriesB.length);
  const xs = labels.slice(-n);
  const temp = seriesA.slice(-n);
  const vib = seriesB.slice(-n);

  const tMin = Math.min(...temp, tempHealthy[0]);
  const tMax = Math.max(...temp, tempCrit, tempHealthy[1]);
  const tPad = Math.max(2, (tMax - tMin) * 0.15);
  const tLo = Math.floor((tMin - tPad) / 5) * 5;
  const tHi = Math.ceil((tMax + tPad) / 5) * 5;

  const vMin = Math.min(...vib, vibHealthy[0]);
  const vMax = Math.max(...vib, vibCrit, vibHealthy[1]);
  const vPad = Math.max(0.2, (vMax - vMin) * 0.25);
  const vLo = Math.max(0, Math.floor((vMin - vPad) * 10) / 10);
  const vHi = Math.ceil((vMax + vPad) * 10) / 10;

  const x = (i: number) => (n <= 1 ? padding.left : padding.left + (i / (n - 1)) * innerW);
  const yT = (val: number) => padding.top + innerH - ((val - tLo) / (tHi - tLo)) * innerH;
  const yV = (val: number) => padding.top + innerH - ((val - vLo) / (vHi - vLo)) * innerH;

  const pathFor = (arr: number[], y: (v: number) => number) =>
    arr.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");

  const gridXTicks = Math.min(8, Math.max(3, Math.floor(n / 4)));
  const gridYTicks = 5;

  const tempPath = pathFor(temp, yT);
  const vibPath = pathFor(vib, yV);
  const tempAvgPath = avgSeriesA && avgSeriesA.length ? pathFor(avgSeriesA.slice(-n), yT) : "";
  const vibAvgPath = avgSeriesB && avgSeriesB.length ? pathFor(avgSeriesB.slice(-n), yV) : "";

  const fmt1 = (v: number) => (Math.round(v * 10) / 10).toFixed(1);

  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
      <h3 style={{ margin: "0 0 8px 0" }}>{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        {/* Axes lines */}
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#e5e7eb" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#e5e7eb" />
        <line x1={width - padding.right} y1={padding.top} x2={width - padding.right} y2={height - padding.bottom} stroke="#e5e7eb" />

        {/* X ticks & grid */}
        {Array.from({ length: gridXTicks }).map((_, i) => {
          const idx = Math.round((i / (gridXTicks - 1)) * (n - 1));
          const xi = x(idx);
          return (
            <g key={`x-${i}`}>
              <line x1={xi} y1={padding.top} x2={xi} y2={height - padding.bottom} stroke="#f1f5f9" />
              <text x={xi} y={height - padding.bottom + 18} fontSize="11" textAnchor="middle" fill="#475569">
                {xs[idx]}
              </text>
            </g>
          );
        })}

        {/* Left Y ticks (Temp) */}
        {Array.from({ length: gridYTicks }).map((_, i) => {
          const val = tLo + (i / (gridYTicks - 1)) * (tHi - tLo);
          const yy = yT(val);
          return (
            <g key={`yt-${i}`}>
              <line x1={padding.left} y1={yy} x2={width - padding.right} y2={yy} stroke="#f8fafc" />
              <text x={padding.left - 8} y={yy + 4} fontSize="11" textAnchor="end" fill="#0f172a">
                {Math.round(val)}
              </text>
            </g>
          );
        })}

        {/* Right Y ticks (Vib) */}
        {Array.from({ length: gridYTicks }).map((_, i) => {
          const val = vLo + (i / (gridYTicks - 1)) * (vHi - vLo);
          const yy = yV(val);
          return (
            <g key={`yv-${i}`}>
              <text x={width - padding.right + 8} y={yy + 4} fontSize="11" textAnchor="start" fill="#0f172a">
                {fmt1(val)}
              </text>
            </g>
          );
        })}

        {/* Healthy bands */}
        <rect x={padding.left} width={innerW} y={yT(tempHealthy[1])} height={Math.max(0, yT(tempHealthy[0]) - yT(tempHealthy[1]))} fill="#22c55e" opacity="0.08" />
        <rect x={padding.left} width={innerW} y={yV(vibHealthy[1])} height={Math.max(0, yV(vibHealthy[0]) - yV(vibHealthy[1]))} fill="#3b82f6" opacity="0.08" />

        {/* Threshold lines */}
        <line x1={padding.left} x2={width - padding.right} y1={yT(tempWarn)} y2={yT(tempWarn)} stroke="#fde68a" strokeDasharray="4 4" />
        <line x1={padding.left} x2={width - padding.right} y1={yT(tempCrit)} y2={yT(tempCrit)} stroke="#fecaca" strokeDasharray="4 4" />
        <line x1={padding.left} x2={width - padding.right} y1={yV(vibWarn)} y2={yV(vibWarn)} stroke="#fde68a" strokeDasharray="4 4" />
        <line x1={padding.left} x2={width - padding.right} y1={yV(vibCrit)} y2={yV(vibCrit)} stroke="#fecaca" strokeDasharray="4 4" />

        {/* Live lines */}
        <path d={tempPath} fill="none" stroke="#0ea5e9" strokeWidth={2} />
        <path d={vibPath} fill="none" stroke="#22c55e" strokeWidth={2} />

        {/* Smoothed averages for selected asset (if provided) */}
        {tempAvgPath && <path d={tempAvgPath} fill="none" stroke="#0284c7" strokeWidth={2} strokeDasharray="6 4" />}
        {vibAvgPath && <path d={vibAvgPath} fill="none" stroke="#16a34a" strokeWidth={2} strokeDasharray="6 4" />}

        {/* Legends */}
        <rect x={padding.left} y={8} width={10} height={2} fill="#0ea5e9" />
        <text x={padding.left + 16} y={12} fontSize="12" fill="#0f172a">Temperature (°C)</text>

        <rect x={padding.left + 160} y={8} width={10} height={2} fill="#22c55e" />
        <text x={padding.left + 176} y={12} fontSize="12" fill="#0f172a">Vibration (mm/s)</text>

        <rect x={padding.left + 340} y={8} width={10} height={8} fill="#22c55e" opacity="0.15" />
        <text x={padding.left + 356} y={15} fontSize="12" fill="#0f172a">Temp healthy band</text>

        <rect x={padding.left + 510} y={8} width={10} height={8} fill="#3b82f6" opacity="0.15" />
        <text x={padding.left + 526} y={15} fontSize="12" fill="#0f172a">Vib healthy band</text>

        {avgSeriesA && avgSeriesA.length ? (
          <>
            <rect x={padding.left + 690} y={8} width={16} height={2} fill="#0284c7" />
            <text x={padding.left + 712} y={12} fontSize="12" fill="#0f172a">Temp (asset avg)</text>
          </>
        ) : null}
        {avgSeriesB && avgSeriesB.length ? (
          <>
            <rect x={padding.left + 840} y={8} width={16} height={2} fill="#16a34a" />
            <text x={padding.left + 862} y={12} fontSize="12" fill="#0f172a">Vib (asset avg)</text>
          </>
        ) : null}
      </svg>
    </div>
  );
}
