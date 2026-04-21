"use client";

import type { EnvelopePoint } from "@/lib/ofp/types";

type Props = {
  title: string;
  points: EnvelopePoint[];
  xLabel: string;
  onChange: (next: EnvelopePoint[]) => void;
};

function n(v: string): number {
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function CGEnvelopeTable({ title, points, xLabel, onChange }: Props) {
  return (
    <div className="rounded border bg-white p-2">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          className="rounded bg-zinc-800 px-2 py-1 text-xs text-white"
          onClick={() => onChange([...points, { x: 0, y: 0 }])}
        >
          Add Point
        </button>
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-zinc-100">
            <th className="border p-1 text-left">#</th>
            <th className="border p-1 text-left">{xLabel}</th>
            <th className="border p-1 text-left">Weight (lbs)</th>
            <th className="border p-1 text-left">-</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p, i) => (
            <tr key={`${title}-${i}`}>
              <td className="border p-1">{i + 1}</td>
              <td className="border p-1">
                <input
                  className="w-full rounded border px-1 py-0.5"
                  type="number"
                  step="0.01"
                  value={p.x}
                  onChange={(e) =>
                    onChange(points.map((row, j) => (j === i ? { ...row, x: n(e.target.value) } : row)))
                  }
                />
              </td>
              <td className="border p-1">
                <input
                  className="w-full rounded border px-1 py-0.5"
                  type="number"
                  step="0.1"
                  value={p.y}
                  onChange={(e) =>
                    onChange(points.map((row, j) => (j === i ? { ...row, y: n(e.target.value) } : row)))
                  }
                />
              </td>
              <td className="border p-1">
                <button
                  className="rounded bg-red-700 px-2 py-1 text-white"
                  onClick={() => onChange(points.filter((_, j) => j !== i))}
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
