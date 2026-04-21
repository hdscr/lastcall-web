"use client";

type Props = {
  grossWeightLbs: number;
  pressureAltitudeFt: number;
  densityAltitudeFt: number;
  hogeScenariosFt: {
    isa: number;
    qnhCorrected: number;
    deltaIsaCorrected: number;
    final: number;
  };
};

type TempLine = {
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

const X_MIN = 1700;
const X_MAX = 2600;
const Y_MIN = 0;
const Y_MAX = 14;

const TEMP_LINES: TempLine[] = [
  { label: "-30°C", x1: 1900, y1: 14.0, x2: 2500, y2: 7.25 },
  { label: "-20°C", x1: 1929, y1: 13.02, x2: 2500, y2: 6.64 },
  { label: "-10°C", x1: 1957, y1: 12.08, x2: 2500, y2: 6.04 },
  { label: "0°C", x1: 1986, y1: 11.1, x2: 2500, y2: 5.43 },
  { label: "10°C", x1: 2013, y1: 10.19, x2: 2500, y2: 4.82 },
  { label: "20°C", x1: 2041, y1: 9.24, x2: 2500, y2: 4.22 },
  { label: "30°C", x1: 2069, y1: 8.3, x2: 2500, y2: 3.61 },
  { label: "40°C", x1: 2097, y1: 7.35, x2: 2500, y2: 3.0 },
];

const HELPER_LINES: Array<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}> = [
  { x1: 1986, y1: 11.1, x2: 2490, y2: 5.54 }, // 0 degrees helper
  { x1: 2013, y1: 10.19, x2: 2475, y2: 5.1 }, // 10 degrees helper
  { x1: 2041, y1: 9.24, x2: 2450, y2: 4.76 }, // 20 degrees helper
  { x1: 2069, y1: 8.3, x2: 2430, y2: 4.37 }, // 30 degrees helper
  { x1: 2097, y1: 7.35, x2: 2425, y2: 3.81 }, // 40 degrees helper
];

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function xToSvg(x: number, width: number, left: number, right: number): number {
  return left + ((clamp(x, X_MIN, X_MAX) - X_MIN) / (X_MAX - X_MIN)) * (width - left - right);
}

function yToSvg(y: number, height: number, top: number, bottom: number): number {
  return height - bottom - ((clamp(y, Y_MIN, Y_MAX) - Y_MIN) / (Y_MAX - Y_MIN)) * (height - top - bottom);
}

function scenarioLine(label: string, yFt: number, color: string) {
  return { label, y: yFt / 1000, color };
}

export function HOGEChart({
  grossWeightLbs,
  pressureAltitudeFt,
  densityAltitudeFt,
  hogeScenariosFt,
}: Props) {
  const width = 860;
  const height = 420;
  const left = 80;
  const right = 24;
  const top = 24;
  const bottom = 58;

  const weightX = xToSvg(grossWeightLbs, width, left, right);
  const pressureY = yToSvg(pressureAltitudeFt / 1000, height, top, bottom);
  const densityY = yToSvg(densityAltitudeFt / 1000, height, top, bottom);

  const scenarioLines = [
    scenarioLine("HOGE ISA", hogeScenariosFt.isa, "#2563eb"),
    scenarioLine("HOGE QNH", hogeScenariosFt.qnhCorrected, "#0f766e"),
    scenarioLine("HOGE Delta ISA", hogeScenariosFt.deltaIsaCorrected, "#ca8a04"),
    scenarioLine("HOGE Final", hogeScenariosFt.final, "#dc2626"),
  ];

  return (
    <div className="rounded border bg-white p-3 md:col-span-4">
      <h3 className="mb-2 text-sm font-semibold">HOGE OGE Chart</h3>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-[420px] w-full rounded bg-zinc-50">
        <rect x="0" y="0" width={width} height={height} fill="#f8fafc" />

        {Array.from({ length: 10 }, (_, i) => 1700 + i * 100).map((xTick) => {
          const x = xToSvg(xTick, width, left, right);
          return (
            <g key={`x-${xTick}`}>
              <line
                x1={x}
                y1={top}
                x2={x}
                y2={height - bottom}
                stroke="#cbd5e1"
                strokeDasharray="4 5"
              />
              <text x={x} y={height - bottom + 18} fontSize="11" textAnchor="middle" fill="#334155">
                {xTick}
              </text>
            </g>
          );
        })}

        {Array.from({ length: 15 }, (_, i) => i).map((yTick) => {
          const y = yToSvg(yTick, height, top, bottom);
          return (
            <g key={`y-${yTick}`}>
              <line
                x1={left}
                y1={y}
                x2={width - right}
                y2={y}
                stroke="#cbd5e1"
                strokeDasharray="4 5"
              />
              <text x={left - 10} y={y + 4} fontSize="11" textAnchor="end" fill="#334155">
                {yTick}
              </text>
            </g>
          );
        })}

        <line x1={left} y1={top} x2={left} y2={height - bottom} stroke="#0f172a" strokeWidth="1.5" />
        <line x1={left} y1={height - bottom} x2={width - right} y2={height - bottom} stroke="#0f172a" strokeWidth="1.5" />

        {TEMP_LINES.map((line) => {
          const x1 = xToSvg(line.x1, width, left, right);
          const y1 = yToSvg(line.y1, height, top, bottom);
          const x2 = xToSvg(line.x2, width, left, right);
          const y2 = yToSvg(line.y2, height, top, bottom);
          return (
            <g key={line.label}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#111827" strokeWidth="2" />
              <text x={x1 + 6} y={y1 - 6} fontSize="11" fill="#111827">
                {line.label}
              </text>
            </g>
          );
        })}

        {HELPER_LINES.map((line, idx) => {
          const x1 = xToSvg(line.x1, width, left, right);
          const y1 = yToSvg(line.y1, height, top, bottom);
          const x2 = xToSvg(line.x2, width, left, right);
          const y2 = yToSvg(line.y2, height, top, bottom);
          return (
            <line
              key={`helper-${idx}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#111827"
              strokeWidth="1.4"
            />
          );
        })}

        {scenarioLines.map((s) => {
          const y = yToSvg(s.y, height, top, bottom);
          return (
            <g key={s.label}>
              <line
                x1={left}
                y1={y}
                x2={width - right}
                y2={y}
                stroke={s.color}
                strokeWidth="1.4"
                strokeDasharray="6 4"
              />
              <text x={width - right - 2} y={y - 4} fontSize="10" textAnchor="end" fill={s.color}>
                {s.label}
              </text>
            </g>
          );
        })}

        <line x1={weightX} y1={top} x2={weightX} y2={height - bottom} stroke="#334155" strokeDasharray="3 3" />
        <circle cx={weightX} cy={pressureY} r="4" fill="#111827" />
        <circle cx={weightX} cy={densityY} r="4" fill="#7c3aed" />

        <text
          x={(left + (width - right)) / 2}
          y={height - 12}
          fontSize="12"
          textAnchor="middle"
          fill="#0f172a"
        >
          Gross weight - lb
        </text>

        <text
          x="18"
          y={(top + (height - bottom)) / 2}
          fontSize="12"
          textAnchor="middle"
          fill="#0f172a"
          transform={`rotate(-90 18 ${(top + (height - bottom)) / 2})`}
        >
          Pressure altitude - Hp x 1000ft
        </text>
      </svg>

      <div className="mt-2 grid gap-1 text-xs text-zinc-700 md:grid-cols-3">
        <div>Gross Weight: {grossWeightLbs.toFixed(1)} lb</div>
        <div>Pressure Altitude: {(pressureAltitudeFt / 1000).toFixed(2)} (x1000 ft)</div>
        <div>Density Altitude: {(densityAltitudeFt / 1000).toFixed(2)} (x1000 ft)</div>
      </div>
    </div>
  );
}
