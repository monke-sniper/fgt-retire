import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "That page does not exist. The app has two pages: the overview and the donation planner.",
  openGraph: {
    title: "Page not found | FGT Retire",
    description: "That page does not exist.",
  },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start px-4 py-24">
      <p className="text-sm font-medium tracking-wide text-brand-700 uppercase">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">This page does not exist.</h1>
      <p className="mt-3 text-stone-600">
        There are two pages in this app: the overview and the donation planner. A link may be out of
        date.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-md bg-brand-600 px-5 py-3 font-medium text-white hover:bg-brand-700"
        >
          Go to the overview
        </Link>
        <Link
          href="/plan"
          className="rounded-md border border-stone-300 bg-white px-5 py-3 font-medium text-stone-700 hover:bg-stone-50"
        >
          Plan a donation
        </Link>
      </div>
    </div>
  );
}
