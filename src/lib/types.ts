export type Storage = "ssd" | "hdd";

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
  /** Still enrolled in device management or Activation Lock. */
  locked: boolean;
}

export type Tier = "reuse-modern" | "reuse-linux" | "parts" | "recycle" | "return";

export interface ScoredDevice extends Device {
  tier: Tier;
  reason: string;
}
