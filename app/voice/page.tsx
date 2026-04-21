"use client";

import { defaultVoiceScripts } from "@/lib/ofp/seeds";
import type { VoiceScript } from "@/lib/ofp/types";
import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "ofp_voice_scripts";

function initialRows(): VoiceScript[] {
  if (typeof window === "undefined") return defaultVoiceScripts;
  const raw = localStorage.getItem(KEY);
  if (!raw) return defaultVoiceScripts;
  try {
    return JSON.parse(raw) as VoiceScript[];
  } catch {
    return defaultVoiceScripts;
  }
}

export default function VoicePage() {
  const [rows, setRows] = useState<VoiceScript[]>(() => initialRows());

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(rows));
  }, [rows]);

  return (
    <div className="mx-auto w-full max-w-5xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Voice Scripts</h1>
        <div className="flex gap-2">
          <Link href="/" className="rounded bg-zinc-800 px-3 py-2 text-white">Back</Link>
          <button className="rounded bg-blue-700 px-3 py-2 text-white" onClick={() => window.print()}>Print</button>
        </div>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-zinc-100">
            <th className="border p-1">Location</th>
            <th className="border p-1">Call Text</th>
            <th className="border p-1">-</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row.location}-${i}`}>
              <td className="border p-1"><input className="w-full rounded border px-2 py-1" value={row.location} onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, location: e.target.value } : r)))} /></td>
              <td className="border p-1"><input className="w-full rounded border px-2 py-1" value={row.callText} onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, callText: e.target.value } : r)))} /></td>
              <td className="border p-1"><button className="rounded bg-red-700 px-2 py-1 text-white" onClick={() => setRows(rows.filter((_, j) => j !== i))}>X</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="mt-3 rounded bg-zinc-800 px-3 py-2 text-white" onClick={() => setRows([...rows, { location: "", callText: "" }])}>Add Row</button>
    </div>
  );
}
