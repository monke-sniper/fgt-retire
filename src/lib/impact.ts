import type { Plan } from "./plan";

/**
 * Assumptions behind the impact estimate. None of them come from Free Geek
 * Toronto, so the summary prints each one next to the figure it produces.
 */
export interface ImpactAssumptions {
  /**
   * Weight of one laptop without its charger, in kg. A 14-inch business
   * laptop weighs about 1.3 to 1.6 kg, so 1.5 errs on the low side.
   */
  kgPerLaptop: number;
}

export const DEFAULT_IMPACT_ASSUMPTIONS: ImpactAssumptions = {
  kgPerLaptop: 1.5,
};

export interface Impact {
  /** Laptops planned to be resold: reuse plus reuse (open source). */
  backInUse: number;
  /** The share of `backInUse` rebuilt with open-source software. */
  openSource: number;
  parts: number;
  recycled: number;
  /**
   * Devices Free Geek Toronto keeps: everything except return to donor. A
   * locked device counts for nothing until its lock is removed.
   */
  handled: number;
  kgHandled: number;
}

export function estimateImpact(
  plan: Plan,
  assumptions: ImpactAssumptions = DEFAULT_IMPACT_ASSUMPTIONS,
): Impact {
  const { counts } = plan;
  const backInUse = counts["reuse-modern"] + counts["reuse-linux"];
  const handled = backInUse + counts.parts + counts.recycle;
  return {
    backInUse,
    openSource: counts["reuse-linux"],
    parts: counts.parts,
    recycled: counts.recycle,
    handled,
    kgHandled: handled * assumptions.kgPerLaptop,
  };
}
