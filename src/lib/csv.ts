import Papa from "papaparse";
import type { Device, Storage } from "./types";

export const REQUIRED_COLUMNS = ["serial", "make", "model", "cpu", "ram_gb", "storage", "year"] as const;
export const OPTIONAL_COLUMNS = ["damage", "tpm", "locked"] as const;

export interface RowError {
  /** Spreadsheet row number (the header is row 1). 0 means the whole file. */
  row: number;
  message: string;
}

export interface ParseResult {
  devices: Device[];
  errors: RowError[];
}

const TRUE_VALUES = new Set(["yes", "y", "true", "1", "2.0"]);
const FALSE_VALUES = new Set(["no", "n", "false", "0"]);

function parseOptionalBool(value: string): boolean | null | undefined {
  const v = value.toLowerCase();
  if (v === "") return null;
  if (TRUE_VALUES.has(v)) return true;
  if (FALSE_VALUES.has(v)) return false;
  return undefined;
}

function parseStorage(value: string): Storage | undefined {
  const v = value.toLowerCase();
  if (v === "ssd" || v === "nvme" || v === "emmc") return "ssd";
  if (v === "hdd") return "hdd";
  return undefined;
}

/** Parses a fleet inventory CSV into devices, collecting one error list per file. */
export function parseFleetCsv(text: string, currentYear: number): ParseResult {
  const parsed = Papa.parse<Record<string, string | undefined>>(text.trim(), {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  const columns = parsed.meta.fields ?? [];
  const missing = REQUIRED_COLUMNS.filter((column) => !columns.includes(column));
  if (missing.length > 0) {
    return { devices: [], errors: [{ row: 0, message: `Missing column(s): ${missing.join(", ")}.` }] };
  }

  const devices: Device[] = [];
  const errors: RowError[] = [];
  const seen = new Set<string>();

  parsed.data.forEach((record, index) => {
    const row = index + 2;
    const get = (key: string) => (record[key] ?? "").trim();
    const problems: string[] = [];

    const serial = get("serial");
    if (!serial) problems.push("serial is empty");
    else if (seen.has(serial.toLowerCase())) problems.push(`serial ${serial} appears more than once`);

    for (const key of ["make", "model", "cpu"] as const) {
      if (!get(key)) problems.push(`${key} is empty`);
    }

    const ramGb = Number(get("ram_gb"));
    if (!get("ram_gb") || !Number.isFinite(ramGb) || ramGb <= 0) problems.push("ram_gb must be a number above 0");

    const year = Number(get("year"));
    if (!Number.isInteger(year) || year < 1990 || year > currentYear + 1) {
      problems.push(`year must be a whole number from 1990 to ${currentYear + 1}`);
    }

    const storage = parseStorage(get("storage"));
    if (!storage) problems.push("storage must be ssd, nvme or hdd");

    const tpm = parseOptionalBool(get("tpm"));
    if (tpm === undefined) problems.push("tpm must be yes, no or blank");

    const lockedValue = parseOptionalBool(get("locked"));
    if (lockedValue === undefined) problems.push("locked must be yes, no or blank");

    if (problems.length > 0 || !storage || tpm === undefined || lockedValue === undefined) {
      errors.push({ row, message: problems.join("; ") });
      return;
    }

    seen.add(serial.toLowerCase());
    devices.push({
      serial,
      make: get("make"),
      model: get("model"),
      cpu: get("cpu"),
      ramGb,
      storage,
      year,
      damage: get("damage"),
      tpm,
      locked: lockedValue ?? false,
    });
  });

  if (devices.length === 0 && errors.length === 0) {
    errors.push({ row: 0, message: "The file has no device rows." });
  }

  return { devices, errors };
}
