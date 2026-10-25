import type { Metadata } from "next";
import Link from "next/link";
import { MAX_DEVICES } from "@/lib/csv";

export const metadata: Metadata = {
  title: "Retiring laptops? See where every one goes before you donate",
  description:
    "For businesses retiring 10 to 200 laptops. Upload your laptop list, see which machines are reused, rebuilt with open-source software, harvested for parts or recycled, and download a PDF summary. Donating is free.",
  openGraph: {
    type: "website",
    siteName: "FGT Retire",
    locale: "en_CA",
    title: "Retiring laptops? See where every one goes before you donate",
    description:
      "Upload a laptop list and get a per-serial donation plan and a PDF summary in under a minute. Your file stays in your browser.",
  },
};

const steps = [
  {
    title: "Export your laptop list",
    body: `A CSV from your IT inventory: serial, make, model, CPU, RAM, storage and year. Up to ${MAX_DEVICES.toLocaleString("en-CA")} laptops. Any row we cannot read comes back with its spreadsheet row number.`,
  },
  {
    title: "See where each laptop goes",
    body: "Every serial gets an outcome and a plain-language reason, checked against the same intake rules. Nothing is uploaded: the file is read in your browser.",
  },
  {
    title: "Download the PDF summary",
    body: "One document with the totals, the per-laptop plan and what to do before drop-off. Share it with your manager or finance team, then bring it with the laptops.",
  },
];

const outcomes = [
  {
    label: "Reuse",
    body: "Refurbished and sold at low prices to students, newcomers, seniors and low-income households in Toronto.",
  },
  {
    label: "Reuse (open source)",
    body: "Too old for Windows 11 but still capable. Rebuilt with free, open-source software instead of becoming e-waste.",
  },
  {
    label: "Parts",
    body: "Damaged or underpowered machines give their RAM, drives and chargers to other repairs.",
  },
  {
    label: "Recycle",
    body: "More than ten years old, so past the reuse window. Sent to responsible recycling and never charged.",
  },
  {
    label: "Return to donor",
    body: "Still enrolled in device management or Activation Lock. Remove the lock and it can be reused.",
  },
];

const reasons = [
  {
    title: "Your laptops close the digital divide",
    body: "Toronto households earning under $50,000 have fewer computers per person than higher-income ones. A refurbished business laptop is often a family's first reliable computer.",
  },
  {
    title: "They create local tech jobs",
    body: "Free Geek Toronto refurbishes with staff and volunteers who face barriers to employment, many of them building a career in tech repair.",
  },
  {
    title: "Matching batches go furthest",
    body: "Fifty of the same model share parts and one wipe procedure, so a uniform fleet is the fastest donation to turn around. That is exactly what this tool is for.",
  },
];

const notYet = [
  "Drop-off booking with a monthly intake cap",
  "A per-serial tracker from received to wiped to tested to reused",
  "The itemized certificate document (it is priced today, not issued)",
];

export default function Home() {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <p className="text-sm font-medium tracking-wide text-brand-700 uppercase">
            For businesses retiring 10 to 200 laptops
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Retiring laptops? See where every one goes before you donate.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-stone-600">
            Upload your laptop list and get a plan for each serial number in under a minute: reused,
            rebuilt with open-source software, harvested for parts or recycled. Then download a PDF
            summary to share internally. Donating is free.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/plan"
              className="rounded-md bg-brand-600 px-5 py-3 font-medium text-white hover:bg-brand-700"
            >
              Plan your donation
            </Link>
            <a
              href="/samples/fleet-sample.csv"
              className="rounded-md border border-stone-300 bg-white px-5 py-3 font-medium text-stone-700 hover:bg-stone-50"
            >
              Download a sample CSV
            </a>
          </div>
          <p className="mt-6 max-w-2xl text-sm text-stone-500">
            Your file never leaves your browser. No account, no upload, nothing stored.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
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
          <h2 className="text-2xl font-semibold tracking-tight">Why donate to Free Geek Toronto</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {reasons.map((reason) => (
              <div key={reason.title}>
                <h3 className="font-semibold text-brand-900">{reason.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{reason.body}</p>
              </div>
            ))}
          </div>
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
          <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-stone-200 p-5">
              <p className="text-3xl font-semibold">Free</p>
              <p className="mt-2 text-sm text-stone-600">
                Donating is free. Devices sent to recycling are never charged.
              </p>
            </div>
            <div className="rounded-lg border border-stone-200 p-5">
              <p className="text-3xl font-semibold">$10</p>
              <p className="mt-2 text-sm text-stone-600">
                Optional itemized certificate for businesses, per laptop reused or harvested for
                parts. The fee funds the refurbishing that puts your laptops back to work.
              </p>
            </div>
            <div className="rounded-lg border border-stone-200 p-5">
              <p className="text-3xl font-semibold">$0</p>
              <p className="mt-2 text-sm text-stone-600">
                Certificates are free for non-profits, schools and charities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">What happens to your data</h2>
        <div className="mt-6 max-w-3xl space-y-4 text-stone-600">
          <p>
            Free Geek Toronto sanitizes drives before reuse. The standard this tool is built around,
            NIST SP 800-88, splits by media: hard drives get{" "}
            <span className="font-medium">Clear</span> (an overwrite), while SSDs and other flash
            need <span className="font-medium">Purge</span> (a crypto-erase or the drive&apos;s own
            sanitize command) or physical destruction, because overwriting cannot reach the spare
            cells a flash controller keeps.
          </p>
          <p>
            This tool plans the donation. It does not wipe drives or record wipe results, and there
            is no such thing as NIST certification: SP 800-88 is guidance. Under PIPEDA your
            organization stays responsible for the data it hands over, so remove what you can before
            drop-off.
          </p>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-lg font-semibold">Not built yet</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-600">
            {notYet.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
