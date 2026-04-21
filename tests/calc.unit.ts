import assert from "node:assert/strict";
import { evaluateFlightPlan, interpolateMCP, interpolateVNE } from "../lib/ofp/calc";
import { defaultConfig, defaultPlan } from "../lib/ofp/seeds";

function testInterpolation() {
  const mcp = interpolateMCP(defaultConfig.mcpTable, 5000, 5);
  assert.equal(typeof mcp, "number");

  const vne = interpolateVNE(defaultConfig.vneTable, 12000, 40);
  assert.equal(vne, "No Flight");
}

function testCLBDESCarryRule() {
  const evaluated = evaluateFlightPlan(defaultPlan, defaultConfig);
  assert.equal(evaluated.legs[0].legType, "CLB");
  assert.equal(evaluated.legs[2].legType, "DES");
  assert.equal(evaluated.legs[0].MCP_inHg, evaluated.legs[1].MCP_inHg);
  assert.equal(evaluated.legs[2].VNE_kt, evaluated.legs[1].VNE_kt);
}

function testTotals() {
  const evaluated = evaluateFlightPlan(defaultPlan, defaultConfig);
  assert.ok(evaluated.totals.totalLegTimeMinutes > 0);
  assert.ok(evaluated.totals.blockTimeMinutes >= evaluated.totals.totalLegTimeMinutes);
  assert.ok(evaluated.totals.blockFuel_USG > 0);
}

function testWarnings() {
  const heavyPlan = {
    ...defaultPlan,
    payload: {
      ...defaultPlan.payload,
      pax_rightFront_kg: 150,
      pax_leftFront_kg: 150,
      pax_rightBack_kg: 120,
      pax_leftBack_kg: 120,
    },
  };

  const evaluated = evaluateFlightPlan(heavyPlan, defaultConfig);
  assert.ok(evaluated.warnings.includes("OVER MTW"));
}

function run() {
  testInterpolation();
  testCLBDESCarryRule();
  testTotals();
  testWarnings();
  console.log("calc.unit.ts: all tests passed");
}

run();

