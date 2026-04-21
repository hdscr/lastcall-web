import type {
  EnvelopePoint,
  EvaluatedLeg,
  EvaluatedPlan,
  FlightPlan,
  MCPValue,
  OFPConfig,
  PerformanceTable,
  VNEValue,
} from "./types";

const KG_TO_LBS = 2.20462262;

function round(value: number, precision = 0): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function toHHMM(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = Math.round(totalMinutes % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function isaTemp(alt_ft: number): number {
  return 15 - (alt_ft / 1000) * 2;
}

export function deltaISADev(plan: FlightPlan): number {
  const d1 = plan.temperatures.oat1_C - isaTemp(plan.temperatures.alt1_ft);
  const d2 = plan.temperatures.oat2_C - isaTemp(plan.temperatures.alt2_ft);
  return round((d1 + d2) / 2, 1);
}

export function calcMagHeading(track: number, windDir: number, windKt: number, tas: number): number {
  if (tas <= 0) return track;
  const ratio = windKt / tas;
  const sinArg = ratio * Math.sin(((track - windDir + 180) * Math.PI) / 180);
  const safe = Math.max(-1, Math.min(1, sinArg));
  const correctionDeg = (Math.asin(safe) * 180) / Math.PI;
  return round(track + correctionDeg, 0);
}

export function legTimeMinutes(distanceNm: number, groundSpeedKt: number): number {
  if (groundSpeedKt <= 0) return 0;
  return Math.round(distanceNm / (groundSpeedKt / 60));
}

function bracket(values: number[], x: number): { lowIndex: number; highIndex: number } {
  if (x <= values[0]) return { lowIndex: 0, highIndex: 0 };
  if (x >= values[values.length - 1]) {
    const i = values.length - 1;
    return { lowIndex: i, highIndex: i };
  }

  for (let i = 0; i < values.length - 1; i += 1) {
    if (x >= values[i] && x <= values[i + 1]) {
      return { lowIndex: i, highIndex: i + 1 };
    }
  }

  return { lowIndex: 0, highIndex: 0 };
}

function isNumeric(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function bilinearNumeric(
  x: number,
  x1: number,
  x2: number,
  y: number,
  y1: number,
  y2: number,
  v11: number,
  v12: number,
  v21: number,
  v22: number,
): number {
  if (x1 === x2 && y1 === y2) return v11;
  if (x1 === x2) {
    const t = (y - y1) / (y2 - y1);
    return v11 + (v12 - v11) * t;
  }
  if (y1 === y2) {
    const t = (x - x1) / (x2 - x1);
    return v11 + (v21 - v11) * t;
  }

  const tx = (x - x1) / (x2 - x1);
  const ty = (y - y1) / (y2 - y1);
  const vLow = v11 + (v21 - v11) * tx;
  const vHigh = v12 + (v22 - v12) * tx;
  return vLow + (vHigh - vLow) * ty;
}

function pointInPolygon(point: EnvelopePoint, polygon: EnvelopePoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function interpolateMCP(table: PerformanceTable<MCPValue>, pa: number, oat: number): MCPValue {
  const paB = bracket(table.paList, pa);
  const tB = bracket(table.tempList, oat);

  const vLL = table.grid[paB.lowIndex][tB.lowIndex];
  const vLH = table.grid[paB.lowIndex][tB.highIndex];
  const vHL = table.grid[paB.highIndex][tB.lowIndex];
  const vHH = table.grid[paB.highIndex][tB.highIndex];

  if (![vLL, vLH, vHL, vHH].every(isNumeric)) {
    return "FT";
  }
  const nLL = vLL as number;
  const nLH = vLH as number;
  const nHL = vHL as number;
  const nHH = vHH as number;

  return round(
    bilinearNumeric(
      pa,
      table.paList[paB.lowIndex],
      table.paList[paB.highIndex],
      oat,
      table.tempList[tB.lowIndex],
      table.tempList[tB.highIndex],
      nLL,
      nLH,
      nHL,
      nHH,
    ),
    1,
  );
}

export function interpolateVNE(table: PerformanceTable<VNEValue>, pa: number, oat: number): VNEValue {
  const paB = bracket(table.paList, pa);
  const tB = bracket(table.tempList, oat);

  const vLL = table.grid[paB.lowIndex][tB.lowIndex];
  const vLH = table.grid[paB.lowIndex][tB.highIndex];
  const vHL = table.grid[paB.highIndex][tB.lowIndex];
  const vHH = table.grid[paB.highIndex][tB.highIndex];
  const values = [vLL, vLH, vHL, vHH];

  if (values.includes("No Flight")) return "No Flight";
  if (values.includes("FT")) return "FT";
  if (![vLL, vLH, vHL, vHH].every(isNumeric)) return vLL;
  const nLL = vLL as number;
  const nLH = vLH as number;
  const nHL = vHL as number;
  const nHH = vHH as number;

  return round(
    bilinearNumeric(
      pa,
      table.paList[paB.lowIndex],
      table.paList[paB.highIndex],
      oat,
      table.tempList[tB.lowIndex],
      table.tempList[tB.highIndex],
      nLL,
      nLH,
      nHL,
      nHH,
    ),
    0,
  );
}

function evaluatePayload(plan: FlightPlan, config: OFPConfig, deltaIsa: number) {
  const wc = config.weightConfig;
  const p = plan.payload;

  const weightsLbs = {
    pax_rightFront: p.pax_rightFront_kg * KG_TO_LBS,
    pax_leftFront: p.pax_leftFront_kg * KG_TO_LBS,
    pax_rightBack: p.pax_rightBack_kg * KG_TO_LBS,
    pax_leftBack: p.pax_leftBack_kg * KG_TO_LBS,
    baggage_rightFront: p.baggage_rightFront_kg * KG_TO_LBS,
    baggage_leftFront: p.baggage_leftFront_kg * KG_TO_LBS,
  };

  const payloadWeight = Object.values(weightsLbs).reduce((a, b) => a + b, 0);
  const TOM_lbs = round(wc.emptyWeight_lbs + payloadWeight, 1);

  let longMoment = wc.emptyWeight_lbs * wc.emptyLongArm_in;
  let latMoment = wc.emptyWeight_lbs * wc.emptyLatArm_in;

  for (const [key, value] of Object.entries(weightsLbs) as Array<[keyof typeof weightsLbs, number]>) {
    const arm = wc.arms[key];
    longMoment += value * arm.long;
    latMoment += value * arm.lat;
  }

  const CG_long = TOM_lbs > 0 ? round(longMoment / TOM_lbs, 2) : 0;
  const CG_lat = TOM_lbs > 0 ? round(latMoment / TOM_lbs, 2) : 0;

  const pressureCorrection = (plan.weather.qnh - 1013) * 25;
  const tempPenalty = Math.max(0, deltaIsa) * 120;
  const massPenalty = Math.max(0, TOM_lbs - 2200) * 8;
  const HOGE_ft = Math.max(0, Math.round(9000 - tempPenalty - massPenalty + pressureCorrection));

  const env = wc.cgEnvelope;
  const inLongRange = CG_long >= env.longMin && CG_long <= env.longMax;
  const inLatRange = CG_lat >= env.latMin && CG_lat <= env.latMax;
  const inLongPolygon = pointInPolygon({ x: CG_long, y: TOM_lbs }, env.longitudinalPoints);
  const inLatPolygon = pointInPolygon({ x: CG_lat, y: TOM_lbs }, env.lateralPoints);
  const inEnvelope = inLongRange && inLatRange && inLongPolygon && inLatPolygon;

  return { TOM_lbs, CG_long, CG_lat, HOGE_ft, inEnvelope };
}

export function evaluateFlightPlan(plan: FlightPlan, config: OFPConfig): EvaluatedPlan {
  const delta = deltaISADev(plan);
  const rawLegs: EvaluatedLeg[] = plan.legs.map((leg) => {
    const timeMinutes = legTimeMinutes(leg.distance_nm, leg.groundSpeed_kt);
    const burn = round((plan.fuelPlan.fuelFlow_USG_per_hr / 60) * timeMinutes, 1);
    const oatLeg = round(isaTemp(leg.plannedAlt_ft) + delta, 1);

    return {
      ...leg,
      legTimeMinutes: timeMinutes,
      legTime_hhmm: toHHMM(timeMinutes),
      burnOff_USG: burn,
      magHeadingCorrected_deg: calcMagHeading(
        leg.trackMag_deg,
        plan.weather.windDirMag,
        plan.weather.windSpeedKt,
        plan.TAS,
      ),
      oat_leg_C: oatLeg,
      MCP_inHg: interpolateMCP(config.mcpTable, leg.plannedAlt_ft, oatLeg),
      MTP_inHg: "FT",
      VNE_kt: interpolateVNE(config.vneTable, leg.plannedAlt_ft, oatLeg),
    };
  });

  for (let i = 0; i < rawLegs.length; i += 1) {
    const leg = rawLegs[i];
    if (leg.legType === "CLB" && rawLegs[i + 1]) {
      leg.MCP_inHg = rawLegs[i + 1].MCP_inHg;
      leg.VNE_kt = rawLegs[i + 1].VNE_kt;
    }
    if (leg.legType === "DES" && rawLegs[i - 1]) {
      leg.MCP_inHg = rawLegs[i - 1].MCP_inHg;
      leg.VNE_kt = rawLegs[i - 1].VNE_kt;
    }
    leg.MTP_inHg = typeof leg.MCP_inHg === "number" ? round(leg.MCP_inHg + config.mtpOffset_inHg, 1) : "FT";
  }

  const totalLegTimeMinutes = rawLegs.reduce((sum, leg) => sum + leg.legTimeMinutes, 0);
  const totalBurnOff_USG = round(rawLegs.reduce((sum, leg) => sum + leg.burnOff_USG, 0), 1);
  const blockTimeMinutes = totalLegTimeMinutes + plan.additionalTimes.dep_minutes + plan.additionalTimes.dest_minutes;
  const blockFuel_USG = round(
    plan.fuelPlan.taxiFuel_USG +
      plan.fuelPlan.tripFuel_USG +
      plan.fuelPlan.contingencyFuel_USG +
      plan.fuelPlan.addApproachFuel_USG +
      plan.fuelPlan.addReserveFuel_USG,
    1,
  );

  const payloadOutputs = evaluatePayload(plan, config, delta);

  const warnings: string[] = [];
  if (payloadOutputs.TOM_lbs > config.weightConfig.maxTakeoffWeight_lbs) {
    warnings.push("OVER MTW");
  }
  if (!payloadOutputs.inEnvelope) {
    warnings.push("CG out of envelope");
  }
  if (rawLegs.some((leg) => leg.VNE_kt === "No Flight")) {
    warnings.push("One or more legs are No Flight");
  }
  if (rawLegs.some((leg) => leg.MCP_inHg === "FT")) {
    warnings.push("MCP contains FT limits");
  }

  return {
    deltaISADev_C: delta,
    legs: rawLegs,
    totals: {
      totalLegTimeMinutes,
      blockTimeMinutes,
      totalBurnOff_USG,
      blockFuel_USG,
    },
    payloadOutputs,
    warnings,
  };
}
