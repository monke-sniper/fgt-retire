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
    const plan = buildPlan(sample, {
      currentYear: YEAR,
      orgType: "business",
      wantsCertificate: false,
    });
    expect(plan.counts).toEqual({
      "reuse-modern": 7,
      "reuse-linux": 4,
      parts: 3,
      recycle: 1,
      return: 1,
    });
    // 7 + 4 + 3: everything that goes back into use as a laptop or as parts.
    expect(plan.reusedCount).toBe(14);
    // The only recycled device is the 2015 Latitude: recycling is age, not damage.
    expect(plan.counts.recycle).toBe(1);
    expect(plan.devices.filter((device) => device.tier === "recycle").map((d) => d.serial)).toEqual(
      ["8H2XQ16"],
    );
    // The 2021 ThinkPad reported "no power": damage is a routing flag, so it is
    // harvested for parts instead of being shredded.
    expect(plan.devices.find((device) => device.serial === "R90XY13")).toMatchObject({
      tier: "parts",
    });
  });

  it("charges the optional certificate only for reused or harvested devices", () => {
    const plan = buildPlan(sample, {
      currentYear: YEAR,
      orgType: "business",
      wantsCertificate: true,
    });
    expect(plan.billableCount).toBe(14);
    expect(plan.certificateTotal).toBe(140);
  });

  it("keeps donating free when no certificate is requested", () => {
    const plan = buildPlan(sample, {
      currentYear: YEAR,
      orgType: "business",
      wantsCertificate: false,
    });
    expect(plan.certificateTotal).toBe(0);
  });

  it("gives non-profits the certificate for free", () => {
    const plan = buildPlan(sample, {
      currentYear: YEAR,
      orgType: "nonprofit",
      wantsCertificate: true,
    });
    expect(plan.certificateTotal).toBe(0);
  });

  it("reports no unknown lock state for the sample fleet", () => {
    const plan = buildPlan(sample, {
      currentYear: YEAR,
      orgType: "business",
      wantsCertificate: false,
    });
    expect(plan.unknownLockCount).toBe(0);
  });
});

describe("buildPlan unknown lock state (red-team B1)", () => {
  const csv =
    "serial,make,model,cpu,ram_gb,storage,year,damage\n" +
    "A1,Dell,Latitude,Intel Core i5-8365U,8,ssd,2019\n" +
    "A2,Dell,Latitude,Intel Core i5-8365U,8,ssd,2019\n" +
    "A3,Dell,Latitude,Intel Core i5-8365U,8,ssd,2019";

  it("counts every device as unknown when the column is absent, without re-tiering", () => {
    const devices = parseFleetCsv(csv, YEAR).devices;
    const plan = buildPlan(devices, {
      currentYear: YEAR,
      orgType: "business",
      wantsCertificate: true,
    });
    expect(plan.unknownLockCount).toBe(3);
    // Still planned for reuse (plus a warning at the parse layer) rather than
    // refusing the whole donation.
    expect(plan.counts["reuse-modern"]).toBe(3);
    expect(plan.counts.return).toBe(0);
  });

  it("counts only the devices whose lock state was not reported", () => {
    const mixed =
      "serial,make,model,cpu,ram_gb,storage,year,damage,locked\n" +
      "A1,Dell,Latitude,Intel Core i5-8365U,8,ssd,2019,,no\n" +
      "A2,Dell,Latitude,Intel Core i5-8365U,8,ssd,2019,\n" +
      "A3,Dell,Latitude,Intel Core i5-8365U,8,ssd,2019,,yes";
    const devices = parseFleetCsv(mixed, YEAR).devices;
    const plan = buildPlan(devices, {
      currentYear: YEAR,
      orgType: "business",
      wantsCertificate: false,
    });
    expect(plan.unknownLockCount).toBe(1);
    expect(plan.counts.return).toBe(1);
  });

  it("replays the red-team B1 file: warned and counted instead of silently promised", () => {
    const report = parseFleetCsv(
      "serial,make,model,cpu,ram_gb,storage,year,damage,tpm,locked\n" +
        "L1,Dell,Lat,Intel Core i5-8365U,8,ssd,2019,,yes,\n" +
        "L2,Dell,Lat,Intel Core i5-8365U,8,ssd,2019,,yes,no",
      YEAR,
    );
    expect(report.devices).toHaveLength(2);
    expect(report.warnings).toHaveLength(1);
    expect(report.warnings[0].row).toBe(2);
    expect(report.warnings[0].message).toContain("1 device");

    const plan = buildPlan(report.devices, {
      currentYear: YEAR,
      orgType: "business",
      wantsCertificate: false,
    });
    expect(plan.counts["reuse-modern"]).toBe(2);
    expect(plan.unknownLockCount).toBe(1);
  });
});
