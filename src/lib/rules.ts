/**
 * Intake rules. Staff can tune every threshold here without touching the
 * scoring logic.
 */
export interface Rules {
  /** Devices older than this many years are recycled. */
  recycleMaxAgeYears: number;
  /** Damage notes containing any of these phrases mean no reusable parts. */
  recycleDamageKeywords: string[];
  modern: {
    minYear: number;
    minIntelGeneration: number;
    minRyzenSeries: number;
    minRamGb: number;
  };
  linux: {
    minYear: number;
    minRamGb: number;
  };
  /** Optional itemized certificate, per reused or harvested device (CAD). */
  certificatePricePerDevice: number;
}

export const DEFAULT_RULES: Rules = {
  recycleMaxAgeYears: 10,
  recycleDamageKeywords: [
    "no power",
    "does not power",
    "won't power",
    "motherboard",
    "logic board",
    "liquid damage",
    "water damage",
  ],
  modern: {
    minYear: 2019,
    minIntelGeneration: 8,
    minRyzenSeries: 2000,
    minRamGb: 8,
  },
  linux: {
    minYear: 2016,
    minRamGb: 4,
  },
  certificatePricePerDevice: 10,
};
