"use client";

import { useMemo, useState } from "react";
import {
  MAX_BYTES,
  MAX_DEVICES,
  OPTIONAL_COLUMNS,
  REQUIRED_COLUMNS,
  checkUploadSize,
  parseFleetCsv,
  type RowError,
} from "@/lib/csv";
import { TIERS, TIER_LABELS, buildPlan, type OrgType } from "@/lib/plan";
import { buildSummary, renderSummaryPdf, summaryFileName } from "@/lib/summary";
import type { Device, Tier } from "@/lib/types";

const TIER_STYLES: Record<Tier, string> = {
  "reuse-modern": "bg-emerald-100 text-emerald-900",
  "reuse-linux": "bg-teal-100 text-teal-900",
  parts: "bg-amber-100 text-amber-900",
  recycle: "bg-stone-200 text-stone-800",
  return: "bg-rose-100 text-rose-900",
};

const currency = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });
const countFormat = new Intl.NumberFormat("en-CA");

/** How many device rows to render. The plan math still covers every row in the file. */
const ROWS_SHOWN = 100;

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export default function PlanBuilder() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [errors, setErrors] = useState<RowError[]>([]);
  const [warnings, setWarnings] = useState<RowError[]>([]);
  const [source, setSource] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [orgType, setOrgType] = useState<OrgType>("business");
  const [wantsCertificate, setWantsCertificate] = useState(true);
  const [orgName, setOrgName] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();

  const withheld = errors.length > 0;

  // No plan at all while any row is invalid: a plan over the readable subset would
  // present a partial batch as a complete one, with a total that reads as a quote.
  const plan = useMemo(
    () =>
      devices.length > 0 && !withheld
        ? buildPlan(devices, { currentYear, orgType, wantsCertificate })
        : null,
    [devices, withheld, currentYear, orgType, wantsCertificate],
  );

  function reset() {
    setDevices([]);
    setErrors([]);
    setWarnings([]);
    setRefusal(null);
  }

  function load(text: string, name: string) {
    const result = parseFleetCsv(text, currentYear);
    setDevices(result.devices);
    setErrors(result.errors);
    setWarnings(result.warnings);
    setRefusal(null);
    setSource(name);
  }

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    // Refuse before reading or parsing. A whole-inventory export would block the tab for
    // several seconds and render tens of thousands of table cells.
    const sizeProblem = checkUploadSize(file.size);
    if (sizeProblem) {
      reset();
      setSource(file.name);
      setRefusal(`${file.name}: ${sizeProblem.message} Nothing was read.`);
      return;
    }

    load(await file.text(), file.name);
  }

  async function onDownload() {
    if (!plan) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const preparedOn = new Date();
      const content = buildSummary({
        plan,
        orgName,
        orgType,
        wantsCertificate,
        source: source ?? "Uploaded file",
        preparedOn,
      });
      const bytes = await renderSummaryPdf(content);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = summaryFileName(orgName, preparedOn);
      link.click();
      // Revoke on the next tick: some browsers start the download asynchronously.
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch {
      setDownloadError("The PDF could not be created. Try again, or print this page instead.");
    } finally {
      setDownloading(false);
    }
  }

  async function onSample() {
    const response = await fetch("/samples/fleet-sample.csv");
    load(await response.text(), "Sample fleet");
  }

  const rejectedRows = errors.filter((error) => error.row > 0).length;
  const rowsInFile = devices.length + rejectedRows;
  // The count of devices planned without a reported lock state comes from the plan.
  // Warnings are file-scoped notes, not a device count, so they cannot substitute for it.
  const unknownLockCount = plan ? plan.unknownLockCount : null;
  const shownDevices = plan ? plan.devices.slice(0, ROWS_SHOWN) : [];
  const hiddenDevices = plan ? plan.devices.length - shownDevices.length : 0;

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-900">
            Upload CSV
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={onFile} />
          </label>
          <button
            type="button"
            onClick={onSample}
            className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Try a sample fleet
          </button>
          {source && <span className="text-sm text-stone-500">Loaded: {source}</span>}
        </div>
        <p className="mt-4 text-sm text-stone-500">
          Required columns: {REQUIRED_COLUMNS.join(", ")}. Optional: {OPTIONAL_COLUMNS.join(", ")}.
        </p>
        <p className="mt-1 text-sm text-stone-500">
          CSV files only, up to {countFormat.format(MAX_DEVICES)} laptops or{" "}
          {formatBytes(MAX_BYTES)}. Larger files are refused before anything is read.
        </p>
        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <fieldset className="flex items-center gap-4">
            <legend className="sr-only">Organization type</legend>
            {(["business", "nonprofit"] as const).map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="orgType"
                  checked={orgType === type}
                  onChange={() => setOrgType(type)}
                />
                {type === "business" ? "Business" : "Non-profit, school or charity"}
              </label>
            ))}
          </fieldset>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={wantsCertificate}
              onChange={(event) => setWantsCertificate(event.target.checked)}
            />
            Itemized certificate
          </label>
          <label className="flex items-center gap-2">
            Organization name
            <input
              type="text"
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
              maxLength={120}
              placeholder="Shown on the PDF"
              className="rounded-md border border-stone-300 px-2 py-1"
            />
          </label>
        </div>
      </section>

      {refusal && (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5" role="alert">
          <h2 className="font-semibold text-rose-900">File not accepted</h2>
          <p className="mt-2 text-sm text-rose-900">{refusal}</p>
        </section>
      )}

      {withheld && (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5" role="alert">
          <h2 className="font-semibold text-rose-900">
            {rejectedRows === 0
              ? "This file cannot be planned"
              : rejectedRows === 1
                ? "1 row needs attention"
                : `${countFormat.format(rejectedRows)} rows need attention`}
          </h2>
          <p className="mt-2 text-sm text-rose-900">
            {rowsInFile === 0
              ? "No rows could be read, so there is no plan and no total."
              : `${countFormat.format(devices.length)} of ${countFormat.format(rowsInFile)} rows were readable.`}{" "}
            The plan is withheld until these rows are fixed, so nothing here is a quote. A total
            over the readable rows would describe a batch you do not have.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-rose-900">
            {errors.map((error) => (
              <li key={`${error.row}-${error.message}`}>
                {error.row > 0 ? `Row ${error.row}: ` : ""}
                {error.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      {warnings.length > 0 && (
        <section className="rounded-lg border border-amber-300 bg-amber-50 p-5" role="status">
          <h2 className="font-semibold text-amber-900">
            {unknownLockCount === null
              ? "Lock state not reported"
              : unknownLockCount === 1
                ? "1 device has no reported lock state"
                : `${countFormat.format(unknownLockCount)} devices have no reported lock state`}
          </h2>
          <p className="mt-2 text-sm text-amber-900">
            Nothing in the file says whether these laptops are still enrolled in device management
            or Activation Lock, so they are planned as unlocked. A laptop that is still locked
            cannot be wiped or reused. Confirm each one is released before you hand it in.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-amber-900">
            {warnings.map((warning) => (
              <li key={`${warning.row}-${warning.message}`}>
                {warning.row > 0 ? `Row ${warning.row}: ` : ""}
                {warning.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      {plan && (
        <>
          <p className="sr-only" role="status">
            Plan ready for {countFormat.format(plan.devices.length)} devices.
          </p>

          <section
            className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5"
            aria-label="Devices per outcome"
          >
            {TIERS.map((tier) => (
              <div key={tier} className="rounded-lg border border-stone-200 bg-white p-4">
                <p className="text-3xl font-semibold">{countFormat.format(plan.counts[tier])}</p>
                <p className="mt-1 text-sm text-stone-600">{TIER_LABELS[tier]}</p>
              </div>
            ))}
          </section>

          <section className="rounded-lg border border-brand-100 bg-brand-50 p-5">
            <p className="text-sm text-brand-900">
              {countFormat.format(plan.reusedCount)} of {countFormat.format(plan.devices.length)}{" "}
              laptops go back into use as a laptop or as parts.
            </p>
            <p className="mt-2 text-2xl font-semibold text-brand-900">
              {plan.certificateTotal > 0
                ? `${currency.format(plan.certificateTotal)} for ${countFormat.format(plan.billableCount)} certified devices`
                : "Free"}
            </p>
            <p className="mt-1 text-sm text-brand-900">
              Donating is free. Recycled devices are never charged.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onDownload}
                disabled={downloading}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {downloading ? "Preparing PDF…" : "Download PDF summary"}
              </button>
              <span className="text-sm text-brand-900">
                A summary to share with your team and bring to drop-off. Made in your browser.
              </span>
            </div>
            {downloadError && (
              <p className="mt-2 text-sm text-rose-900" role="alert">
                {downloadError}
              </p>
            )}
          </section>

          <section className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Per-device donation plan. One row per serial number in the uploaded file.
              </caption>
              <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Serial
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Model
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    CPU
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    RAM
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Year
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Plan
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Why
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {shownDevices.map((device) => (
                  <tr key={device.serial}>
                    <th scope="row" className="px-4 py-3 font-mono text-xs font-normal">
                      {device.serial}
                    </th>
                    <td className="px-4 py-3">
                      {device.make} {device.model}
                    </td>
                    <td className="px-4 py-3">{device.cpu}</td>
                    <td className="px-4 py-3">{device.ramGb} GB</td>
                    <td className="px-4 py-3">{device.year}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${TIER_STYLES[device.tier]}`}
                      >
                        {TIER_LABELS[device.tier]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{device.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hiddenDevices > 0 && (
              <p className="border-t border-stone-200 px-4 py-3 text-sm text-stone-500">
                Showing the first {ROWS_SHOWN} of {countFormat.format(plan.devices.length)} devices.
                The counts and the total above cover every row in the file.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
