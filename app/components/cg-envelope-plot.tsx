"use client";

import type { EnvelopePoint } from "@/lib/ofp/types";

type Props = {
  longPoints: EnvelopePoint[];
  latPoints: EnvelopePoint[];
  currentLong: number;
  currentLat: number;
  tomLbs: number;
  inEnvelope: boolean;
};

function bounds(points: EnvelopePoint[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function sx(x: number, minX: number, maxX: number, width: number, pad: number) {
  return pad + ((x - minX) / (maxX - minX || 1)) * (width - pad * 2);
}

function sy(y: number, minY: number, maxY: number, height: number, pad: number) {
  return height - pad - ((y - minY) / (maxY - minY || 1)) * (height - pad * 2);
}

function polygon(points: EnvelopePoint[], width: number, height: number) {
  const b = bounds(points);
  const pad = 16;
  return points
    .map((p) => `${sx(p.x, b.minX, b.maxX, width, pad)},${sy(p.y, b.minY, b.maxY, height, pad)}`)
    .join(" ");
}

function marker(x: number, y: number, points: EnvelopePoint[], width: number, height: number) {
  const b = bounds(points);
  const pad = 16;
  return {
    cx: sx(x, b.minX, b.maxX, width, pad),
    cy: sy(y, b.minY, b.maxY, height, pad),
  };
}

function Plot({
  title,
  xLabel,
  yLabel,
  points,
  currentX,
  currentY,
  inEnvelope,
}: {
  title: string;
  xLabel: string;
  yLabel: string;
  points: EnvelopePoint[];
  currentX: number;
  currentY: number;
  inEnvelope: boolean;
}) {
  const width = 320;
  const height = 220;
  const poly = polygon(points, width, height);
  const p = marker(currentX, currentY, points, width, height);

  return (
    <div className="rounded border bg-white p-2">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className={`text-xs ${inEnvelope ? "text-green-700" : "text-red-700"}`}>
          {inEnvelope ? "IN" : "OUT"}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full rounded bg-zinc-50">
        <rect x="0" y="0" width={width} height={height} fill="#f8fafc" />
        <polygon points={poly} fill="rgba(14, 165, 233, 0.15)" stroke="#0284c7" strokeWidth="2" />
        <circle cx={p.cx} cy={p.cy} r="5" fill={inEnvelope ? "#16a34a" : "#dc2626"} />
      </svg>
      <p className="mt-1 text-xs text-zinc-600">
        {xLabel}: {currentX.toFixed(2)} | {yLabel}: {currentY.toFixed(2)}
      </p>
    </div>
  );
}

export function CGEnvelopePlot({
  longPoints,
  latPoints,
  currentLong,
  currentLat,
  tomLbs,
  inEnvelope,
}: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Plot
        title="Longitudinal Envelope Plot"
        xLabel="CG long (in)"
        yLabel="Weight (lbs)"
        points={longPoints}
        currentX={currentLong}
        currentY={tomLbs}
        inEnvelope={inEnvelope}
      />
      <Plot
        title="Lateral Envelope Plot"
        xLabel="CG long (in)"
        yLabel="CG lat (in)"
        points={latPoints}
        currentX={currentLong}
        currentY={currentLat}
        inEnvelope={inEnvelope}
      />
    </div>
  );
}
