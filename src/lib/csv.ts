import Papa from "papaparse";
import type { Device, Storage } from "./types";

export const REQUIRED_COLUMNS = [
  "serial",
  "make",
  "model",
  "cpu",
  "ram_gb",
  "storage",
  "year",
] as const;
export const OPTIONAL_COLUMNS = ["damage", "tpm", "locked"] as const;

export interface RowError {
  /** Spreadsheet row number (the header is row 1). 0 means the whole file. */
  row: number;
  message: string;
}

export interface ParseResult {
  devices: Device[];
  errors: RowError[];
  /**
   * Non-fatal, row-level notes. The plan is still produced, but these are
   * facts the user has to see (today: devices planned as unlocked without a
   * reported lock state).
   */
  warnings: RowError[];
}

/**
 * Hard cap on device rows in one upload. The product is scoped to
 * "organizations with 10 to 200 laptops", so 2,000 is ten times the top of
 * that range: enough headroom for an org that exported spares and loaners
 * alongside the fleet, while still rejecting the 50,000-row whole-IT-inventory
 * export that took ~8 s and 450k DOM nodes to render.
 */
export const MAX_DEVICES = 2000;

/**
 * Hard cap on upload size in bytes. A 2,000-row inventory is roughly 130 KB,
 * so 5 MB is three orders of magnitude of headroom — anything larger is a
 * different export (or not a CSV), and it is cheaper to refuse it before the
 * UI reads it into memory.
 */
export const MAX_BYTES = 5 * 1024 * 1024;

const MAX_BYTES_MB = MAX_BYTES / (1024 * 1024);

function withThousands(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Size guard for the upload control. Call it with `File.size` before reading
 * the file; a non-null result should be shown as-is (it is a row-0 error).
 */
export function checkUploadSize(bytes: number): RowError | null {
  if (bytes <= MAX_BYTES) return null;
  return {
    row: 0,
    message: `That file is ${(bytes / 1024 / 1024).toFixed(1)} MB, but the planner reads files up to ${MAX_BYTES_MB} MB. An inventory of 10 to 200 laptops is a few hundred KB, so this is probably a different export.`,
  };
}

const TRUE_VALUES = new Set(["yes", "y", "true", "1"]);
const FALSE_VALUES = new Set(["no", "n", "false", "0"]);

/**
 * TPM versions as asset exports write them. The column asks "TPM 2.0?", so 1.2
 * is a plain no. Kept out of the shared sets so "2.0" never reads as "locked".
 */
const TPM_TRUE_VALUES = new Set(["2", "2.0"]);
const TPM_FALSE_VALUES = new Set(["1.2"]);

function parseOptionalBool(value: string): boolean | null | undefined {
  const v = value.toLowerCase();
  if (v === "") return null;
  if (TRUE_VALUES.has(v)) return true;
  if (FALSE_VALUES.has(v)) return false;
  return undefined;
}

function parseTpm(value: string): boolean | null | undefined {
  if (TPM_TRUE_VALUES.has(value)) return true;
  if (TPM_FALSE_VALUES.has(value)) return false;
  return parseOptionalBool(value);
}

function parseStorage(value: string): Storage | undefined {
  const v = value.toLowerCase();
  if (v === "ssd" || v === "nvme") return "ssd";
  if (v === "emmc") return "emmc";
  if (v === "hdd") return "hdd";
  return undefined;
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "_");
}

/** Lines a row occupies: one, plus any newlines kept inside quoted cells. */
function lineSpan(cells: string[]): number {
  let extra = 0;
  for (const cell of cells) {
    let at = cell.indexOf("\n");
    while (at !== -1) {
      extra += 1;
      at = cell.indexOf("\n", at + 1);
    }
  }
  return 1 + extra;
}

/** A blank (or whitespace-only) physical line, which Papa reports as [""]. */
function isBlankRow(cells: string[]): boolean {
  return cells.length === 0 || (cells.length === 1 && cells[0].trim() === "");
}

const LOCK_WARNING_FILE =
  "This file has no `locked` column, so every device is planned as unlocked. Laptops still enrolled in device management (Intune, Autopilot) or Activation Lock cannot be reused — confirm each one is released before drop-off.";

/**
 * Parses a fleet inventory CSV into devices, collecting one error list per file.
 *
 * Rows are parsed without `header: true` and without skipping empty lines, so
 * every row keeps its physical position: error rows are reported against the
 * spreadsheet line the user will actually look at, even when blank lines or
 * multi-line quoted cells come first.
 */
export function parseFleetCsv(text: string, currentYear: number): ParseResult {
  const warnings: RowError[] = [];

  // Strip a BOM and trailing whitespace, but keep leading blank lines so the
  // row numbers we report still match the file the user is looking at.
  const input = text.replace(/^\uFEFF/, "").replace(/[\s\uFEFF]+$/, "");

  const parsed = Papa.parse<string[]>(input, { skipEmptyLines: false });
  const rows = parsed.data;

  if (rows.length === 0) {
    return { devices: [], errors: [{ row: 0, message: "The file has no device rows." }], warnings };
  }

  // The header is the first non-blank row; blank lines above it are counted by
  // the line tracker below so row numbers still match the spreadsheet.
  const headerAt = rows.findIndex((cells) => !isBlankRow(cells));
  if (headerAt === -1) {
    return { devices: [], errors: [{ row: 0, message: "The file has no device rows." }], warnings };
  }

  const columns = rows[headerAt].map(normalizeHeader);
  const missing = REQUIRED_COLUMNS.filter((column) => !columns.includes(column));
  if (missing.length > 0) {
    return {
      devices: [],
      errors: [{ row: 0, message: `Missing column(s): ${missing.join(", ")}.` }],
      warnings,
    };
  }

  // First occurrence wins, matching Papa's own de-duplication of repeated headers.
  const columnIndex = new Map<string, number>();
  columns.forEach((name, at) => {
    if (name && !columnIndex.has(name)) columnIndex.set(name, at);
  });
  const lockedColumn = columnIndex.has("locked");

  // Cheap first pass: reject an oversized file before any Device object is built.
  let deviceRowCount = 0;
  for (let i = headerAt + 1; i < rows.length; i += 1) {
    if (!isBlankRow(rows[i])) deviceRowCount += 1;
  }
  if (deviceRowCount > MAX_DEVICES) {
    return {
      devices: [],
      errors: [
        {
          row: 0,
          message: `This file has ${withThousands(deviceRowCount)} device rows, but the planner handles up to ${withThousands(MAX_DEVICES)}. Split it into smaller files and upload them one at a time — one file is meant for 10 to 200 laptops.`,
        },
      ],
      warnings,
    };
  }

  const devices: Device[] = [];
  const errors: RowError[] = [];
  const seen = new Set<string>();
  let unknownLockCount = 0;
  let firstUnknownLockRow = 0;

  // Rows above the header each take at least one line; the header may wrap if a
  // field is quoted, so count spans rather than assuming the header is row 1.
  let line = 1;
  for (let i = 0; i <= headerAt; i += 1) line += lineSpan(rows[i]);

  for (let i = headerAt + 1; i < rows.length; i += 1) {
    const cells = rows[i];
    const row = line;
    line += lineSpan(cells);
    if (isBlankRow(cells)) continue;

    const get = (key: string) => {
      const at = columnIndex.get(key);
      return at === undefined ? "" : (cells[at] ?? "").trim();
    };
    const problems: string[] = [];

    const serial = get("serial");
    if (!serial) problems.push("serial is empty");
    else if (seen.has(serial.toLowerCase()))
      problems.push(`serial ${serial} appears more than once`);

    for (const key of ["make", "model", "cpu"] as const) {
      if (!get(key)) problems.push(`${key} is empty`);
    }

    const ramGb = Number(get("ram_gb"));
    if (!get("ram_gb") || !Number.isFinite(ramGb) || ramGb <= 0)
      problems.push("ram_gb must be a number above 0");

    const year = Number(get("year"));
    if (!Number.isInteger(year) || year < 1990 || year > currentYear + 1) {
      problems.push(`year must be a whole number from 1990 to ${currentYear + 1}`);
    }

    const storage = parseStorage(get("storage"));
    if (!storage) problems.push("storage must be ssd, nvme, emmc or hdd");

    const tpm = parseTpm(get("tpm"));
    if (tpm === undefined) problems.push("tpm must be yes, no, 2.0, 1.2 or blank");

    const lockedValue = parseOptionalBool(get("locked"));
    if (lockedValue === undefined) problems.push("locked must be yes, no or blank");

    if (problems.length > 0 || !storage || tpm === undefined || lockedValue === undefined) {
      errors.push({ row, message: problems.join("; ") });
      continue;
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
      lockedReported: lockedValue !== null,
    });

    if (lockedValue === null) {
      unknownLockCount += 1;
      if (firstUnknownLockRow === 0) firstUnknownLockRow = row;
    }
  }

  // One warning for the whole file, not one per row. When the column is absent
  // the file-level warning already says everything, so the row-level "starting
  // here" note is only added for a column that exists but has blank cells.
  if (!lockedColumn) {
    warnings.push({ row: 0, message: LOCK_WARNING_FILE });
  } else if (firstUnknownLockRow > 0) {
    const plural = unknownLockCount === 1 ? "" : "s";
    const pronoun = unknownLockCount === 1 ? "it is" : "they are";
    warnings.push({
      row: firstUnknownLockRow,
      message: `Lock state is blank on ${withThousands(unknownLockCount)} device${plural}, starting here, so ${pronoun} planned as unlocked. Confirm ${pronoun} released from device management or Activation Lock before drop-off.`,
    });
  }

  if (devices.length === 0 && errors.length === 0) {
    errors.push({ row: 0, message: "The file has no device rows." });
  }

  return { devices, errors, warnings };
}
