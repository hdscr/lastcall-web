import type { FlightPlan, MCPValue, OFPConfig, VNEValue, VoiceScript } from "./types";

const paList = [0, 2000, 4000, 6000, 8000, 10000, 12000];
const tempList = [-30, -20, -10, 0, 10, 20, 30, 40];

const mcpGrid: MCPValue[][] = [
  [24.5, 24.2, 24.0, 23.7, 23.4, 23.0, 22.7, 22.3],
  [24.2, 23.9, 23.7, 23.4, 23.1, 22.8, 22.4, 22.0],
  [23.9, 23.6, 23.3, 23.0, 22.7, 22.4, 22.0, 21.6],
  [23.5, 23.2, 22.9, 22.6, 22.3, 21.9, 21.5, 21.1],
  [23.1, 22.8, 22.5, 22.2, 21.8, 21.4, 21.0, "FT"],
  [22.7, 22.4, 22.1, 21.7, 21.3, 20.9, "FT", "FT"],
  [22.3, 22.0, 21.6, 21.2, 20.8, "FT", "FT", "FT"],
];

const vneGrid: VNEValue[][] = [
  [130, 129, 128, 127, 126, 124, 122, 120],
  [129, 128, 127, 126, 124, 122, 120, 118],
  [128, 127, 126, 124, 122, 120, 118, 116],
  [127, 126, 124, 122, 120, 118, 116, 114],
  [126, 124, 122, 120, 118, 116, 114, "FT"],
  [124, 122, 120, 118, 116, 114, "FT", "No Flight"],
  [122, 120, 118, 116, "FT", "No Flight", "No Flight", "No Flight"],
];

export const defaultVoiceScripts: VoiceScript[] = [
  { location: "Zurich Information", callText: "Zurich Information, HB-ZYO, RH44, request traffic information." },
  { location: "Tower Departure", callText: "HB-ZYO ready for departure, VFR to destination." },
  { location: "Arrival", callText: "HB-ZYO, inbound for landing with information." },
];

export const defaultConfig: OFPConfig = {
  mcpTable: { paList, tempList, grid: mcpGrid },
  vneTable: { paList, tempList, grid: vneGrid },
  mtpOffset_inHg: 2.8,
  weightConfig: {
    emptyWeight_lbs: 1515,
    maxTakeoffWeight_lbs: 2500,
    emptyLongArm_in: 106.5,
    emptyLatArm_in: 0,
    arms: {
      pax_rightFront: { long: 101.5, lat: 12 },
      pax_leftFront: { long: 101.5, lat: -12 },
      pax_rightBack: { long: 138.0, lat: 12 },
      pax_leftBack: { long: 138.0, lat: -12 },
      baggage_rightFront: { long: 126.0, lat: 9 },
      baggage_leftFront: { long: 126.0, lat: -9 },
    },
    cgEnvelope: {
      longMin: 96,
      longMax: 110,
      latMin: -10,
      latMax: 10,
    },
  },
};

export const defaultPlan: FlightPlan = {
  aircraftType: "RH44",
  registration: "HB-ZYO",
  fromICAO: "LSZH",
  toICAO: "LSZR",
  date: new Date().toISOString().slice(0, 10),
  pilots: "Student / Instructor",
  TAS: 90,
  weather: {
    qnh: 1013,
    windDirMag: 220,
    windSpeedKt: 12,
  },
  temperatures: {
    alt1_ft: 1500,
    oat1_C: 15,
    alt2_ft: 5000,
    oat2_C: 8,
  },
  payload: {
    pax_rightFront_kg: 75,
    pax_leftFront_kg: 75,
    pax_rightBack_kg: 0,
    pax_leftBack_kg: 0,
    baggage_rightFront_kg: 5,
    baggage_leftFront_kg: 5,
  },
  fuelPlan: {
    fuelFlow_USG_per_hr: 16,
    taxiFuel_USG: 1.0,
    tripFuel_USG: 8.0,
    contingencyFuel_USG: 1.5,
    addApproachFuel_USG: 1.0,
    addReserveFuel_USG: 3.0,
  },
  additionalTimes: {
    dep_minutes: 5,
    dest_minutes: 5,
  },
  legs: [
    {
      seq: 1,
      waypointName: "DEP",
      legType: "CLB",
      trackMag_deg: 105,
      distance_nm: 7,
      plannedAlt_ft: 3000,
      groundSpeed_kt: 80,
      maxAltLimit: "CTR",
      frequenciesInfo: "TWR 118.1",
      description: "Departure and climb",
    },
    {
      seq: 2,
      waypointName: "WP1",
      legType: "CRUISE",
      trackMag_deg: 120,
      distance_nm: 24,
      plannedAlt_ft: 4500,
      groundSpeed_kt: 92,
      maxAltLimit: "5500",
      frequenciesInfo: "INFO 124.7",
      description: "Enroute",
    },
    {
      seq: 3,
      waypointName: "ARR",
      legType: "DES",
      trackMag_deg: 140,
      distance_nm: 9,
      plannedAlt_ft: 2500,
      groundSpeed_kt: 85,
      maxAltLimit: "CTR",
      frequenciesInfo: "ATIS 127.8",
      description: "Arrival and descent",
    },
  ],
};

