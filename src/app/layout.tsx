import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "FGT Retire",
  description: "Free, data-safe laptop donations for organizations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
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
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-200 bg-white">
          <p className="mx-auto max-w-5xl px-4 py-6 text-sm text-stone-500">
            A concept for Free Geek Toronto, built for FUSEHACKS 2026. Not affiliated with or endorsed by
            Free Geek Toronto.
          </p>
        </footer>
      </body>
    </html>
  );
}
