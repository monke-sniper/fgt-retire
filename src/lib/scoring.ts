import { isModernCpu, parseCpu } from "./cpu";
import { DEFAULT_RULES, type Rules } from "./rules";
import type { Device, ScoredDevice, Tier } from "./types";

const NO_DAMAGE = new Set(["", "none", "no", "n/a", "na", "-"]);

export interface ScoreOptions {
  currentYear: number;
  rules?: Rules;
}

/**
 * Places a device in exactly one tier. Rules run in a fixed order and the
 * first match wins: return, recycle, parts (damage), reuse-modern,
 * reuse-linux, parts (below requirements).
 */
export function scoreDevice(device: Device, options: ScoreOptions): ScoredDevice {
  const rules = options.rules ?? DEFAULT_RULES;
  const result = (tier: Tier, reason: string): ScoredDevice => ({ ...device, tier, reason });

  if (device.locked) {
    return result(
      "return",
      "Still locked to device management or Activation Lock. Remove the lock before drop-off.",
    );
  }

  const age = options.currentYear - device.year;
  if (age > rules.recycleMaxAgeYears) {
    return result("recycle", `Older than ${rules.recycleMaxAgeYears} years.`);
  }

  const damage = device.damage.trim().toLowerCase();
  if (rules.recycleDamageKeywords.some((keyword) => damage.includes(keyword))) {
    return result("recycle", "Reported damage leaves no reusable parts.");
  }
  if (!NO_DAMAGE.has(damage)) {
    return result("parts", `Reported damage: ${device.damage.trim()}. Good parts are harvested for repairs.`);
  }

  const cpu = parseCpu(device.cpu);
  const modernCpu = isModernCpu(cpu, rules);
  const hasTpm = cpu.vendor === "apple-silicon" || (device.tpm ?? modernCpu);

  const gaps: string[] = [];
  if (device.year < rules.modern.minYear) gaps.push(`built before ${rules.modern.minYear}`);
  if (!modernCpu) gaps.push("older CPU");
  if (!hasTpm) gaps.push("no TPM 2.0");
  if (device.ramGb < rules.modern.minRamGb) gaps.push(`under ${rules.modern.minRamGb} GB RAM`);
  if (device.storage !== "ssd") gaps.push("hard drive (HDD)");

  if (gaps.length === 0) {
    return result("reuse-modern", "Meets all modern reuse requirements.");
  }

  if (device.year >= rules.linux.minYear && device.ramGb >= rules.linux.minRamGb) {
    return result("reuse-linux", `Refurbished with free, open-source software (${gaps.join(", ")}).`);
  }

  return result("parts", "Below reuse requirements. Good parts are harvested for repairs.");
}
