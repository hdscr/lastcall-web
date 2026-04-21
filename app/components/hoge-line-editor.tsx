"use client";

import type { HOGELineConfig } from "@/lib/ofp/types";

type Props = {
  lines: HOGELineConfig[];
  onChange: (next: HOGELineConfig[]) => void;
};

function n(v: string): number {
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function HOGELineEditor({ lines, onChange }: Props) {
  function patchLine(id: string, patch: Partial<HOGELineConfig>) {
    onChange(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addLine() {
    onChange([
      ...lines,
      {
        id: crypto.randomUUID(),
        x1: 2500,
        y1: 5,
        x2: 2400,
        y2: 4,
        color: "schwarz",
        style: "durchgehend",
        width: "fein",
      },
    ]);
  }

  function removeLine(id: string) {
    onChange(lines.filter((l) => l.id !== id));
  }

  return (
    <div className="rounded border bg-white p-3 md:col-span-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">HOGE Line Configuration</h3>
        <button className="rounded bg-zinc-800 px-3 py-1 text-xs text-white" onClick={addLine}>
          Add Line
        </button>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[980px] border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-100">
              <th className="border p-1">x1</th>
              <th className="border p-1">y1</th>
              <th className="border p-1">x2</th>
              <th className="border p-1">y2</th>
              <th className="border p-1">Farbe</th>
              <th className="border p-1">Linie</th>
              <th className="border p-1">Breite</th>
              <th className="border p-1">-</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id}>
                <td className="border p-1">
                  <input className="w-20 rounded border px-1" type="number" value={line.x1} onChange={(e) => patchLine(line.id, { x1: n(e.target.value) })} />
                </td>
                <td className="border p-1">
                  <input className="w-20 rounded border px-1" type="number" step="0.0001" value={line.y1} onChange={(e) => patchLine(line.id, { y1: n(e.target.value) })} />
                </td>
                <td className="border p-1">
                  <input className="w-20 rounded border px-1" type="number" value={line.x2} onChange={(e) => patchLine(line.id, { x2: n(e.target.value) })} />
                </td>
                <td className="border p-1">
                  <input className="w-20 rounded border px-1" type="number" step="0.0001" value={line.y2} onChange={(e) => patchLine(line.id, { y2: n(e.target.value) })} />
                </td>
                <td className="border p-1">
                  <select className="rounded border px-1" value={line.color} onChange={(e) => patchLine(line.id, { color: e.target.value as HOGELineConfig["color"] })}>
                    <option value="schwarz">schwarz</option>
                    <option value="rot">rot</option>
                    <option value="blau">blau</option>
                  </select>
                </td>
                <td className="border p-1">
                  <select className="rounded border px-1" value={line.style} onChange={(e) => patchLine(line.id, { style: e.target.value as HOGELineConfig["style"] })}>
                    <option value="durchgehend">durchgehend</option>
                    <option value="gestrichelt">gestrichelt</option>
                  </select>
                </td>
                <td className="border p-1">
                  <select className="rounded border px-1" value={line.width} onChange={(e) => patchLine(line.id, { width: e.target.value as HOGELineConfig["width"] })}>
                    <option value="fein">fein</option>
                    <option value="mittel">mittel</option>
                    <option value="grob">grob</option>
                  </select>
                </td>
                <td className="border p-1">
                  <button className="rounded bg-red-700 px-2 py-1 text-white" onClick={() => removeLine(line.id)}>
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

