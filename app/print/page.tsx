"use client";

import { evaluateFlightPlan, toHHMM } from "@/lib/ofp/calc";
import { defaultConfig, defaultPlan } from "@/lib/ofp/seeds";
import type { FlightPlan } from "@/lib/ofp/types";
import Link from "next/link";
import { useMemo } from "react";

function loadPlan(): FlightPlan {
  if (typeof window === "undefined") return defaultPlan;
  const raw = localStorage.getItem("ofp_current_plan");
  if (!raw) return defaultPlan;
  try {
    return JSON.parse(raw) as FlightPlan;
  } catch {
    return defaultPlan;
  }
}

export default function PrintPage() {
  const plan = loadPlan();
  const evaluated = useMemo(() => evaluateFlightPlan(plan, defaultConfig), [plan]);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href="/" className="rounded bg-zinc-800 px-3 py-2 text-white">Back</Link>
        <button className="rounded bg-blue-700 px-3 py-2 text-white" onClick={() => window.print()}>Print / PDF</button>
      </div>

      <h1 className="text-xl font-semibold">OFP Print Out</h1>
      <p className="mb-3 text-sm">{plan.date} | {plan.registration} | {plan.fromICAO} ? {plan.toICAO} | {plan.pilots}</p>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-zinc-100">
            <th className="border p-1">TIME</th>
            <th className="border p-1">B/O</th>
            <th className="border p-1">MH</th>
            <th className="border p-1">ALT</th>
            <th className="border p-1">MCP</th>
            <th className="border p-1">MTP</th>
            <th className="border p-1">VNE</th>
            <th className="border p-1">MAX ALT</th>
            <th className="border p-1">FRQ/AD/ATIS/INFO</th>
            <th className="border p-1">Description</th>
          </tr>
        </thead>
        <tbody>
          {evaluated.legs.map((leg) => (
            <tr key={leg.seq}>
              <td className="border p-1">{leg.legTime_hhmm}</td>
              <td className="border p-1">{leg.burnOff_USG}</td>
              <td className="border p-1">{leg.magHeadingCorrected_deg}</td>
              <td className="border p-1">{leg.plannedAlt_ft}</td>
              <td className="border p-1">{String(leg.MCP_inHg)}</td>
              <td className="border p-1">{String(leg.MTP_inHg)}</td>
              <td className="border p-1">{String(leg.VNE_kt)}</td>
              <td className="border p-1">{leg.maxAltLimit}</td>
              <td className="border p-1">{leg.frequenciesInfo}</td>
              <td className="border p-1">{leg.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded border p-2">Total Time: <strong>{toHHMM(evaluated.totals.totalLegTimeMinutes)}</strong></div>
        <div className="rounded border p-2">Block Time: <strong>{toHHMM(evaluated.totals.blockTimeMinutes)}</strong></div>
        <div className="rounded border p-2">Total Burn Off: <strong>{evaluated.totals.totalBurnOff_USG} USG</strong></div>
        <div className="rounded border p-2">Block Fuel: <strong>{evaluated.totals.blockFuel_USG} USG</strong></div>
      </div>
    </div>
  );
}

