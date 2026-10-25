import { TIERS, TIER_LABELS, type OrgType, type Plan } from "./plan";

export interface SummaryInput {
  plan: Plan;
  /** Free text from the planner; blank is allowed. */
  orgName: string;
  orgType: OrgType;
  wantsCertificate: boolean;
  /** File name of the upload, or "Sample fleet". */
  source: string;
  preparedOn: Date;
}

export interface SummaryContent {
  title: string;
  details: [label: string, value: string][];
  totals: [label: string, count: number][];
  certificate: string;
  notes: string[];
  nextSteps: string[];
  devices: string[][];
  footer: string;
}

export const DEVICE_COLUMNS = ["Serial", "Device", "CPU", "RAM", "Year", "Plan", "Why"];

const currency = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** Local calendar date as YYYY-MM-DD (toISOString would shift it to UTC). */
export function isoDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function summaryFileName(orgName: string, preparedOn: Date): string {
  const slug = orgName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `donation-plan-${slug ? `${slug}-` : ""}${isoDate(preparedOn)}.pdf`;
}

function certificateLine(input: SummaryInput): string {
  const { plan, orgType, wantsCertificate } = input;
  if (!wantsCertificate) return "Not requested.";
  if (orgType === "nonprofit") {
    return `Requested for ${plural(plan.billableCount, "device", "devices")}. Free for non-profits, schools and charities.`;
  }
  if (plan.certificateTotal === 0) return "Requested. No devices are reused or harvested, so $0.";
  return `${currency.format(plan.certificateTotal)} for ${plural(plan.billableCount, "device", "devices")} reused or harvested for parts. Recycled devices are never charged.`;
}

/**
 * Everything the one-page summary says, as plain data. Kept apart from the PDF
 * drawing so the wording and the numbers can be tested without a renderer.
 */
export function buildSummary(input: SummaryInput): SummaryContent {
  const { plan } = input;
  const total = plan.devices.length;

  const notes = [
    "This plan is a prediction from your spreadsheet, not a bench result. Free Geek Toronto confirms each device when it arrives.",
  ];
  if (plan.counts.return > 0) {
    notes.push(
      `${plural(plan.counts.return, "device is", "devices are")} still locked to device management or Activation Lock and will be returned. Remove the lock before drop-off.`,
    );
  }
  if (plan.unknownLockCount > 0) {
    notes.push(
      `${plural(plan.unknownLockCount, "device has", "devices have")} no reported lock state and ${plan.unknownLockCount === 1 ? "is" : "are"} planned as unlocked. Confirm each one is released from Intune, Autopilot or Activation Lock.`,
    );
  }
  if (input.wantsCertificate) {
    notes.push(
      "The certificate is priced here, not issued. It is produced after drives are sanitized and records each serial, the method, the tool and who signed it.",
    );
  }

  return {
    title: "Laptop donation plan",
    details: [
      ["Organization", input.orgName.trim() || "Not given"],
      ["Type", input.orgType === "business" ? "Business" : "Non-profit, school or charity"],
      ["Prepared", isoDate(input.preparedOn)],
      ["Source file", input.source],
      ["Laptops", String(total)],
    ],
    totals: TIERS.map((tier) => [TIER_LABELS[tier], plan.counts[tier]]),
    certificate: certificateLine(input),
    notes,
    nextSteps: [
      "Remove device management and Activation Lock from every laptop you are donating.",
      "Contact Free Geek Toronto to arrange drop-off at 180 Sudbury Street, Unit C3, Toronto.",
      "Bring this summary with the laptops so each serial can be checked in.",
    ],
    devices: plan.devices.map((device) => [
      device.serial,
      `${device.make} ${device.model}`,
      device.cpu,
      `${device.ramGb} GB`,
      String(device.year),
      TIER_LABELS[device.tier],
      device.reason,
    ]),
    footer:
      "Prepared with FGT Retire, a concept built for FUSEHACKS 2026. Not affiliated with or endorsed by Free Geek Toronto.",
  };
}

const REPLACEMENTS: [RegExp, string][] = [
  [/[‘’‚‛′]/g, "'"],
  [/[“”„″]/g, '"'],
  [/[–—]/g, "-"],
  [/…/g, "..."],
  [/™/g, "(TM)"],
];

/**
 * The built-in PDF fonts only cover Latin-1. Typographic punctuation is mapped
 * to ASCII and anything else outside Latin-1 becomes "?" instead of mojibake.
 */
export function pdfSafe(text: string): string {
  let out = text;
  for (const [pattern, replacement] of REPLACEMENTS) out = out.replace(pattern, replacement);
  return out.replace(/[^\x20-\x7e -ÿ]/g, "?");
}

const BRAND: [number, number, number] = [4, 120, 87]; // brand-700
const MUTED: [number, number, number] = [87, 83, 78]; // stone-600
const MARGIN = 48;

/** Draws the summary as a Letter-size PDF. The PDF libraries load on first use. */
export async function renderSummaryPdf(content: SummaryContent): Promise<ArrayBuffer> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const width = doc.internal.pageSize.getWidth();
  const textWidth = width - MARGIN * 2;
  let y = MARGIN;

  const paragraph = (text: string, size = 9, color = MUTED) => {
    doc
      .setFont("helvetica", "normal")
      .setFontSize(size)
      .setTextColor(...color);
    const lines = doc.splitTextToSize(pdfSafe(text), textWidth) as string[];
    doc.text(lines, MARGIN, y);
    y += lines.length * size * 1.35 + 4;
  };
  const heading = (text: string) => {
    y += 8;
    doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(28, 25, 23);
    doc.text(pdfSafe(text), MARGIN, y);
    y += 16;
  };

  doc
    .setFont("helvetica", "bold")
    .setFontSize(20)
    .setTextColor(...BRAND);
  doc.text(content.title, MARGIN, y + 8);
  y += 32;

  for (const [label, value] of content.details) {
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(28, 25, 23);
    doc.text(`${label}:`, MARGIN, y);
    doc.setFont("helvetica", "normal").setTextColor(...MUTED);
    doc.text(pdfSafe(value), MARGIN + 80, y);
    y += 13;
  }

  heading("Where the laptops go");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Outcome", "Laptops"]],
    body: content.totals.map(([label, count]) => [label, String(count)]),
    theme: "grid",
    tableWidth: 240,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: BRAND },
    columnStyles: { 1: { halign: "right" } },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  heading("Itemized certificate");
  paragraph(content.certificate);

  heading("Before you drop off");
  for (const note of content.notes) paragraph(`- ${note}`);

  heading("Next steps");
  content.nextSteps.forEach((step, i) => paragraph(`${i + 1}. ${step}`));

  heading("Every laptop");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN, bottom: MARGIN + 16 },
    head: [DEVICE_COLUMNS],
    body: content.devices.map((row) => row.map(pdfSafe)),
    theme: "striped",
    styles: { fontSize: 7.5, cellPadding: 3, overflow: "linebreak" },
    headStyles: { fillColor: BRAND },
    // A device row is never split across pages, so a serial is always read whole.
    rowPageBreak: "avoid",
    columnStyles: {
      0: { cellWidth: 76 }, // fits a 12-character Apple serial on one line
      2: { cellWidth: 80 },
      3: { cellWidth: 32 },
      4: { cellWidth: 30 },
      5: { cellWidth: 58 },
      6: { cellWidth: 140 },
    },
  });

  const pages = doc.getNumberOfPages();
  const height = doc.internal.pageSize.getHeight();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc
      .setFont("helvetica", "normal")
      .setFontSize(7.5)
      .setTextColor(...MUTED);
    doc.text(pdfSafe(content.footer), MARGIN, height - MARGIN / 2);
    doc.text(`Page ${page} of ${pages}`, width - MARGIN, height - MARGIN / 2, { align: "right" });
  }

  return doc.output("arraybuffer");
}
