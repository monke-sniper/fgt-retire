import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFleetCsv } from "../src/lib/csv";
import { DEFAULT_IMPACT_ASSUMPTIONS, estimateImpact } from "../src/lib/impact";
import { buildPlan } from "../src/lib/plan";

const YEAR = 2026;
const HEADER = "serial,make,model,cpu,ram_gb,storage,year,damage,tpm,locked";
const sample = readFileSync(join(__dirname, "..", "public", "samples", "fleet-sample.csv"), "utf8");

function planFor(csv: string) {
  const { devices } = parseFleetCsv(csv, YEAR);
  return buildPlan(devices, { currentYear: YEAR, orgType: "business", wantsCertificate: false });
}

describe("estimateImpact", () => {
  it("counts the sample fleet's outcomes and weight", () => {
    expect(estimateImpact(planFor(sample))).toEqual({
      backInUse: 11,
      openSource: 4,
      parts: 3,
      recycled: 1,
      handled: 15,
      kgHandled: 22.5,
    });
  });

  it("leaves locked devices out of every figure", () => {
    const impact = estimateImpact(
      planFor(`${HEADER}\nA1,Dell,X,Intel Core i5-8365U,8,ssd,2019,,yes,yes`),
    );
    expect(impact.handled).toBe(0);
    expect(impact.backInUse).toBe(0);
    expect(impact.kgHandled).toBe(0);
  });

  it("uses the weight it is given", () => {
    const impact = estimateImpact(planFor(sample), { kgPerLaptop: 2 });
    expect(impact.kgHandled).toBe(30);
  });

  it("assumes a conservative laptop weight by default", () => {
    expect(DEFAULT_IMPACT_ASSUMPTIONS.kgPerLaptop).toBe(1.5);
  });
});
