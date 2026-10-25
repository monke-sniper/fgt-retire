/** NVMe is folded into "ssd"; eMMC stays separate because it is soldered, slow flash. */
export type Storage = "ssd" | "emmc" | "hdd";

export interface Device {
  serial: string;
  make: string;
  model: string;
  cpu: string;
  ramGb: number;
  storage: Storage;
  year: number;
  damage: string;
  /** null when not reported; inferred from the CPU during scoring. */
  tpm: boolean | null;
  /**
   * Still enrolled in device management or Activation Lock. Unreported lock
   * state is `false` here on purpose — see `lockedReported` and the comment in
   * scoring.ts for why the tier is not downgraded for a missing column.
   */
  locked: boolean;
  /**
   * True only when the file actually supplied a parseable yes/no for this
   * device. `false` means "nobody told us", which is not the same fact as
   * "unlocked": a fleet export without a `locked` column says nothing about
   * Intune/Autopilot enrolment.
   */
  lockedReported: boolean;
}

export type Tier = "reuse-modern" | "reuse-linux" | "parts" | "recycle" | "return";

export interface ScoredDevice extends Device {
  tier: Tier;
  reason: string;
}
