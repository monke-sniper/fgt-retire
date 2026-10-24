import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFleetCsv } from "../src/lib/csv";

const YEAR = 2026;
const HEADER = "serial,make,model,cpu,ram_gb,storage,year,damage,tpm,locked";

describe("parseFleetCsv", () => {
  it("parses the sample fleet without errors", () => {
    const text = readFileSync(join(process.cwd(), "public/samples/fleet-sample.csv"), "utf8");
    const { devices, errors } = parseFleetCsv(text, YEAR);
    expect(errors).toEqual([]);
    expect(devices).toHaveLength(16);
  });

  it("normalizes header case and spacing", () => {
    const text = "Serial,Make,Model,CPU,RAM GB,Storage,Year\nA1,Dell,Latitude 5490,Intel Core i5-8350U,8,SSD,2018";
    const { devices, errors } = parseFleetCsv(text, YEAR);
    expect(errors).toEqual([]);
    expect(devices[0]).toMatchObject({ serial: "A1", ramGb: 8, storage: "ssd", tpm: null, locked: false });
  });

  it("reports missing required columns", () => {
    const { devices, errors } = parseFleetCsv("serial,make\nA1,Dell", YEAR);
    expect(devices).toEqual([]);
    expect(errors[0].message).toContain("model");
  });

  it("reports invalid values with the row number", () => {
    const text = `${HEADER}\nA1,Dell,Latitude,Intel Core i5-8350U,eight,floppy,1980,,maybe,no`;
    const { devices, errors } = parseFleetCsv(text, YEAR);
    expect(devices).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(2);
    expect(errors[0].message).toContain("ram_gb");
    expect(errors[0].message).toContain("storage");
    expect(errors[0].message).toContain("year");
    expect(errors[0].message).toContain("tpm");
  });

  it("rejects duplicate serials", () => {
    const row = "A1,Dell,Latitude,Intel Core i5-8350U,8,ssd,2018,,yes,no";
    const { devices, errors } = parseFleetCsv(`${HEADER}\n${row}\n${row}`, YEAR);
    expect(devices).toHaveLength(1);
    expect(errors[0]).toMatchObject({ row: 3 });
  });

  it("reports an empty file", () => {
    expect(parseFleetCsv(HEADER, YEAR).errors[0].message).toContain("no device rows");
  });
});
