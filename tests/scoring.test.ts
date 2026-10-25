import { describe, expect, it } from "vitest";
import { normalizeDamage, scoreDevice } from "../src/lib/scoring";
import type { Device } from "../src/lib/types";

const YEAR = 2026;

const base: Device = {
  serial: "TEST-1",
  make: "Lenovo",
  model: "ThinkPad T490",
  cpu: "Intel Core i5-8365U",
  ramGb: 8,
  storage: "ssd",
  year: 2019,
  damage: "",
  tpm: true,
  locked: false,
  lockedReported: true,
};

const score = (overrides: Partial<Device>) =>
  scoreDevice({ ...base, ...overrides }, { currentYear: YEAR });
const tierOf = (overrides: Partial<Device>) => score(overrides).tier;

describe("scoreDevice", () => {
  it("accepts a modern laptop for reuse", () => {
    expect(tierOf({})).toBe("reuse-modern");
  });

  it("returns locked devices before any other rule", () => {
    expect(tierOf({ locked: true, year: 2005 })).toBe("return");
    // A lock outranks damage too: the donor has to act before anything moves.
    expect(tierOf({ locked: true, damage: "dead board" })).toBe("return");
  });

  it("recycles devices older than 10 years, and only for that reason", () => {
    expect(tierOf({ year: 2015, cpu: "Intel Core i5-5300U" })).toBe("recycle");
    // One year inside the window is not recycled, whatever the specs.
    expect(tierOf({ year: 2016, cpu: "Intel Core i5-6300U" })).toBe("reuse-linux");
    // Age outranks damage: a dead 2014 machine is recycled, not billed as parts.
    expect(tierOf({ year: 2014, damage: "dead board" })).toBe("recycle");
  });

  it("explains recycling as age, not as a judgement about parts", () => {
    const scored = score({ year: 2015 });
    expect(scored.reason).toContain("Older than 10 years");
  });

  it("infers TPM 2.0 from a modern CPU when not reported", () => {
    expect(tierOf({ tpm: null })).toBe("reuse-modern");
  });

  it("uses open-source reuse when a modern requirement is missing", () => {
    expect(tierOf({ tpm: false })).toBe("reuse-linux");
    expect(tierOf({ storage: "hdd" })).toBe("reuse-linux");
    expect(tierOf({ ramGb: 4 })).toBe("reuse-linux");
    expect(tierOf({ year: 2018 })).toBe("reuse-linux");
    expect(tierOf({ cpu: "Intel Core i5-6300U", tpm: null })).toBe("reuse-linux");
  });

  it("explains which modern requirements were missed", () => {
    const scored = score({ storage: "hdd", ramGb: 4 });
    expect(scored.reason).toContain("under 8 GB RAM");
    expect(scored.reason).toContain("hard drive (HDD)");
  });

  it("accepts Apple silicon Macs for reuse", () => {
    expect(tierOf({ make: "Apple", cpu: "Apple M1", tpm: null, year: 2020 })).toBe("reuse-modern");
  });

  it("sends devices below every reuse rule to parts", () => {
    expect(tierOf({ ramGb: 2, storage: "hdd", cpu: "Intel Core i5-6200U", year: 2016 })).toBe(
      "parts",
    );
  });
});

describe("scoreDevice no-damage normalization (red-team M1)", () => {
  it.each([
    "no damage",
    "No damage",
    "NO DAMAGE.",
    "  no   damage  ",
    "none reported",
    "None reported.",
    "no reported damage",
    "n.a.",
    "N.A.",
    "nothing",
    "none",
    "NONE.",
    "n/a",
    "-",
  ])("treats %j as an undamaged, reusable laptop", (damage) => {
    expect(tierOf({ damage })).toBe("reuse-modern");
  });

  it("normalizes typographic apostrophes so notes compare consistently", () => {
    expect(normalizeDamage("Won\u2019t power on.")).toBe("won't power on");
    expect(normalizeDamage("  NO   DAMAGE  ")).toBe("no damage");
  });
});

/**
 * The invariant that replaced the damage keyword matcher.
 *
 * An earlier version carried a list of "fatal damage" phrases and tried to
 * decide "no reusable parts" from the donor's own words. Independent audits
 * found it wrong in both directions: it shredded healthy machines over a
 * keyboard spill ("water damage to keyboard only", "no power button") and
 * billed dead ones as parts ("dead board", "does not turn on"). Inferring
 * salvageability from free text is not solvable, so the rule is gone: the
 * `damage` column is a routing flag, and only age can recycle.
 *
 * Every damaged string below lands in `parts` — never `recycle`, never a reuse
 * tier — no matter how fatal it sounds. The clean strings keep reusing.
 */
describe("scoreDevice damage is a routing flag, never a recycle trigger", () => {
  const CLEAN = ["no damage", "None.", "n/a"];

  const DAMAGED = [
    // False positives from the old matcher: healthy machines it shredded.
    "water damage to keyboard only",
    "not a water damage case",
    "liquid damage repaired, works",
    "no power, fixed, works now",
    "no power button",
    "liquid damage to keyboard",
    // False negatives from the old matcher: dead machines it billed as parts.
    "motherboard dead",
    "water damaged",
    "does not turn on",
    "will not turn on",
    "won't boot",
    "fails to power on",
    "dead board",
    "no signs of life",
    "screen cracked no power",
    "keyboard broken won't turn on",
    "screen ok no power",
    "keyboard replaced does not power on",
    "logic board replaced, still dead",
    // Historically fatal phrasing plus the ambiguous notes that broke the list.
    "liquid damage",
    "crashed, no signs of life",
    "motherboard OK, screen cracked",
    "no power adapter included, otherwise fine",
  ];

  it.each(CLEAN)("keeps %j on the reuse path", (damage) => {
    expect(tierOf({ damage })).toBe("reuse-modern");
  });

  it.each(DAMAGED)("routes %j to parts", (damage) => {
    const scored = score({ damage });
    expect(scored.tier).toBe("parts");
    // State it once more as a prohibition, so a future regex cannot quietly
    // bring the recycle path back.
    expect(scored.tier).not.toBe("recycle");
    expect(scored.tier).not.toMatch(/^reuse/);
  });

  it("cannot be talked into recycling by any note, even a maximally fatal one", () => {
    const notes = [
      ...DAMAGED,
      "catastrophic water damage, board melted, nothing salvageable",
      "no power at all, will not boot, dead motherboard, liquid damage",
      "0",
    ];
    for (const damage of notes) {
      expect(score({ damage }).tier).not.toBe("recycle");
    }
  });

  it("reports the note back without claiming the app judged the parts", () => {
    const scored = score({ damage: "No power" });
    expect(scored.reason).toContain('"No power"');
    expect(scored.reason).toContain("bench decides what is salvageable");
    expect(scored.reason).not.toContain("no reusable parts");
  });
});

describe("scoreDevice unknown CPU honesty (red-team m1)", () => {
  it("does not claim an unrecognized CPU is older, and still reuses the laptop", () => {
    const scored = score({
      cpu: "Qualcomm Snapdragon 8cx Gen 3",
      tpm: true,
      year: 2022,
      ramGb: 16,
    });
    expect(scored.tier).toBe("reuse-linux");
    expect(scored.reason).toContain("CPU not recognized");
    expect(scored.reason).not.toContain("older CPU");
  });

  it("says TPM could not be verified when the CPU is unknown and tpm is blank", () => {
    const scored = score({ cpu: "Intel Xeon E5-2670", tpm: null, year: 2022, ramGb: 16 });
    expect(scored.tier).toBe("reuse-linux");
    expect(scored.reason).toContain("TPM and generation could not be verified");
  });

  it("still calls a known old CPU older", () => {
    const scored = score({ cpu: "Intel Core i5-6300U" });
    expect(scored.tier).toBe("reuse-linux");
    expect(scored.reason).toContain("older CPU");
  });

  it("tiers an Apple silicon laptop from its model string", () => {
    expect(
      tierOf({ make: "Apple", cpu: "MacBook Pro (M2)", tpm: null, year: 2022, ramGb: 16 }),
    ).toBe("reuse-modern");
  });

  it.each([
    ["MacBook Pro (M2)", 2022],
    ["MacBook Air (M1, 2020)", 2020],
  ])("tiers %j as a modern Apple laptop", (cpu, year) => {
    expect(tierOf({ make: "Apple", cpu, tpm: null, year, ramGb: 16 })).toBe("reuse-modern");
  });

  it("tiers a trademarked Ryzen name as modern", () => {
    expect(tierOf({ cpu: "AMD Ryzen™ 5 4500U", year: 2021 })).toBe("reuse-modern");
  });
});
