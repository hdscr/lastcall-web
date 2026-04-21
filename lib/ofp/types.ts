export type LegType = "CRUISE" | "CLB" | "DES";

export type MCPValue = number | "FT";
export type VNEValue = number | "FT" | "No Flight";

export interface LegInput {
  seq: number;
  waypointName: string;
  legType: LegType;
  trackMag_deg: number;
  distance_nm: number;
  plannedAlt_ft: number;
  groundSpeed_kt: number;
  maxAltLimit?: string;
  frequenciesInfo?: string;
  description?: string;
}

export interface FlightPlan {
  id?: string;
  aircraftType: string;
  registration: string;
  fromICAO: string;
  toICAO: string;
  date: string;
  pilots: string;
  TAS: number;
  weather: {
    qnh: number;
    windDirMag: number;
    windSpeedKt: number;
    fieldElevation_ft: number;
  };
  temperatures: {
    alt1_ft: number;
    oat1_C: number;
    alt2_ft: number;
    oat2_C: number;
  };
  payload: {
    pax_rightFront_kg: number;
    pax_leftFront_kg: number;
    pax_rightBack_kg: number;
    pax_leftBack_kg: number;
    baggage_rightFront_kg: number;
    baggage_leftFront_kg: number;
  };
  fuelPlan: {
    fuelFlow_USG_per_hr: number;
    taxiFuel_USG: number;
    tripFuel_USG: number;
    contingencyFuel_USG: number;
    addApproachFuel_USG: number;
    addReserveFuel_USG: number;
  };
  additionalTimes: {
    dep_minutes: number;
    dest_minutes: number;
  };
  legs: LegInput[];
}

export interface PerformanceTable<TValue extends MCPValue | VNEValue> {
  paList: number[];
  tempList: number[];
  grid: TValue[][];
}

export interface VoiceScript {
  location: string;
  callText: string;
}

export interface EnvelopePoint {
  x: number;
  y: number;
}

export interface WeightConfig {
  emptyWeight_lbs: number;
  maxTakeoffWeight_lbs: number;
  emptyLongArm_in: number;
  emptyLatArm_in: number;
  arms: {
    pax_rightFront: { long: number; lat: number };
    pax_leftFront: { long: number; lat: number };
    pax_rightBack: { long: number; lat: number };
    pax_leftBack: { long: number; lat: number };
    baggage_rightFront: { long: number; lat: number };
    baggage_leftFront: { long: number; lat: number };
  };
  cgEnvelope: {
    longMin: number;
    longMax: number;
    latMin: number;
    latMax: number;
    longitudinalPoints: EnvelopePoint[];
    lateralPoints: EnvelopePoint[];
  };
}

export interface OFPConfig {
  mcpTable: PerformanceTable<MCPValue>;
  vneTable: PerformanceTable<VNEValue>;
  mtpOffset_inHg: number;
  weightConfig: WeightConfig;
}

export interface EvaluatedLeg extends LegInput {
  legTimeMinutes: number;
  legTime_hhmm: string;
  burnOff_USG: number;
  magHeadingCorrected_deg: number;
  oat_leg_C: number;
  MCP_inHg: MCPValue;
  MTP_inHg: MCPValue;
  VNE_kt: VNEValue;
}

export interface EvaluatedPlan {
  deltaISADev_C: number;
  legs: EvaluatedLeg[];
  totals: {
    totalLegTimeMinutes: number;
    blockTimeMinutes: number;
    totalBurnOff_USG: number;
    blockFuel_USG: number;
  };
  payloadOutputs: {
    TOM_lbs: number;
    CG_long: number;
    CG_lat: number;
    HOGE_ft: number;
    pressureAltitude_ft: number;
    densityAltitude_ft: number;
    hogeScenarios_ft: {
      isa: number;
      qnhCorrected: number;
      deltaIsaCorrected: number;
      final: number;
    };
    inEnvelope: boolean;
  };
  warnings: string[];
}

