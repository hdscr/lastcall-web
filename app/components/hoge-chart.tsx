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

function yToSvg(yFt: number, maxFt: number, h: number, pad: number) {
  return h - pad - (Math.max(0, Math.min(maxFt, yFt)) / maxFt) * (h - pad * 2);
}

function xToSvg(xLbs: number, minLbs: number, maxLbs: number, w: number, pad: number) {
  return pad + ((xLbs - minLbs) / (maxLbs - minLbs || 1)) * (w - pad * 2);
}

export function HOGEChart({
  grossWeightLbs,
  pressureAltitudeFt,
  densityAltitudeFt,
  hogeScenariosFt,
}: Props) {
  const w = 640;
  const h = 280;
  const pad = 28;
  const minWeight = 1500;
  const maxWeight = 2500;
  const maxAlt = 14000;

  const x = xToSvg(grossWeightLbs, minWeight, maxWeight, w, pad);

  const lines = [
    { key: "isa", label: "HOGE ISA", y: hogeScenariosFt.isa, color: "#2563eb" },
    { key: "qnh", label: "HOGE QNH corrected", y: hogeScenariosFt.qnhCorrected, color: "#0f766e" },
    { key: "delta", label: "HOGE Delta-ISA corrected", y: hogeScenariosFt.deltaIsaCorrected, color: "#ca8a04" },
    { key: "final", label: "HOGE Final", y: hogeScenariosFt.final, color: "#dc2626" },
  ];

  return (
    <div className="rounded border bg-white p-3 md:col-span-4">
      <h3 className="mb-2 text-sm font-semibold">
        HOGE / Density Altitude (x: Gross Weight, y: Pressure Altitude x1000 ft)
      </h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-72 w-full rounded bg-zinc-50">
        <rect x="0" y="0" width={w} height={h} fill="#f8fafc" />
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#334155" />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#334155" />

        {lines.map((line) => {
          const y = yToSvg(line.y, maxAlt, h, pad);
          return (
            <g key={line.key}>
              <line x1={pad} y1={y} x2={w - pad} y2={y} stroke={line.color} strokeDasharray="5 4" />
              <circle cx={x} cy={y} r="4" fill={line.color} />
            </g>
          );
        })}

        <line
          x1={x}
          y1={yToSvg(0, maxAlt, h, pad)}
          x2={x}
          y2={yToSvg(maxAlt, maxAlt, h, pad)}
          stroke="#475569"
          strokeDasharray="3 3"
        />
        <circle cx={x} cy={yToSvg(pressureAltitudeFt, maxAlt, h, pad)} r="4" fill="#111827" />
        <circle cx={x} cy={yToSvg(densityAltitudeFt, maxAlt, h, pad)} r="4" fill="#7c3aed" />
      </svg>
      <div className="mt-2 grid gap-1 text-xs text-zinc-700 md:grid-cols-3">
        <div>Gross Weight: {grossWeightLbs.toFixed(1)} lbs</div>
        <div>Pressure Altitude: {pressureAltitudeFt.toFixed(0)} ft</div>
        <div>Density Altitude: {densityAltitudeFt.toFixed(0)} ft</div>
      </div>
    </div>
  );
}

