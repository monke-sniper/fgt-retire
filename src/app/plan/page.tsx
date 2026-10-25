import type { Metadata } from "next";
import PlanBuilder from "@/components/PlanBuilder";

export const metadata: Metadata = {
  title: "Plan a donation",
  description:
    "Upload a laptop inventory CSV and get a per-serial plan with the reason for each tier, plus the optional certificate total. Your file is read in your browser.",
  openGraph: {
    type: "website",
    siteName: "FGT Retire",
    locale: "en_CA",
    title: "Plan a donation | FGT Retire",
    description:
      "Upload a laptop inventory CSV and get a per-serial plan with the reason for each tier, plus the optional certificate total.",
  },
};

export default function PlanPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Plan a donation</h1>
      <p className="mt-3 max-w-2xl text-stone-600">
        Upload your laptop list to see where each device will go. Your file is read in your browser
        and is not uploaded anywhere.
      </p>
      <PlanBuilder />
    </div>
  );
}
