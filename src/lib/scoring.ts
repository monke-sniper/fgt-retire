import { isModernCpu, parseCpu } from "./cpu";
import { DEFAULT_RULES, type Rules } from "./rules";
import type { Device, ScoredDevice, Tier } from "./types";

/**
 * Damage notes that mean "nothing to report". Compared against
 * normalizeDamage() output, so case, padding, doubled spaces and a trailing
 * period never matter: "No damage.", "  NONE ", "n.a." and "none reported" all
 * land here.
 *
 * This set is the only thing the `damage` column decides: whether a note says
 * "no damage" or something else. It never decides *how much* damage, because a
 * free-text note cannot support that judgement.
 */
const NO_DAMAGE = new Set([
  "",
  "-",
  "na",
  "n.a",
  "n.a.",
  "n/a",
  "nil",
  "no",
  "no damage",
  "no damage reported",
  "no issues",
  "no issues found",
  "no reported damage",
  "none",
  "none reported",
  "nothing",
]);

const APOSTROPHES = /[\u2018\u2019\u201a\u201b\u2032]/g;
const DOUBLE_QUOTES = /[\u201c\u201d\u201e\u2033]/g;

/**
 * Normalizes a free-text damage note for comparison: typographic apostrophes
 * and quotes become ASCII, case and spacing are flattened, and trailing
 * periods are dropped.
 */
export function normalizeDamage(raw: string): string {
  return raw
    .replace(APOSTROPHES, "'")
    .replace(DOUBLE_QUOTES, '"')
    .replace(/\u00a0/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.\s]+$/, "");
}

export interface ScoreOptions {
  currentYear: number;
  rules?: Rules;
}

/**
 * Places a device in exactly one tier. Rules run in a fixed order and the
 * first match wins: return, recycle (age), parts (any reported damage),
 * reuse-modern, reuse-linux, parts (below requirements).
 *
 * Recycling is decided by age alone. An earlier version tried to read
 * "no reusable parts" out of the damage note with a keyword list, and it was
 * wrong in both directions on ordinary phrasing ("no power button", "liquid
 * damage repaired, works" were shredded; "does not turn on", "dead board" were
 * billed as parts). Free text cannot support that inference, so damage is now a
 * routing flag only.
 */
export function scoreDevice(device: Device, options: ScoreOptions): ScoredDevice {
  const rules = options.rules ?? DEFAULT_RULES;
  const result = (tier: Tier, reason: string): ScoredDevice => ({ ...device, tier, reason });

  // Unreported lock state still tiers as unlocked: the CSV contract lets a
  // fleet export omit `locked` (most Intune exports do), and flipping every one
  // of those devices to "return" would refuse an entire legitimate donation on
  // the strength of a column that was never asked for — a bigger lie than the
  // one it fixes. The honesty lives in ParseResult.warnings and in
  // Plan.unknownLockCount, which tell the user how many devices are planned
  // unlocked without a reported lock state.
  if (device.locked) {
    return result(
      "return",
      "Still locked to device management or Activation Lock. Remove the lock before drop-off.",
    );
  }

  const age = options.currentYear - device.year;
  if (age > rules.recycleMaxAgeYears) {
    return result(
      "recycle",
      `Older than ${rules.recycleMaxAgeYears} years, so it is past its reuse window.`,
    );
  }

  const damage = normalizeDamage(device.damage);
  if (!NO_DAMAGE.has(damage)) {
    return result(
      "parts",
      `Reported damage: "${device.damage.trim()}". Harvested for parts rather than reused — the bench decides what is salvageable.`,
    );
  }

  const cpu = parseCpu(device.cpu);
  const modernCpu = isModernCpu(cpu, rules);
  const hasTpm = cpu.vendor === "apple-silicon" || (device.tpm ?? modernCpu);

  const gaps: string[] = [];
  if (device.year < rules.modern.minYear) gaps.push(`built before ${rules.modern.minYear}`);
  if (cpu.vendor === "unknown") {
    // Never assert "older CPU" about a chip we could not read. The remaining
    // facts still decide the tier, so an unrecognized CPU that clears year,
    // RAM and storage lands in reuse-linux rather than parts.
    gaps.push(
      device.tpm === true
        ? "CPU not recognized, so its generation could not be verified"
        : "CPU not recognized, so TPM and generation could not be verified",
    );
  } else if (!modernCpu) {
    gaps.push("older CPU");
  }
  if (!hasTpm) gaps.push("no TPM 2.0");
  if (device.ramGb < rules.modern.minRamGb) gaps.push(`under ${rules.modern.minRamGb} GB RAM`);
  if (device.storage === "hdd") gaps.push("hard drive (HDD)");
  if (device.storage === "emmc") gaps.push("eMMC storage");

  if (gaps.length === 0) {
    return result("reuse-modern", "Meets all modern reuse requirements.");
  }

  if (device.year >= rules.linux.minYear && device.ramGb >= rules.linux.minRamGb) {
    return result(
      "reuse-linux",
      `Refurbished with free, open-source software (${gaps.join(", ")}).`,
    );
  }

  return result("parts", "Below reuse requirements. Good parts are harvested for repairs.");
}
