import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MAX_BYTES, MAX_DEVICES, checkUploadSize, parseFleetCsv } from "../src/lib/csv";

const YEAR = 2026;
const HEADER = "serial,make,model,cpu,ram_gb,storage,year,damage,tpm,locked";

const validRow = (serial: string, locked = "no") =>
  `${serial},Dell,Latitude,Intel Core i5-8350U,8,ssd,2019,,yes,${locked}`;
const badRow = (serial: string) =>
  `${serial},Dell,Latitude,Intel Core i5-8350U,eight,ssd,2019,,yes,no`;

describe("parseFleetCsv", () => {
  it("parses the sample fleet without errors", () => {
    const text = readFileSync(join(process.cwd(), "public/samples/fleet-sample.csv"), "utf8");
    const { devices, errors } = parseFleetCsv(text, YEAR);
    expect(errors).toEqual([]);
    expect(devices).toHaveLength(16);
  });

  it("normalizes header case and spacing", () => {
    const text =
      "Serial,Make,Model,CPU,RAM GB,Storage,Year\nA1,Dell,Latitude 5490,Intel Core i5-8350U,8,SSD,2018";
    const { devices, errors } = parseFleetCsv(text, YEAR);
    expect(errors).toEqual([]);
    expect(devices[0]).toMatchObject({
      serial: "A1",
      ramGb: 8,
      storage: "ssd",
      tpm: null,
      locked: false,
    });
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

describe("parseFleetCsv row numbers (red-team M3)", () => {
  it("points at the spreadsheet line when a blank line precedes the bad row", () => {
    const text = `${HEADER}\n${validRow("A1")}\n\n${badRow("B3")}`;
    const { errors } = parseFleetCsv(text, YEAR);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(4);
  });

  it("counts two blank lines before the bad row", () => {
    const text = `${HEADER}\n\n\n${badRow("B3")}`;
    const { errors } = parseFleetCsv(text, YEAR);
    expect(errors[0].row).toBe(4);
  });

  it("counts the newline inside a quoted cell", () => {
    const text = `${HEADER}\nA1,Dell,Latitude,Intel Core i5-8350U,8,ssd,2019,"cracked\nscreen",yes,no\n${badRow("B2")}`;
    const { devices, errors } = parseFleetCsv(text, YEAR);
    expect(devices).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(4);
  });

  it("keeps numbering correct for CRLF files with a blank line", () => {
    const text = `${HEADER}\r\n${validRow("A1")}\r\n\r\n${badRow("B2")}`;
    const { errors } = parseFleetCsv(text, YEAR);
    expect(errors[0].row).toBe(4);
  });

  it("finds a header below leading blank lines and offsets the row numbers", () => {
    const text = `\n\n${HEADER}\n${badRow("B3")}`;
    const { errors } = parseFleetCsv(text, YEAR);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(4);
  });
});

describe("parseFleetCsv lock state honesty (red-team B1)", () => {
  it("records whether lock state was actually reported", () => {
    const text = `${HEADER}\n${validRow("A1", "yes")}\n${validRow("A2", "")}`;
    const { devices, warnings } = parseFleetCsv(text, YEAR);
    expect(devices[0]).toMatchObject({ locked: true, lockedReported: true });
    expect(devices[1]).toMatchObject({ locked: false, lockedReported: false });
    expect(warnings).toHaveLength(1);
  });

  it("keeps tiering logic untouched but warns once, on the first blank row", () => {
    const text = `${HEADER}\n${validRow("A1", "no")}\n${validRow("A2", "")}\n${validRow("A3", "")}`;
    const { devices, warnings } = parseFleetCsv(text, YEAR);
    expect(devices.map((device) => device.locked)).toEqual([false, false, false]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].row).toBe(3);
    expect(warnings[0].message).toContain("2 devices");
    expect(warnings[0].message).toContain("planned as unlocked");
  });

  it("warns once for an absent locked column, with no duplicate row-level note", () => {
    const text =
      "serial,make,model,cpu,ram_gb,storage,year\nA1,Dell,Latitude,Intel Core i5-8350U,8,ssd,2019\nA2,Dell,Latitude,Intel Core i5-8350U,8,ssd,2019";
    const { devices, warnings } = parseFleetCsv(text, YEAR);
    expect(devices.every((device) => device.lockedReported === false)).toBe(true);
    // The absent column is a file-level fact: one warning, not a row-level
    // "starting here" note saying the same thing twice.
    expect(warnings).toHaveLength(1);
    expect(warnings[0].row).toBe(0);
    expect(warnings[0].message).toContain("`locked` column");
    expect(warnings[0].message).toContain("planned as unlocked");
  });

  it("still points at the first blank row when the column exists but is empty", () => {
    const text = `${HEADER}\n${validRow("A1", "no")}\n${validRow("A2", "")}\n${validRow("A3", "")}`;
    const { warnings } = parseFleetCsv(text, YEAR);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].row).toBe(3);
    expect(warnings[0].message).toContain("starting here");
    expect(warnings[0].message).toContain("2 devices");
  });

  it("stays quiet for the sample fleet, which reports lock state on every row", () => {
    const text = readFileSync(join(process.cwd(), "public/samples/fleet-sample.csv"), "utf8");
    expect(parseFleetCsv(text, YEAR).warnings).toEqual([]);
  });
});

describe("parseFleetCsv row cap (red-team M5)", () => {
  const rowsFor = (count: number) =>
    `${HEADER}\n${Array.from({ length: count }, (_, index) => validRow(`S${index}`)).join("\n")}`;

  it("accepts a file at the cap", () => {
    const { devices, errors } = parseFleetCsv(rowsFor(MAX_DEVICES), YEAR);
    expect(errors).toEqual([]);
    expect(devices).toHaveLength(MAX_DEVICES);
  });

  it("rejects a file over the cap with a file-level error and no devices", () => {
    const { devices, errors } = parseFleetCsv(rowsFor(MAX_DEVICES + 1), YEAR);
    expect(devices).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(0);
    expect(errors[0].message).toContain("2,001 device rows");
    expect(errors[0].message).toContain("2,000");
    expect(errors[0].message).toContain("Split it into smaller files");
  });

  it("ignores blank rows when counting against the cap", () => {
    const withBlanks = `${HEADER}\n\n${validRow("A1")}\n\n${validRow("A2")}`;
    const { devices, errors } = parseFleetCsv(withBlanks, YEAR);
    expect(errors).toEqual([]);
    expect(devices).toHaveLength(2);
  });
});

describe("checkUploadSize", () => {
  it("passes a normal-sized file", () => {
    expect(checkUploadSize(200 * 1024)).toBeNull();
    expect(checkUploadSize(MAX_BYTES)).toBeNull();
  });

  it("rejects an oversized file with a file-level error", () => {
    const error = checkUploadSize(MAX_BYTES + 1);
    expect(error?.row).toBe(0);
    expect(error?.message).toContain("5 MB");
    expect(error?.message).toContain("different export");
  });
});

describe("parseFleetCsv storage and TPM values", () => {
  const row = (storage: string, tpm: string, locked = "no") =>
    `${HEADER}\nA1,Dell,Latitude,Intel Core i5-8350U,8,${storage},2019,,${tpm},${locked}`;

  it("keeps eMMC distinct from SSD and folds NVMe into SSD", () => {
    expect(parseFleetCsv(row("emmc", "yes"), YEAR).devices[0].storage).toBe("emmc");
    expect(parseFleetCsv(row("nvme", "yes"), YEAR).devices[0].storage).toBe("ssd");
  });

  it("lists every accepted storage value in the error", () => {
    const { errors } = parseFleetCsv(row("sata", "yes"), YEAR);
    expect(errors[0].message).toContain("emmc");
  });

  it.each([
    ["2.0", true],
    ["2", true],
    ["1.2", false],
  ])("reads tpm %s as TPM 2.0 = %s", (tpm, expected) => {
    const { devices, errors } = parseFleetCsv(row("ssd", tpm), YEAR);
    expect(errors).toEqual([]);
    expect(devices[0].tpm).toBe(expected);
  });

  it("does not accept a TPM version as a lock state", () => {
    const { devices, errors } = parseFleetCsv(row("ssd", "yes", "2.0"), YEAR);
    expect(devices).toEqual([]);
    expect(errors[0].message).toContain("locked");
  });
});
