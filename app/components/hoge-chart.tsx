"use client";

import type { HOGELineConfig } from "@/lib/ofp/types";

type Props = {
  lines: HOGELineConfig[];
};

const X_MIN = 1700;
const X_MAX = 2600;
const Y_MIN = 0;
const Y_MAX = 14;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function xToSvg(x: number, width: number, left: number, right: number): number {
  return left + ((clamp(x, X_MIN, X_MAX) - X_MIN) / (X_MAX - X_MIN)) * (width - left - right);
}

function yToSvg(y: number, height: number, top: number, bottom: number): number {
  return height - bottom - ((clamp(y, Y_MIN, Y_MAX) - Y_MIN) / (Y_MAX - Y_MIN)) * (height - top - bottom);
}

function strokeColor(color: HOGELineConfig["color"]): string {
  if (color === "rot") return "#dc2626";
  if (color === "blau") return "#2563eb";
  return "#111827";
}

function strokeDash(style: HOGELineConfig["style"]): string | undefined {
  return style === "gestrichelt" ? "6 4" : undefined;
}

function strokeWidth(width: HOGELineConfig["width"]): number {
  if (width === "grob") return 2.8;
  if (width === "mittel") return 2;
  return 1.2;
}

export function HOGEChart({ lines }: Props) {
  const width = 860;
  const height = 420;
  const left = 80;
  const right = 24;
  const top = 24;
  const bottom = 58;

  return (
    <div className="rounded border bg-white p-3 md:col-span-4">
      <h3 className="mb-2 text-sm font-semibold">HOGE OGE Chart</h3>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-[420px] w-full rounded bg-zinc-50">
        <rect x="0" y="0" width={width} height={height} fill="#f8fafc" />

        {Array.from({ length: 10 }, (_, i) => 1700 + i * 100).map((xTick) => {
          const x = xToSvg(xTick, width, left, right);
          return (
            <g key={`x-${xTick}`}>
              <line x1={x} y1={top} x2={x} y2={height - bottom} stroke="#cbd5e1" strokeDasharray="4 5" />
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
              <line x1={left} y1={y} x2={width - right} y2={y} stroke="#cbd5e1" strokeDasharray="4 5" />
              <text x={left - 10} y={y + 4} fontSize="11" textAnchor="end" fill="#334155">
                {yTick}
              </text>
            </g>
          );
        })}

        <line x1={left} y1={top} x2={left} y2={height - bottom} stroke="#0f172a" strokeWidth="1.5" />
        <line x1={left} y1={height - bottom} x2={width - right} y2={height - bottom} stroke="#0f172a" strokeWidth="1.5" />

        {lines.map((line) => (
          <g key={line.id}>
            <line
              x1={xToSvg(line.x1, width, left, right)}
              y1={yToSvg(line.y1, height, top, bottom)}
              x2={xToSvg(line.x2, width, left, right)}
              y2={yToSvg(line.y2, height, top, bottom)}
              stroke={strokeColor(line.color)}
              strokeWidth={strokeWidth(line.width)}
              strokeDasharray={strokeDash(line.style)}
            />
            {line.showTitle ? (
              <text
                x={xToSvg(line.x1, width, left, right) + 6}
                y={yToSvg(line.y1, height, top, bottom) - 6}
                fontSize="11"
                fill={strokeColor(line.color)}
              >
                {line.title}
              </text>
            ) : null}
          </g>
        ))}

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
    </div>
  );
}

