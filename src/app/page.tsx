import Link from "next/link";

const steps = [
  {
    title: "Upload your fleet",
    body: "Export your laptop list from your IT inventory as a CSV, or fill in a short form.",
  },
  {
    title: "Get an instant plan",
    body: "Every serial number is checked against clear rules. You see what will be reused, harvested for parts or recycled.",
  },
  {
    title: "Book a drop-off",
    body: "Pick a slot that fits. Intake is capped each month so every batch gets proper care.",
  },
  {
    title: "Track and certify",
    body: "Follow each laptop from received to wiped to reused. Get a data sanitization record for every serial.",
  },
];

const outcomes = [
  { label: "Reuse", body: "Refurbished and sold at low prices to students, newcomers, seniors and low-income households." },
  { label: "Reuse (open source)", body: "Older but capable machines get free, open-source software instead of becoming e-waste." },
  { label: "Parts", body: "Good RAM, drives and chargers repair other laptops." },
  { label: "Recycle", body: "Devices with no reusable parts go to responsible recycling." },
];

export default function Home() {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-700">For organizations with 10 to 200 laptops</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Retire your old laptops. Keep your data safe. Give them a second life.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-stone-600">
            Donate your fleet in minutes. Every drive is wiped following NIST SP 800-88, and every working
            laptop goes back into the community at an affordable price.
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
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          <h2 className="text-2xl font-semibold tracking-tight">Where every laptop goes</h2>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            {outcomes.map((outcome) => (
              <div key={outcome.label}>
                <dt className="font-semibold text-brand-900">{outcome.label}</dt>
                <dd className="mt-1 text-sm text-stone-600">{outcome.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <p className="text-3xl font-semibold">Free</p>
            <p className="mt-2 text-sm text-stone-600">Donating is always free. Every drive is wiped.</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <p className="text-3xl font-semibold">$10</p>
            <p className="mt-2 text-sm text-stone-600">
              Optional itemized certificate, per device reused or harvested. Recycled devices are never charged.
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <p className="text-3xl font-semibold">$0</p>
            <p className="mt-2 text-sm text-stone-600">Certificates are free for non-profits, schools and charities.</p>
          </div>
        </div>
      </section>
    </>
  );
}
