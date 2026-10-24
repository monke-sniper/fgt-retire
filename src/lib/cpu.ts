import type { Rules } from "./rules";

export type CpuInfo =
  | { vendor: "intel"; generation: number }
  | { vendor: "amd"; series: number }
  | { vendor: "apple-silicon" }
  | { vendor: "unknown" };

/** Reads a CPU name such as "Intel Core i5-8365U" or "AMD Ryzen 5 4500U". */
export function parseCpu(raw: string): CpuInfo {
  const s = raw.toLowerCase().trim();

  if (/\bapple\b.*\bm\d/.test(s) || /^m\d\b/.test(s)) {
    return { vendor: "apple-silicon" };
  }

  if (/core\s+ultra/.test(s)) {
    return { vendor: "intel", generation: 14 };
  }

  const intel = s.match(/\bi[3579][-\s]?(\d{3,5})/);
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
