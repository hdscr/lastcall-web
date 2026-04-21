"use client";

import { evaluateFlightPlan, toHHMM } from "@/lib/ofp/calc";
import { defaultConfig, defaultPlan } from "@/lib/ofp/seeds";
import type { EnvelopePoint, FlightPlan, HOGELineConfig, LegInput, LegType } from "@/lib/ofp/types";
import { CGEnvelopePlot } from "./cg-envelope-plot";
import { CGEnvelopeTable } from "./cg-envelope-table";
import { HOGEChart } from "./hoge-chart";
import { HOGELineEditor } from "./hoge-line-editor";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type PlanListItem = {
  id: string;
  aircraft_type: string;
  registration: string;
  from_icao: string;
  to_icao: string;
  flight_date: string;
  pilots: string;
  created_at: string;
};

const LONG_ENV_KEY = "ofp_cg_long_envelope";
const LAT_ENV_KEY = "ofp_cg_lat_envelope";
const HOGE_LINES_KEY = "ofp_hoge_lines";

const defaultHogeLines: HOGELineConfig[] = [
  { id: "l1", title: "-30°C", showTitle: true, x1: 1900, y1: 14.0, x2: 2500, y2: 7.25, color: "schwarz", style: "durchgehend", width: "mittel" },
  { id: "l2", title: "-20°C", showTitle: true, x1: 1929, y1: 13.02, x2: 2500, y2: 6.64, color: "schwarz", style: "durchgehend", width: "mittel" },
  { id: "l3", title: "-10°C", showTitle: true, x1: 1957, y1: 12.08, x2: 2500, y2: 6.04, color: "schwarz", style: "durchgehend", width: "mittel" },
  { id: "l4", title: "0°C", showTitle: true, x1: 1986, y1: 11.1, x2: 2500, y2: 5.43, color: "schwarz", style: "durchgehend", width: "mittel" },
  { id: "l5", title: "10°C", showTitle: true, x1: 2013, y1: 10.19, x2: 2500, y2: 4.82, color: "schwarz", style: "durchgehend", width: "mittel" },
  { id: "l6", title: "20°C", showTitle: true, x1: 2041, y1: 9.24, x2: 2500, y2: 4.22, color: "schwarz", style: "durchgehend", width: "mittel" },
  { id: "l7", title: "30°C", showTitle: true, x1: 2069, y1: 8.3, x2: 2500, y2: 3.61, color: "schwarz", style: "durchgehend", width: "mittel" },
  { id: "l8", title: "40°C", showTitle: true, x1: 2097, y1: 7.35, x2: 2500, y2: 3.0, color: "schwarz", style: "durchgehend", width: "mittel" },
  { id: "h1", title: "0° helper", showTitle: false, x1: 2500, y1: 4.9, x2: 2490, y2: 5.54, color: "schwarz", style: "durchgehend", width: "fein" },
  { id: "h2", title: "10° helper", showTitle: false, x1: 2500, y1: 3.95, x2: 2475, y2: 5.097372177, color: "schwarz", style: "durchgehend", width: "fein" },
  { id: "h3", title: "20° helper", showTitle: false, x1: 2500, y1: 2.75, x2: 2450, y2: 4.762521786, color: "schwarz", style: "durchgehend", width: "fein" },
  { id: "h4", title: "30° helper", showTitle: false, x1: 2500, y1: 1.8, x2: 2430, y2: 4.369432715, color: "schwarz", style: "durchgehend", width: "fein" },
  { id: "h5", title: "40° helper", showTitle: false, x1: 2500, y1: 0.85, x2: 2425, y2: 3.810599876, color: "schwarz", style: "durchgehend", width: "fein" },
];

function numberValue(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function updateLeg(legs: LegInput[], index: number, patch: Partial<LegInput>): LegInput[] {
  return legs.map((leg, i) => (i === index ? { ...leg, ...patch } : leg));
}

function initialPlan(): FlightPlan {
  if (typeof window === "undefined") return defaultPlan;
  const raw = localStorage.getItem("ofp_current_plan");
  if (!raw) return defaultPlan;
  try {
    const parsed = JSON.parse(raw) as FlightPlan;
    return {
      ...defaultPlan,
      ...parsed,
      weather: {
        ...defaultPlan.weather,
        ...parsed.weather,
      },
    };
  } catch {
    return defaultPlan;
  }
}

function initialLongEnvelope(): EnvelopePoint[] {
  if (typeof window === "undefined") return defaultConfig.weightConfig.cgEnvelope.longitudinalPoints;
  const raw = localStorage.getItem(LONG_ENV_KEY);
  if (!raw) return defaultConfig.weightConfig.cgEnvelope.longitudinalPoints;
  try {
    return JSON.parse(raw) as EnvelopePoint[];
  } catch {
    return defaultConfig.weightConfig.cgEnvelope.longitudinalPoints;
  }
}

function initialLatEnvelope(): EnvelopePoint[] {
  if (typeof window === "undefined") return defaultConfig.weightConfig.cgEnvelope.lateralPoints;
  const raw = localStorage.getItem(LAT_ENV_KEY);
  if (!raw) return defaultConfig.weightConfig.cgEnvelope.lateralPoints;
  try {
    return JSON.parse(raw) as EnvelopePoint[];
  } catch {
    return defaultConfig.weightConfig.cgEnvelope.lateralPoints;
  }
}

function initialHogeLines(): HOGELineConfig[] {
  if (typeof window === "undefined") return defaultHogeLines;
  const raw = localStorage.getItem(HOGE_LINES_KEY);
  if (!raw) return defaultHogeLines;
  try {
    return JSON.parse(raw) as HOGELineConfig[];
  } catch {
    return defaultHogeLines;
  }
}

export function FlightPlanEditor({ initialSavedPlans }: { initialSavedPlans: PlanListItem[] }) {
  const [plan, setPlan] = useState<FlightPlan>(() => initialPlan());
  const [longEnvelope, setLongEnvelope] = useState<EnvelopePoint[]>(() => initialLongEnvelope());
  const [latEnvelope, setLatEnvelope] = useState<EnvelopePoint[]>(() => initialLatEnvelope());
  const [hogeLines, setHogeLines] = useState<HOGELineConfig[]>(() => initialHogeLines());
  const [savedPlans, setSavedPlans] = useState<PlanListItem[]>(initialSavedPlans);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const config = useMemo(
    () => ({
      ...defaultConfig,
      weightConfig: {
        ...defaultConfig.weightConfig,
        cgEnvelope: {
          ...defaultConfig.weightConfig.cgEnvelope,
          longitudinalPoints: longEnvelope,
          lateralPoints: latEnvelope,
        },
      },
    }),
    [longEnvelope, latEnvelope],
  );

  const evaluated = useMemo(() => evaluateFlightPlan(plan, config), [plan, config]);

  useEffect(() => {
    localStorage.setItem("ofp_current_plan", JSON.stringify(plan));
  }, [plan]);
  useEffect(() => {
    localStorage.setItem(LONG_ENV_KEY, JSON.stringify(longEnvelope));
  }, [longEnvelope]);
  useEffect(() => {
    localStorage.setItem(LAT_ENV_KEY, JSON.stringify(latEnvelope));
  }, [latEnvelope]);
  useEffect(() => {
    localStorage.setItem(HOGE_LINES_KEY, JSON.stringify(hogeLines));
  }, [hogeLines]);

  async function refreshList() {
    const res = await fetch("/api/flight-plans", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { items: PlanListItem[] };
    setSavedPlans(data.items ?? []);
  }

  async function savePlan() {
    setStatus("Saving...");
    const method = selectedPlanId ? "PUT" : "POST";
    const url = selectedPlanId ? `/api/flight-plans/${selectedPlanId}` : "/api/flight-plans";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to save" }));
      setStatus(`Save failed: ${String(err.error ?? "Unknown error")}`);
      return;
    }

    const data = (await res.json()) as { id: string };
    setSelectedPlanId(data.id);
    await refreshList();
    setStatus("Saved.");
  }

  async function loadPlan(id: string) {
    setStatus("Loading...");
    const res = await fetch(`/api/flight-plans/${id}`, { cache: "no-store" });
    if (!res.ok) {
      setStatus("Load failed.");
      return;
    }
    const data = (await res.json()) as { id: string; data: FlightPlan };
    setPlan(data.data);
    setSelectedPlanId(data.id);
    setStatus("Loaded.");
  }

  function addLeg() {
    const seq = plan.legs.length + 1;
    setPlan({
      ...plan,
      legs: [
        ...plan.legs,
        {
          seq,
          waypointName: `WP${seq}`,
          legType: "CRUISE",
          trackMag_deg: 0,
          distance_nm: 0,
          plannedAlt_ft: 3000,
          groundSpeed_kt: plan.TAS,
          maxAltLimit: "",
          frequenciesInfo: "",
          description: "",
        },
      ],
    });
  }

  function removeLeg(index: number) {
    const next = plan.legs.filter((_, i) => i !== index).map((leg, i) => ({ ...leg, seq: i + 1 }));
    setPlan({ ...plan, legs: next });
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">RH44 Flight Plan (OFP)</h1>
        <div className="flex gap-2">
          <button className="rounded bg-black px-3 py-2 text-white" onClick={() => setPlan(defaultPlan)}>
            New
          </button>
          <button className="rounded bg-blue-700 px-3 py-2 text-white" onClick={() => void savePlan()}>
            Save
          </button>
          <button className="rounded bg-zinc-700 px-3 py-2 text-white" onClick={() => void refreshList()}>
            Refresh List
          </button>
          <Link className="rounded bg-zinc-700 px-3 py-2 text-white" href="/print">
            Print View
          </Link>
        </div>
      </header>

      <p className="text-sm text-zinc-600">{status || "Ready"}</p>

      <section className="grid gap-3 rounded border p-3 md:grid-cols-3">
        <h2 className="text-lg font-medium md:col-span-3">Header</h2>
        <label className="flex flex-col gap-1">
          Aircraft
          <input value={plan.aircraftType} onChange={(e) => setPlan({ ...plan, aircraftType: e.target.value })} className="rounded border px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          Registration
          <input value={plan.registration} onChange={(e) => setPlan({ ...plan, registration: e.target.value })} className="rounded border px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          Date
          <input type="date" value={plan.date} onChange={(e) => setPlan({ ...plan, date: e.target.value })} className="rounded border px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          From
          <input value={plan.fromICAO} onChange={(e) => setPlan({ ...plan, fromICAO: e.target.value.toUpperCase() })} className="rounded border px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          To
          <input value={plan.toICAO} onChange={(e) => setPlan({ ...plan, toICAO: e.target.value.toUpperCase() })} className="rounded border px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          Pilot(s)
          <input value={plan.pilots} onChange={(e) => setPlan({ ...plan, pilots: e.target.value })} className="rounded border px-2 py-1" />
        </label>
      </section>

      <section className="grid gap-3 rounded border p-3 md:grid-cols-4">
        <h2 className="text-lg font-medium md:col-span-4">Weather + Temperature</h2>
        <label className="flex flex-col gap-1">QNH (hPa)<input type="number" value={plan.weather.qnh} onChange={(e) => setPlan({ ...plan, weather: { ...plan.weather, qnh: numberValue(e.target.value) } })} className="rounded border px-2 py-1" /></label>
        <label className="flex flex-col gap-1">Wind Dir (mag)<input type="number" value={plan.weather.windDirMag} onChange={(e) => setPlan({ ...plan, weather: { ...plan.weather, windDirMag: numberValue(e.target.value) } })} className="rounded border px-2 py-1" /></label>
        <label className="flex flex-col gap-1">Wind kt<input type="number" value={plan.weather.windSpeedKt} onChange={(e) => setPlan({ ...plan, weather: { ...plan.weather, windSpeedKt: numberValue(e.target.value) } })} className="rounded border px-2 py-1" /></label>
        <label className="flex flex-col gap-1">Field Elevation ft<input type="number" value={plan.weather.fieldElevation_ft} onChange={(e) => setPlan({ ...plan, weather: { ...plan.weather, fieldElevation_ft: numberValue(e.target.value) } })} className="rounded border px-2 py-1" /></label>
        <label className="flex flex-col gap-1">TAS kt<input type="number" value={plan.TAS} onChange={(e) => setPlan({ ...plan, TAS: numberValue(e.target.value) })} className="rounded border px-2 py-1" /></label>
        <label className="flex flex-col gap-1">OAT @ {plan.temperatures.alt1_ft}ft<input type="number" value={plan.temperatures.oat1_C} onChange={(e) => setPlan({ ...plan, temperatures: { ...plan.temperatures, oat1_C: numberValue(e.target.value) } })} className="rounded border px-2 py-1" /></label>
        <label className="flex flex-col gap-1">OAT @ {plan.temperatures.alt2_ft}ft<input type="number" value={plan.temperatures.oat2_C} onChange={(e) => setPlan({ ...plan, temperatures: { ...plan.temperatures, oat2_C: numberValue(e.target.value) } })} className="rounded border px-2 py-1" /></label>
        <div className="flex flex-col justify-end rounded bg-zinc-100 p-2"><span className="text-sm text-zinc-600">Delta ISA Dev</span><strong>{evaluated.deltaISADev_C} C</strong></div>
      </section>

      <section className="grid gap-3 rounded border p-3 md:grid-cols-4">
        <h2 className="text-lg font-medium md:col-span-4">Payload / CG / HOGE</h2>
        {([
          ["pax_rightFront_kg", "PAX RF kg"],
          ["pax_leftFront_kg", "PAX LF kg"],
          ["pax_rightBack_kg", "PAX RB kg"],
          ["pax_leftBack_kg", "PAX LB kg"],
          ["baggage_rightFront_kg", "Bag RF kg"],
          ["baggage_leftFront_kg", "Bag LF kg"],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex flex-col gap-1">{label}
            <input type="number" value={plan.payload[key]} onChange={(e) => setPlan({ ...plan, payload: { ...plan.payload, [key]: numberValue(e.target.value) } })} className="rounded border px-2 py-1" />
          </label>
        ))}
        <div className="rounded bg-zinc-100 p-2">TOM: <strong>{evaluated.payloadOutputs.TOM_lbs} lbs</strong></div>
        <div className="rounded bg-zinc-100 p-2">CG long: <strong>{evaluated.payloadOutputs.CG_long}</strong></div>
        <div className="rounded bg-zinc-100 p-2">CG lat: <strong>{evaluated.payloadOutputs.CG_lat}</strong></div>
        <div className="rounded bg-zinc-100 p-2">HOGE: <strong>{evaluated.payloadOutputs.HOGE_ft} ft</strong></div>
        <div className="rounded bg-zinc-100 p-2">
          Envelope:{" "}
          <strong className={evaluated.payloadOutputs.inEnvelope ? "text-green-700" : "text-red-700"}>
            {evaluated.payloadOutputs.inEnvelope ? "IN" : "OUT"}
          </strong>
        </div>
        <div className="grid gap-3 md:col-span-4 md:grid-cols-2">
          <CGEnvelopeTable
            title="Longitudinal Envelope Points"
            xLabel="CG long (in)"
            yLabel="Weight (lbs)"
            xMin={config.weightConfig.cgEnvelope.longMin}
            xMax={config.weightConfig.cgEnvelope.longMax}
            points={longEnvelope}
            onChange={setLongEnvelope}
          />
          <CGEnvelopeTable
            title="Lateral Envelope Points"
            xLabel="CG long (in)"
            yLabel="CG lat (in)"
            xMin={config.weightConfig.cgEnvelope.longMin}
            xMax={config.weightConfig.cgEnvelope.longMax}
            yMin={config.weightConfig.cgEnvelope.latMin}
            yMax={config.weightConfig.cgEnvelope.latMax}
            points={latEnvelope}
            onChange={setLatEnvelope}
          />
        </div>
        <div className="md:col-span-4">
          <CGEnvelopePlot
            longPoints={longEnvelope}
            latPoints={latEnvelope}
            currentLong={evaluated.payloadOutputs.CG_long}
            currentLat={evaluated.payloadOutputs.CG_lat}
            tomLbs={evaluated.payloadOutputs.TOM_lbs}
            inEnvelope={evaluated.payloadOutputs.inEnvelope}
          />
        </div>
        <HOGEChart
          lines={hogeLines}
          isaDeviationC={evaluated.deltaISADev_C}
          grossWeightLbs={evaluated.payloadOutputs.TOM_lbs}
        />
        <HOGELineEditor lines={hogeLines} onChange={setHogeLines} />
      </section>

      <section className="grid gap-3 rounded border p-3 md:grid-cols-4">
        <h2 className="text-lg font-medium md:col-span-4">Fuel + Time Summary</h2>
        {([
          ["fuelFlow_USG_per_hr", "Fuel Flow USG/hr"],
          ["taxiFuel_USG", "Taxi Fuel"],
          ["tripFuel_USG", "Trip Fuel"],
          ["contingencyFuel_USG", "Cont Fuel"],
          ["addApproachFuel_USG", "Approach Fuel"],
          ["addReserveFuel_USG", "Reserve Fuel"],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex flex-col gap-1">{label}
            <input type="number" step="0.1" value={plan.fuelPlan[key]} onChange={(e) => setPlan({ ...plan, fuelPlan: { ...plan.fuelPlan, [key]: numberValue(e.target.value) } })} className="rounded border px-2 py-1" />
          </label>
        ))}
        <label className="flex flex-col gap-1">Additional DEP min<input type="number" value={plan.additionalTimes.dep_minutes} onChange={(e) => setPlan({ ...plan, additionalTimes: { ...plan.additionalTimes, dep_minutes: numberValue(e.target.value) } })} className="rounded border px-2 py-1" /></label>
        <label className="flex flex-col gap-1">Additional DEST min<input type="number" value={plan.additionalTimes.dest_minutes} onChange={(e) => setPlan({ ...plan, additionalTimes: { ...plan.additionalTimes, dest_minutes: numberValue(e.target.value) } })} className="rounded border px-2 py-1" /></label>
        <div className="rounded bg-zinc-100 p-2">Total Leg Time: <strong>{toHHMM(evaluated.totals.totalLegTimeMinutes)}</strong></div>
        <div className="rounded bg-zinc-100 p-2">Block Time: <strong>{toHHMM(evaluated.totals.blockTimeMinutes)}</strong></div>
        <div className="rounded bg-zinc-100 p-2">Total Burn: <strong>{evaluated.totals.totalBurnOff_USG} USG</strong></div>
        <div className="rounded bg-zinc-100 p-2">Block Fuel: <strong>{evaluated.totals.blockFuel_USG} USG</strong></div>
      </section>

      <section className="rounded border p-3">
        <div className="mb-2 flex items-center justify-between"><h2 className="text-lg font-medium">Legs</h2><button className="rounded bg-zinc-800 px-3 py-1 text-white" onClick={addLeg}>Add Leg</button></div>
        <div className="overflow-auto">
          <table className="w-full min-w-[1280px] border-collapse text-sm">
            <thead><tr className="bg-zinc-100 text-left"><th className="border p-1">#</th><th className="border p-1">WP</th><th className="border p-1">Type</th><th className="border p-1">Track</th><th className="border p-1">Dist</th><th className="border p-1">Alt</th><th className="border p-1">GS</th><th className="border p-1">TIME</th><th className="border p-1">B/O</th><th className="border p-1">MH</th><th className="border p-1">MCP</th><th className="border p-1">MTP</th><th className="border p-1">VNE</th><th className="border p-1">MAX ALT</th><th className="border p-1">FRQ/INFO</th><th className="border p-1">Desc</th><th className="border p-1">-</th></tr></thead>
            <tbody>
              {plan.legs.map((leg, i) => {
                const c = evaluated.legs[i];
                return (
                  <tr key={leg.seq}>
                    <td className="border p-1">{leg.seq}</td>
                    <td className="border p-1"><input value={leg.waypointName} onChange={(e) => setPlan({ ...plan, legs: updateLeg(plan.legs, i, { waypointName: e.target.value }) })} className="w-24 rounded border px-1" /></td>
                    <td className="border p-1"><select value={leg.legType} onChange={(e) => setPlan({ ...plan, legs: updateLeg(plan.legs, i, { legType: e.target.value as LegType }) })} className="rounded border px-1"><option value="CRUISE">CRUISE</option><option value="CLB">CLB</option><option value="DES">DES</option></select></td>
                    <td className="border p-1"><input type="number" value={leg.trackMag_deg} onChange={(e) => setPlan({ ...plan, legs: updateLeg(plan.legs, i, { trackMag_deg: numberValue(e.target.value) }) })} className="w-16 rounded border px-1" /></td>
                    <td className="border p-1"><input type="number" value={leg.distance_nm} onChange={(e) => setPlan({ ...plan, legs: updateLeg(plan.legs, i, { distance_nm: numberValue(e.target.value) }) })} className="w-16 rounded border px-1" /></td>
                    <td className="border p-1"><input type="number" value={leg.plannedAlt_ft} onChange={(e) => setPlan({ ...plan, legs: updateLeg(plan.legs, i, { plannedAlt_ft: numberValue(e.target.value) }) })} className="w-20 rounded border px-1" /></td>
                    <td className="border p-1"><input type="number" value={leg.groundSpeed_kt} onChange={(e) => setPlan({ ...plan, legs: updateLeg(plan.legs, i, { groundSpeed_kt: numberValue(e.target.value) }) })} className="w-16 rounded border px-1" /></td>
                    <td className="border p-1">{c?.legTime_hhmm}</td><td className="border p-1">{c?.burnOff_USG}</td><td className="border p-1">{c?.magHeadingCorrected_deg}</td><td className="border p-1">{String(c?.MCP_inHg ?? "")}</td><td className="border p-1">{String(c?.MTP_inHg ?? "")}</td><td className="border p-1">{String(c?.VNE_kt ?? "")}</td>
                    <td className="border p-1"><input value={leg.maxAltLimit ?? ""} onChange={(e) => setPlan({ ...plan, legs: updateLeg(plan.legs, i, { maxAltLimit: e.target.value }) })} className="w-20 rounded border px-1" /></td>
                    <td className="border p-1"><input value={leg.frequenciesInfo ?? ""} onChange={(e) => setPlan({ ...plan, legs: updateLeg(plan.legs, i, { frequenciesInfo: e.target.value }) })} className="w-36 rounded border px-1" /></td>
                    <td className="border p-1"><input value={leg.description ?? ""} onChange={(e) => setPlan({ ...plan, legs: updateLeg(plan.legs, i, { description: e.target.value }) })} className="w-44 rounded border px-1" /></td>
                    <td className="border p-1"><button className="rounded bg-red-700 px-2 py-1 text-white" onClick={() => removeLeg(i)}>X</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded border p-3">
        <h2 className="mb-2 text-lg font-medium">Warnings</h2>
        {evaluated.warnings.length === 0 ? <p className="text-sm text-green-700">No warnings.</p> : null}
        {evaluated.warnings.map((w) => <p key={w} className="text-sm text-red-700">{w}</p>)}
      </section>

      <section className="rounded border p-3">
        <h2 className="mb-2 text-lg font-medium">Saved Flight Plans</h2>
        <div className="grid gap-2">
          {savedPlans.map((item) => (
            <button key={item.id} className="rounded border p-2 text-left hover:bg-zinc-50" onClick={() => void loadPlan(item.id)}>
              <strong>{item.flight_date}</strong> {item.from_icao} - {item.to_icao} | {item.registration} | {item.pilots}
            </button>
          ))}
          {savedPlans.length === 0 ? <p className="text-sm text-zinc-600">No stored plans yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
