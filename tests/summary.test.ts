import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFleetCsv } from "../src/lib/csv";
import { buildPlan, type OrgType } from "../src/lib/plan";
import {
  DEVICE_COLUMNS,
  buildSummary,
  isoDate,
  pdfSafe,
  renderSummaryPdf,
  summaryFileName,
  type SummaryInput,
} from "../src/lib/summary";

const YEAR = 2026;
const PREPARED = new Date(2026, 9, 24, 23, 30); // late evening: must not roll to the 25th
const sample = readFileSync(join(__dirname, "..", "public", "samples", "fleet-sample.csv"), "utf8");

function input(overrides: Partial<SummaryInput> & { orgType?: OrgType } = {}): SummaryInput {
  const orgType = overrides.orgType ?? "business";
  const wantsCertificate = overrides.wantsCertificate ?? true;
  const { devices } = parseFleetCsv(sample, YEAR);
  return {
    plan: buildPlan(devices, { currentYear: YEAR, orgType, wantsCertificate }),
    orgName: "Acme Logistics",
    orgType,
    wantsCertificate,
    source: "fleet-sample.csv",
    preparedOn: PREPARED,
    ...overrides,
  };
}

describe("buildSummary", () => {
  it("carries the sample fleet's counts and certificate total", () => {
    const summary = buildSummary(input());
    expect(Object.fromEntries(summary.totals)).toEqual({
      Reuse: 7,
      "Reuse (open source)": 4,
      Parts: 3,
      Recycle: 1,
      "Return to donor": 1,
    });
    expect(summary.certificate).toContain("$140.00 for 14 devices");
    expect(summary.details).toContainEqual(["Laptops", "16"]);
    expect(summary.details).toContainEqual(["Prepared", "2026-10-24"]);
  });

  it("lists every device, not just the first screenful", () => {
    const summary = buildSummary(input());
    expect(summary.devices).toHaveLength(16);
    expect(summary.devices[0]).toHaveLength(DEVICE_COLUMNS.length);
    expect(summary.devices[0].slice(0, 2)).toEqual(["PF3K9A21", "Lenovo ThinkPad T490"]);
  });

  it("is free for a non-profit and says so", () => {
    const summary = buildSummary(input({ orgType: "nonprofit" }));
    expect(summary.certificate).toContain("Free for non-profits");
    expect(summary.certificate).not.toContain("$");
  });

  it("drops the certificate note when no certificate is wanted", () => {
    const summary = buildSummary(input({ wantsCertificate: false }));
    expect(summary.certificate).toBe("Not requested.");
    expect(summary.notes.join(" ")).not.toContain("certificate");
  });

  it("warns about locked devices and unreported lock state", () => {
    const csv =
      "serial,make,model,cpu,ram_gb,storage,year,damage,tpm,locked\nA1,Dell,X,Intel Core i5-8365U,8,ssd,2019,,yes,yes\nA2,Dell,X,Intel Core i5-8365U,8,ssd,2019,,yes,";
    const { devices } = parseFleetCsv(csv, YEAR);
    const plan = buildPlan(devices, {
      currentYear: YEAR,
      orgType: "business",
      wantsCertificate: true,
    });
    const notes = buildSummary(input({ plan })).notes.join(" ");
    expect(notes).toContain("1 device is still locked");
    expect(notes).toContain("1 device has no reported lock state");
  });

  it("says Not given for a blank organization name", () => {
    expect(buildSummary(input({ orgName: "   " })).details[0]).toEqual([
      "Organization",
      "Not given",
    ]);
  });
});

describe("summaryFileName", () => {
  it("slugs the organization name and dates the file", () => {
    expect(summaryFileName("Acme Logistics, Inc.", PREPARED)).toBe(
      "donation-plan-acme-logistics-inc-2026-10-24.pdf",
    );
  });

  it("omits the slug when there is no name", () => {
    expect(summaryFileName("", PREPARED)).toBe("donation-plan-2026-10-24.pdf");
  });

  it("uses the local date", () => {
    expect(isoDate(PREPARED)).toBe("2026-10-24");
  });
});

describe("pdfSafe", () => {
  it("maps typographic punctuation to ASCII and keeps Latin-1", () => {
    expect(pdfSafe("Intel® Core™ — “no power” café")).toBe('Intel® Core(TM) - "no power" café');
  });

  it("replaces characters the built-in fonts cannot draw", () => {
    expect(pdfSafe("笔记本 ok")).toBe("??? ok");
  });
});

describe("renderSummaryPdf", () => {
  it("produces a PDF document", async () => {
    const bytes = await renderSummaryPdf(buildSummary(input()));
    const head = new TextDecoder().decode(bytes.slice(0, 5));
    expect(head).toBe("%PDF-");
    expect(bytes.byteLength).toBeGreaterThan(2000);
  });

  it("spills a large fleet onto more pages", async () => {
    const header = "serial,make,model,cpu,ram_gb,storage,year,damage,tpm,locked";
    const rows = Array.from(
      { length: 200 },
      (_, i) => `S${i},Lenovo,ThinkPad T490,Intel Core i5-8365U,16,ssd,2019,,yes,no`,
    );
    const { devices } = parseFleetCsv([header, ...rows].join("\n"), YEAR);
    const plan = buildPlan(devices, {
      currentYear: YEAR,
      orgType: "business",
      wantsCertificate: true,
    });
    const text = new TextDecoder("latin1").decode(
      await renderSummaryPdf(buildSummary(input({ plan }))),
    );
    const pages = text.match(/\/Type \/Page\b/g) ?? [];
    expect(pages.length).toBeGreaterThan(2);
  });
});
