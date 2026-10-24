import { describe, expect, it } from "vitest";
import { scoreDevice } from "../src/lib/scoring";
import type { Device } from "../src/lib/types";

const YEAR = 2026;

const base: Device = {
  serial: "TEST-1",
  make: "Lenovo",
  model: "ThinkPad T490",
  cpu: "Intel Core i5-8365U",
  ramGb: 8,
  storage: "ssd",
  year: 2019,
  damage: "",
  tpm: true,
  locked: false,
};

const tierOf = (overrides: Partial<Device>) =>
  scoreDevice({ ...base, ...overrides }, { currentYear: YEAR }).tier;

describe("scoreDevice", () => {
  it("accepts a modern laptop for reuse", () => {
    expect(tierOf({})).toBe("reuse-modern");
  });

  it("returns locked devices before any other rule", () => {
    expect(tierOf({ locked: true, year: 2005 })).toBe("return");
  });

  it("recycles devices older than 10 years", () => {
    expect(tierOf({ year: 2015 })).toBe("recycle");
    expect(tierOf({ year: 2016, cpu: "Intel Core i5-6300U" })).toBe("reuse-linux");
  });

  it("recycles devices with damage that leaves no parts", () => {
    expect(tierOf({ damage: "No power" })).toBe("recycle");
    expect(tierOf({ damage: "liquid damage" })).toBe("recycle");
  });

  it("sends other damage to parts", () => {
    expect(tierOf({ damage: "cracked screen" })).toBe("parts");
    expect(tierOf({ damage: "sticky keyboard" })).toBe("parts");
  });

  it("treats 'none' as no damage", () => {
    expect(tierOf({ damage: "none" })).toBe("reuse-modern");
  });

  it("infers TPM 2.0 from a modern CPU when not reported", () => {
    expect(tierOf({ tpm: null })).toBe("reuse-modern");
  });

  it("uses open-source reuse when a modern requirement is missing", () => {
    expect(tierOf({ tpm: false })).toBe("reuse-linux");
    expect(tierOf({ storage: "hdd" })).toBe("reuse-linux");
    expect(tierOf({ ramGb: 4 })).toBe("reuse-linux");
    expect(tierOf({ year: 2018 })).toBe("reuse-linux");
    expect(tierOf({ cpu: "Intel Core i5-6300U", tpm: null })).toBe("reuse-linux");
  });

  it("explains which modern requirements were missed", () => {
    const scored = scoreDevice({ ...base, storage: "hdd", ramGb: 4 }, { currentYear: YEAR });
    expect(scored.reason).toContain("under 8 GB RAM");
    expect(scored.reason).toContain("hard drive (HDD)");
  });

  it("accepts Apple silicon Macs for reuse", () => {
    expect(tierOf({ make: "Apple", cpu: "Apple M1", tpm: null, year: 2020 })).toBe("reuse-modern");
  });

  it("sends devices below every reuse rule to parts", () => {
    expect(tierOf({ ramGb: 2, storage: "hdd", cpu: "Intel Core i5-6200U", year: 2016 })).toBe("parts");
  });
});
