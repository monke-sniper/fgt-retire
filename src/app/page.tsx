import type { Metadata } from "next";
import Link from "next/link";
import { MAX_DEVICES } from "@/lib/csv";

export const metadata: Metadata = {
  title: "Know what happens to every laptop before you donate it",
  description:
    "Upload a laptop inventory CSV and see where each serial goes: reuse, reuse with open-source software, parts, recycle or back to the donor. The file is read in your browser.",
  openGraph: {
    type: "website",
    siteName: "FGT Retire",
    locale: "en_CA",
    title: "Know what happens to every laptop before you donate it",
    description:
      "Sort a laptop fleet into reuse, parts and recycle from a CSV, and price an optional itemized certificate. Runs in the browser.",
  },
};

const shipping = [
  {
    title: "Upload your fleet",
    body: `Export your laptop list from your IT inventory as a CSV. Up to ${MAX_DEVICES} laptops, seven required columns and three optional ones. Every row the app cannot read comes back with its spreadsheet row number.`,
  },
  {
    title: "Get a plan",
    body: "Every serial number is checked against the same ordered rules. You see the tier, the reason for it, and the certificate total. If any row is unreadable, the plan is withheld until the row is fixed.",
  },
];

const planned = [
  {
    title: "Drop-off booking",
    body: "A slot picker with a monthly intake cap, so batches do not pile up in the workshop. There is no booking system yet.",
  },
  {
    title: "The tracker and the certificate",
    body: "A per-serial record from received to wiped to tested to reused, ending in a printable record. Neither the tracker nor the certificate exists yet.",
  },
];

const outcomes = [
  {
    label: "Reuse",
    body: "Refurbished and sold at low prices to students, newcomers, seniors and low-income households.",
  },
  {
    label: "Reuse (open source)",
    body: "Older but capable machines get free, open-source software instead of becoming e-waste.",
  },
  { label: "Parts", body: "Good RAM, drives and chargers repair other laptops." },
  {
    label: "Recycle",
    body: "Machines more than ten years old are past their reuse window and go to responsible recycling.",
  },
];

export default function Home() {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <p className="text-sm font-medium tracking-wide text-brand-700 uppercase">
            For organizations with 10 to 200 laptops
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Know what happens to every laptop before you donate it.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-stone-600">
            Upload your laptop list and FGT Retire sorts each serial number into reuse, reuse with
            open-source software, parts, recycle or return to donor. It also prices the optional
            itemized certificate. Your file is read in your browser.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/plan"
              className="rounded-md bg-brand-600 px-5 py-3 font-medium text-white hover:bg-brand-700"
            >
              Plan a donation
            </Link>
            <a
              href="/samples/fleet-sample.csv"
              className="rounded-md border border-stone-300 bg-white px-5 py-3 font-medium text-stone-700 hover:bg-stone-50"
            >
              Download a sample CSV
            </a>
          </div>
          <p className="mt-6 max-w-2xl text-sm text-stone-500">
            Working today: the CSV upload, the tier rules and the plan. Not built yet: drop-off
            booking, the tracker and certificates.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">What works today</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2">
          {shipping.map((step, i) => (
            <li key={step.title} className="rounded-lg border border-stone-200 bg-white p-5">
              <span className="text-sm font-semibold text-brand-700">Step {i + 1}</span>
              <h3 className="mt-2 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-stone-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">What is coming next</h2>
          <p className="mt-3 max-w-2xl text-stone-600">
            These two steps are the point of the service, and neither one is built. They are listed
            here so the gap is clear.
          </p>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2">
            {planned.map((step) => (
              <li key={step.title} className="rounded-lg border border-dashed border-stone-300 p-5">
                <span className="rounded-full bg-stone-200 px-2 py-1 text-xs font-medium text-stone-700">
                  Planned
                </span>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Where every laptop goes</h2>
        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          {outcomes.map((outcome) => (
            <div key={outcome.label}>
              <dt className="font-semibold text-brand-900">{outcome.label}</dt>
              <dd className="mt-1 text-sm text-stone-600">{outcome.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">What happens to the drives</h2>
          <div className="mt-6 max-w-3xl space-y-4 text-stone-600">
            <p>
              Free Geek Toronto overwrites drives before reuse. Its published method is a three to
              five pass overwrite for hard disks. This app does not wipe anything and does not
              record wipe results, so it cannot tell you today that a given drive was sanitized.
            </p>
            <p>
              The standard this app is built around splits by media type. Magnetic hard drives get
              NIST SP 800-88 <span className="font-medium">Clear</span>, which is a single overwrite
              pass. Solid-state drives and other flash cannot be cleaned by overwriting, because the
              controller keeps spare cells, so they need <span className="font-medium">Purge</span>,
              meaning a crypto-erase or the drive&apos;s own sanitize command, or they get
              destroyed. NIST recommends Purge over Clear wherever the media supports it, and warns
              against multi-pass overwrite on flash.
            </p>
            <p>
              There is no NIST certification. SP 800-88 is guidance, and a per-serial record is
              evidence of what a tool did, not a certification of it. The facility certifications in
              this chain belong to Free Geek Toronto&apos;s downstream recycling partner, not to
              this app.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <p className="text-3xl font-semibold">Free</p>
            <p className="mt-2 text-sm text-stone-600">
              Donating is free. Devices sent to recycling are never charged.
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <p className="text-3xl font-semibold">$10</p>
            <p className="mt-2 text-sm text-stone-600">
              Optional itemized certificate, per device reused or harvested for parts. This is the
              intended price. The certificate itself is not built yet.
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <p className="text-3xl font-semibold">$0</p>
            <p className="mt-2 text-sm text-stone-600">
              Certificates are free for non-profits, schools and charities.
            </p>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-sm text-stone-500">
          What a certificate would and would not attest: it would record the serial, the
          sanitization method and technique, the tool and its version, and the person who signed it.
          It would not be a legal guarantee. Under PIPEDA the organization donating the hardware
          stays responsible for the data on it.
        </p>
      </section>
    </>
  );
}
