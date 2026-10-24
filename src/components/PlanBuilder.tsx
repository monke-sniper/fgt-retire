"use client";

import { useMemo, useState } from "react";
import { OPTIONAL_COLUMNS, REQUIRED_COLUMNS, parseFleetCsv, type RowError } from "@/lib/csv";
import { TIERS, TIER_LABELS, buildPlan, type OrgType } from "@/lib/plan";
import type { Device, Tier } from "@/lib/types";

const TIER_STYLES: Record<Tier, string> = {
  "reuse-modern": "bg-emerald-100 text-emerald-900",
  "reuse-linux": "bg-teal-100 text-teal-900",
  parts: "bg-amber-100 text-amber-900",
  recycle: "bg-stone-200 text-stone-800",
  return: "bg-rose-100 text-rose-900",
};

const currency = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

export default function PlanBuilder() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [errors, setErrors] = useState<RowError[]>([]);
  const [source, setSource] = useState<string | null>(null);
  const [orgType, setOrgType] = useState<OrgType>("business");
  const [wantsCertificate, setWantsCertificate] = useState(true);

  const currentYear = new Date().getFullYear();

  const plan = useMemo(
    () => (devices.length > 0 ? buildPlan(devices, { currentYear, orgType, wantsCertificate }) : null),
    [devices, currentYear, orgType, wantsCertificate],
  );

  function load(text: string, name: string) {
    const result = parseFleetCsv(text, currentYear);
    setDevices(result.devices);
    setErrors(result.errors);
    setSource(name);
  }

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    load(await file.text(), file.name);
    event.target.value = "";
  }

  async function onSample() {
    const response = await fetch("/samples/fleet-sample.csv");
    load(await response.text(), "Sample fleet");
  }

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
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
        </div>
      </section>

      {errors.length > 0 && (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5" role="alert">
          <h2 className="font-semibold text-rose-900">
            {errors.length === 1 ? "1 row needs attention" : `${errors.length} rows need attention`}
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-rose-900">
            {errors.map((error) => (
              <li key={`${error.row}-${error.message}`}>
                {error.row > 0 ? `Row ${error.row}: ` : ""}
                {error.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      {plan && (
        <>
          <section className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {TIERS.map((tier) => (
              <div key={tier} className="rounded-lg border border-stone-200 bg-white p-4">
                <p className="text-3xl font-semibold">{plan.counts[tier]}</p>
                <p className="mt-1 text-sm text-stone-600">{TIER_LABELS[tier]}</p>
              </div>
            ))}
          </section>

          <section className="rounded-lg border border-brand-100 bg-brand-50 p-5">
            <p className="text-sm text-brand-900">
              {plan.reusedCount} of {plan.devices.length} laptops go back into use as a laptop or as parts.
            </p>
            <p className="mt-2 text-2xl font-semibold text-brand-900">
              {plan.certificateTotal > 0
                ? `${currency.format(plan.certificateTotal)} for ${plan.billableCount} certified devices`
                : "Free"}
            </p>
            <p className="mt-1 text-sm text-brand-900">Donating is free. Recycled devices are never charged.</p>
          </section>

          <section className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Serial</th>
                  <th className="px-4 py-3 font-medium">Model</th>
                  <th className="px-4 py-3 font-medium">CPU</th>
                  <th className="px-4 py-3 font-medium">RAM</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Why</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {plan.devices.map((device) => (
                  <tr key={device.serial}>
                    <td className="px-4 py-3 font-mono text-xs">{device.serial}</td>
                    <td className="px-4 py-3">
                      {device.make} {device.model}
                    </td>
                    <td className="px-4 py-3">{device.cpu}</td>
                    <td className="px-4 py-3">{device.ramGb} GB</td>
                    <td className="px-4 py-3">{device.year}</td>
                    <td className="px-4 py-3">
                      <span className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${TIER_STYLES[device.tier]}`}>
                        {TIER_LABELS[device.tier]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{device.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
