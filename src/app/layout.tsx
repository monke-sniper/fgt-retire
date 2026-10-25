import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FGT Retire",
    template: "%s | FGT Retire",
  },
  description:
    "Sort a laptop fleet into reuse, parts and recycle from a CSV, and price an optional itemized certificate. Built for Free Geek Toronto.",
  applicationName: "FGT Retire",
  openGraph: {
    type: "website",
    siteName: "FGT Retire",
    locale: "en_CA",
    title: "FGT Retire",
    description:
      "Upload a laptop inventory CSV and see where each serial goes. Runs in the browser; nothing is uploaded.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-brand-900 focus:shadow"
        >
          Skip to content
        </a>
        <header className="border-b border-stone-200 bg-white">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight text-brand-900">
              FGT Retire
            </Link>
            <Link
              href="/plan"
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Plan a donation
            </Link>
          </nav>
        </header>
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <footer className="border-t border-stone-200 bg-white">
          <p className="mx-auto max-w-5xl px-4 py-6 text-sm text-stone-500">
            A concept for Free Geek Toronto, built for FUSEHACKS 2026. Not affiliated with or
            endorsed by Free Geek Toronto.
          </p>
        </footer>
      </body>
    </html>
  );
}
