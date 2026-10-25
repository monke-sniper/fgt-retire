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
    ["Intel(R) Core(TM) i5-8365U CPU @ 1.60GHz", 8],
    ["Intel® Core™ i7-10610U", 10],
  ])("reads %s as Intel generation %i", (name, generation) => {
    expect(parseCpu(name)).toEqual({ vendor: "intel", generation });
  });

  it.each([
    ["AMD Ryzen 5 4500U", 4000],
    ["AMD Ryzen 7 PRO 7840U", 7000],
    ["Ryzen 3 2200U", 2000],
    ["AMD Ryzen™ 5 4500U", 4000],
    ["AMD Ryzen® 7 PRO 5850U", 5000],
  ])("reads %s as Ryzen series %i", (name, series) => {
    expect(parseCpu(name)).toEqual({ vendor: "amd", series });
  });

  it("detects Apple silicon", () => {
    expect(parseCpu("Apple M1")).toEqual({ vendor: "apple-silicon" });
    expect(parseCpu("M2 Pro")).toEqual({ vendor: "apple-silicon" });
  });

  it.each([
    "MacBook Pro (M2)",
    "MacBook Air (M1, 2020)",
    "MacBook Pro 14 M3 Pro",
    "Apple MacBook Air M4",
    "M1, 2020",
  ])("detects Apple silicon in %j", (name) => {
    expect(parseCpu(name)).toEqual({ vendor: "apple-silicon" });
  });

  it("returns unknown for unrecognized names", () => {
    expect(parseCpu("Intel Celeron N4020")).toEqual({ vendor: "unknown" });
    expect(parseCpu("Qualcomm Snapdragon 8cx Gen 3")).toEqual({ vendor: "unknown" });
    expect(parseCpu("Intel Xeon E5-2670")).toEqual({ vendor: "unknown" });
  });

  it("does not mistake an Intel Core m-series part number for Apple silicon", () => {
    expect(parseCpu("Intel Core m3-8100Y")).toEqual({ vendor: "unknown" });
    expect(parseCpu("Intel Core m5 6Y57")).toEqual({ vendor: "unknown" });
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
    expect(isModernCpu(parseCpu("AMD Ryzen™ 5 4500U"), DEFAULT_RULES)).toBe(true);
    expect(isModernCpu(parseCpu("MacBook Pro (M2)"), DEFAULT_RULES)).toBe(true);
  });
});
