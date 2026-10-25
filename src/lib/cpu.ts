import type { Rules } from "./rules";

export type CpuInfo =
  | { vendor: "intel"; generation: number }
  | { vendor: "amd"; series: number }
  | { vendor: "apple-silicon" }
  | { vendor: "unknown" };

/**
 * Apple silicon from M1 on. The generation is not capped, so a new chip (M5
 * shipped in late 2025) is read without a code change; every M-series chip
 * clears the modern bar.
 */
const APPLE_CHIP = /\bm([1-9])(?:\s*(?:pro|max|ultra))?\b(?!\s*-?\d)/;
/** Mac hardware names that may precede a chip name ("MacBook Pro (M2)"). */
const APPLE_HARDWARE = /\b(?:apple|macbook|mac\s?mini|imac|mac\s?studio|mac\s?pro)\b/;
/** A note that is *only* a chip name, e.g. "M2 Pro". */
const APPLE_CHIP_ONLY = /^m[1-9]\b(?!\s*-?\d)/;

/**
 * Reads a CPU name such as "Intel Core i5-8365U", "AMD Ryzen™ 5 4500U" or
 * "MacBook Pro (M2)". Trademark symbols and typographic apostrophes are
 * stripped first, so the noisy strings that come out of a real asset export
 * ("Intel(R) Core(TM) i5-8365U CPU @ 1.60GHz", "Ryzen®") still parse.
 */
export function parseCpu(raw: string): CpuInfo {
  const s = raw
    .toLowerCase()
    .replace(/[\u2122\u00ae\u00a9\u2120]/g, " ") // ™ ® © ℠
    .replace(/[\u2018\u2019\u201a\u201b\u2032]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  // Apple silicon: match anywhere in the string, not just at the start, but
  // only when the string is a Mac name or is itself a chip name. That keeps
  // Intel "Core m3-8100Y" out (the chip regex refuses a hyphenated part number
  // and Intel's Core m chips always carry one).
  if ((APPLE_HARDWARE.test(s) && APPLE_CHIP.test(s)) || APPLE_CHIP_ONLY.test(s)) {
    return { vendor: "apple-silicon" };
  }

  if (/core\s+ultra/.test(s)) {
    return { vendor: "intel", generation: 14 };
  }

  const intel = s.match(/\bi[3579][- ]?(\d{3,5})/);
  if (intel) {
    const digits = intel[1];
    let generation: number;
    if (digits.length === 5) {
      generation = Number(digits.slice(0, 2)); // i5-10310U -> 10
    } else if (digits.length === 4 && digits[0] === "1") {
      generation = Number(digits.slice(0, 2)); // i5-1145G7 -> 11
    } else if (digits.length === 4) {
      generation = Number(digits[0]); // i5-8365U -> 8
    } else {
      generation = 1; // i5-520M
    }
    return { vendor: "intel", generation };
  }

  const ryzen = s.match(/ryzen\s*\d\s*(?:pro\s*)?(\d)\d{3}/);
  if (ryzen) {
    return { vendor: "amd", series: Number(ryzen[1]) * 1000 };
  }

  return { vendor: "unknown" };
}

export function isModernCpu(cpu: CpuInfo, rules: Rules): boolean {
  switch (cpu.vendor) {
    case "intel":
      return cpu.generation >= rules.modern.minIntelGeneration;
    case "amd":
      return cpu.series >= rules.modern.minRyzenSeries;
    case "apple-silicon":
      return true;
    default:
      return false;
  }
}
