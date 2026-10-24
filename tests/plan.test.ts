import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFleetCsv } from "../src/lib/csv";
import { buildPlan } from "../src/lib/plan";

const YEAR = 2026;
const sample = parseFleetCsv(
  readFileSync(join(process.cwd(), "public/samples/fleet-sample.csv"), "utf8"),
  YEAR,
).devices;

describe("buildPlan", () => {
  it("counts every tier in the sample fleet", () => {
    const plan = buildPlan(sample, { currentYear: YEAR, orgType: "business", wantsCertificate: false });
    expect(plan.counts).toEqual({
      "reuse-modern": 7,
      "reuse-linux": 4,
      parts: 2,
      recycle: 2,
      return: 1,
    });
    expect(plan.reusedCount).toBe(13);
  });

  it("charges the optional certificate only for reused or harvested devices", () => {
    const plan = buildPlan(sample, { currentYear: YEAR, orgType: "business", wantsCertificate: true });
    expect(plan.billableCount).toBe(13);
    expect(plan.certificateTotal).toBe(130);
  });

  it("keeps donating free when no certificate is requested", () => {
    const plan = buildPlan(sample, { currentYear: YEAR, orgType: "business", wantsCertificate: false });
    expect(plan.certificateTotal).toBe(0);
  });

  it("gives non-profits the certificate for free", () => {
    const plan = buildPlan(sample, { currentYear: YEAR, orgType: "nonprofit", wantsCertificate: true });
    expect(plan.certificateTotal).toBe(0);
  });
});
