import { describe, expect, it } from "vitest";
import { isModernCpu, parseCpu } from "../src/lib/cpu";
import { DEFAULT_RULES } from "../src/lib/rules";

describe("parseCpu", () => {
  it.each([
    ["Intel Core i5-8365U", 8],
    ["Intel Core i7 8650U", 8],
    ["Intel Core i5-6300U", 6],
    ["Intel Core i5-10310U", 10],
    ["Intel Core i5-1145G7", 11],
    ["Intel Core i7-1255U", 12],
    ["Intel Core i5-520M", 1],
    ["Intel Core Ultra 5 125U", 14],
  ])("reads %s as Intel generation %i", (name, generation) => {
    expect(parseCpu(name)).toEqual({ vendor: "intel", generation });
  });

  it.each([
    ["AMD Ryzen 5 4500U", 4000],
    ["AMD Ryzen 7 PRO 7840U", 7000],
    ["Ryzen 3 2200U", 2000],
  ])("reads %s as Ryzen series %i", (name, series) => {
    expect(parseCpu(name)).toEqual({ vendor: "amd", series });
  });

  it("detects Apple silicon", () => {
    expect(parseCpu("Apple M1")).toEqual({ vendor: "apple-silicon" });
    expect(parseCpu("M2 Pro")).toEqual({ vendor: "apple-silicon" });
  });

  it("returns unknown for unrecognized names", () => {
    expect(parseCpu("Intel Celeron N4020")).toEqual({ vendor: "unknown" });
  });
});

describe("isModernCpu", () => {
  it("applies the generation thresholds", () => {
    expect(isModernCpu(parseCpu("Intel Core i5-8365U"), DEFAULT_RULES)).toBe(true);
    expect(isModernCpu(parseCpu("Intel Core i5-6300U"), DEFAULT_RULES)).toBe(false);
    expect(isModernCpu(parseCpu("AMD Ryzen 5 2500U"), DEFAULT_RULES)).toBe(true);
    expect(isModernCpu(parseCpu("AMD Ryzen 5 PRO 1500"), DEFAULT_RULES)).toBe(false);
    expect(isModernCpu(parseCpu("Apple M1"), DEFAULT_RULES)).toBe(true);
    expect(isModernCpu(parseCpu("Intel Celeron N4020"), DEFAULT_RULES)).toBe(false);
  });
});
