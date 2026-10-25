"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Kept out of the UI: the message can carry internals. The browser console keeps it.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start px-4 py-24">
      <p className="text-sm font-medium tracking-wide text-rose-700 uppercase">Error</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Something broke on this page.</h1>
      <p className="mt-3 text-stone-600">
        Nothing you uploaded was sent anywhere; the planner reads files in your browser. Try again,
        and if it keeps failing, reload the page.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-brand-600 px-5 py-3 font-medium text-white hover:bg-brand-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-stone-300 bg-white px-5 py-3 font-medium text-stone-700 hover:bg-stone-50"
        >
          Go to the overview
        </Link>
      </div>
      {error.digest && (
        <p className="mt-8 text-xs text-stone-500">Reference for the logs: {error.digest}</p>
      )}
    </div>
  );
}
