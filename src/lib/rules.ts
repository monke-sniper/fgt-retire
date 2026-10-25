/**
 * Intake rules. Staff can tune every threshold here without touching the
 * scoring logic.
 */
export interface Rules {
  /**
   * Devices older than this many years are recycled. This is the *only* rule
   * that can send a device to recycling: nothing in the `damage` column does.
   * A free-text note cannot tell us whether a machine has reusable parts, so
   * any reported damage routes to parts and the bench makes that call.
   */
  recycleMaxAgeYears: number;
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
