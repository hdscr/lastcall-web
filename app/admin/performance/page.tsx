"use client";

import { defaultAircraftProfiles, defaultConfig } from "@/lib/ofp/seeds";
import type { AircraftProfile, MCPValue, VNEValue } from "@/lib/ofp/types";
import Link from "next/link";
import { useState } from "react";

const KEY_MCP = "ofp_admin_mcp";
const KEY_VNE = "ofp_admin_vne";
const KEY_AIRCRAFT = "ofp_admin_aircraft_profiles";

function renderCell(value: MCPValue | VNEValue): string {
  return typeof value === "number" ? String(value) : value;
}

function loadMcp() {
  if (typeof window === "undefined") return defaultConfig.mcpTable.grid;
  const raw = localStorage.getItem(KEY_MCP);
  return raw ? JSON.parse(raw) : defaultConfig.mcpTable.grid;
}

function loadVne() {
  if (typeof window === "undefined") return defaultConfig.vneTable.grid;
  const raw = localStorage.getItem(KEY_VNE);
  return raw ? JSON.parse(raw) : defaultConfig.vneTable.grid;
}

function loadAircraftProfiles() {
  if (typeof window === "undefined") return defaultAircraftProfiles;
  const raw = localStorage.getItem(KEY_AIRCRAFT);
  return raw ? (JSON.parse(raw) as AircraftProfile[]) : defaultAircraftProfiles;
}

export default function AdminPerformancePage() {
  const [mcpGrid, setMcpGrid] = useState<MCPValue[][]>(loadMcp);
  const [vneGrid, setVneGrid] = useState<VNEValue[][]>(loadVne);
  const [aircraftProfiles, setAircraftProfiles] = useState<AircraftProfile[]>(loadAircraftProfiles);

  function save() {
    localStorage.setItem(KEY_MCP, JSON.stringify(mcpGrid));
    localStorage.setItem(KEY_VNE, JSON.stringify(vneGrid));
    localStorage.setItem(KEY_AIRCRAFT, JSON.stringify(aircraftProfiles));
  }

  function updateAircraft(index: number, patch: Partial<AircraftProfile>) {
    setAircraftProfiles((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addAircraft() {
    setAircraftProfiles((prev) => [
      ...prev,
      {
        registration: `HB-NEW${prev.length + 1}`,
        emptyMass_lbs: defaultConfig.weightConfig.emptyWeight_lbs,
        longCg_in: defaultConfig.weightConfig.emptyLongArm_in,
        mtw_lbs: defaultConfig.weightConfig.maxTakeoffWeight_lbs,
      },
    ]);
  }

  function removeAircraft(index: number) {
    setAircraftProfiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin - Performance Tables</h1>
        <div className="flex gap-2">
          <Link href="/" className="rounded bg-zinc-800 px-3 py-2 text-white">Back</Link>
          <button className="rounded bg-blue-700 px-3 py-2 text-white" onClick={save}>Save Local</button>
        </div>
      </div>
      <p className="mb-4 text-sm text-zinc-600">Version: v1.0 - 07 AUG 24 (editable)</p>
      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-2 font-medium">MCP Grid</h2>
          <div className="overflow-auto">
            <table className="border-collapse text-sm"><tbody>{mcpGrid.map((row: MCPValue[], i: number) => (
              <tr key={`mcp-${i}`}>{row.map((cell: MCPValue, j: number) => (
                <td key={`mcp-${i}-${j}`} className="border p-1"><input className="w-16 rounded border px-1" value={renderCell(cell)} onChange={(e) => {
                  const next = mcpGrid.map((r: MCPValue[]) => [...r]);
                  const v = e.target.value.trim();
                  next[i][j] = v.toUpperCase() === "FT" ? "FT" : Number(v);
                  setMcpGrid(next as typeof mcpGrid);
                }} /></td>
              ))}</tr>
            ))}</tbody></table>
          </div>
        </section>

        <section>
          <h2 className="mb-2 font-medium">VNE Grid</h2>
          <div className="overflow-auto">
            <table className="border-collapse text-sm"><tbody>{vneGrid.map((row: VNEValue[], i: number) => (
              <tr key={`vne-${i}`}>{row.map((cell: VNEValue, j: number) => (
                <td key={`vne-${i}-${j}`} className="border p-1"><input className="w-20 rounded border px-1" value={renderCell(cell)} onChange={(e) => {
                  const next = vneGrid.map((r: VNEValue[]) => [...r]);
                  const v = e.target.value.trim();
                  if (v.toUpperCase() === "FT" || v.toUpperCase() === "NO FLIGHT") {
                    next[i][j] = v.toUpperCase() === "NO FLIGHT" ? "No Flight" : "FT";
                  } else {
                    next[i][j] = Number(v);
                  }
                  setVneGrid(next as typeof vneGrid);
                }} /></td>
              ))}</tr>
            ))}</tbody></table>
          </div>
        </section>
      </div>
      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium">Aircraft Profiles (Registration Dropdown)</h2>
          <button className="rounded bg-zinc-800 px-3 py-2 text-white" onClick={addAircraft}>Add Aircraft</button>
        </div>
        <div className="overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-100 text-left">
                <th className="border p-1">Registration</th>
                <th className="border p-1">Empty Mass (lbs)</th>
                <th className="border p-1">Long CG (in)</th>
                <th className="border p-1">MTW (lbs)</th>
                <th className="border p-1">-</th>
              </tr>
            </thead>
            <tbody>
              {aircraftProfiles.map((profile, i) => (
                <tr key={`${profile.registration}-${i}`}>
                  <td className="border p-1">
                    <input
                      className="w-36 rounded border px-1"
                      value={profile.registration}
                      onChange={(e) => updateAircraft(i, { registration: e.target.value.toUpperCase() })}
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="number"
                      className="w-28 rounded border px-1"
                      value={profile.emptyMass_lbs}
                      onChange={(e) => updateAircraft(i, { emptyMass_lbs: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="number"
                      step="0.1"
                      className="w-24 rounded border px-1"
                      value={profile.longCg_in}
                      onChange={(e) => updateAircraft(i, { longCg_in: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="number"
                      className="w-24 rounded border px-1"
                      value={profile.mtw_lbs}
                      onChange={(e) => updateAircraft(i, { mtw_lbs: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td className="border p-1">
                    <button className="rounded bg-red-700 px-2 py-1 text-white" onClick={() => removeAircraft(i)}>X</button>
                  </td>
                </tr>
              ))}
              {aircraftProfiles.length === 0 ? (
                <tr>
                  <td className="border p-2 text-zinc-500" colSpan={5}>No aircraft profiles configured.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
