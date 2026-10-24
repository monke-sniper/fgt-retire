import { DEFAULT_RULES, type Rules } from "./rules";
import { scoreDevice } from "./scoring";
import type { Device, ScoredDevice, Tier } from "./types";

export type OrgType = "business" | "nonprofit";

export const TIERS: Tier[] = ["reuse-modern", "reuse-linux", "parts", "recycle", "return"];

export const TIER_LABELS: Record<Tier, string> = {
  "reuse-modern": "Reuse",
  "reuse-linux": "Reuse (open source)",
  parts: "Parts",
  recycle: "Recycle",
  return: "Return to donor",
};

export interface PlanOptions {
  currentYear: number;
  orgType: OrgType;
  wantsCertificate: boolean;
  rules?: Rules;
}

export interface Plan {
  devices: ScoredDevice[];
  counts: Record<Tier, number>;
  /** Devices that go back into use as a laptop or as parts. */
  reusedCount: number;
  /** Devices covered by the optional certificate fee. */
  billableCount: number;
  certificateTotal: number;
}

export function buildPlan(devices: Device[], options: PlanOptions): Plan {
  const rules = options.rules ?? DEFAULT_RULES;
  const scored = devices.map((device) =>
    scoreDevice(device, { currentYear: options.currentYear, rules }),
  );

  const counts = Object.fromEntries(TIERS.map((tier) => [tier, 0])) as Record<Tier, number>;
  for (const device of scored) counts[device.tier] += 1;

  const reusedCount = counts["reuse-modern"] + counts["reuse-linux"] + counts.parts;
  const billableCount = reusedCount;
  const charged = options.wantsCertificate && options.orgType === "business";
  const certificateTotal = charged ? billableCount * rules.certificatePricePerDevice : 0;

  return { devices: scored, counts, reusedCount, billableCount, certificateTotal };
}
