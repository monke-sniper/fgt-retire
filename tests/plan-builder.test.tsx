import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import PlanBuilder from "@/components/PlanBuilder";
import { MAX_BYTES } from "@/lib/csv";

const HEADER = "serial,make,model,cpu,ram_gb,storage,year,damage,tpm,locked";

/** A device that lands in "Reuse" (all modern requirements met) unless it is locked. */
function modernRow(serial: string, locked = "no"): string {
  return `${serial},Lenovo,ThinkPad T490,Intel Core i5-8365U,16,ssd,2019,,yes,${locked}`;
}

/** A row the parser must reject: ram_gb is not a number. */
function badRow(serial: string): string {
  return `${serial},Lenovo,ThinkPad T490,Intel Core i5-8365U,sixteen,ssd,2019,,yes,no`;
}

function csv(...rows: string[]): string {
  return [HEADER, ...rows].join("\n");
}

/**
 * The shipped sample fleet, inline. The component fetches this file only when the
 * user clicks "Try a sample fleet"; uploads are parsed locally. Tier labels and the
 * $140 total below follow from the rules in src/lib/rules.ts, which age devices
 * against the current year — the fixture keeps dates inside the reuse window for
 * the app's own year. If the rules or the sample change, update both together.
 */
const SAMPLE_FLEET = [
  HEADER,
  "PF3K9A21,Lenovo,ThinkPad T490,Intel Core i5-8365U,16,ssd,2019,,yes,no",
  "PF3K9A22,Lenovo,ThinkPad T490,Intel Core i5-8365U,8,ssd,2019,,yes,no",
  "PF3K9A23,Lenovo,ThinkPad T490,Intel Core i5-8365U,8,ssd,2019,,yes,no",
  "PF3K9A24,Lenovo,ThinkPad T490,Intel Core i5-8365U,8,ssd,2019,cracked screen,yes,no",
  "5CD0123ABC,HP,EliteBook 840 G7,Intel Core i5-10310U,16,nvme,2020,,,no",
  "5CD0123ABD,HP,EliteBook 840 G7,Intel Core i5-10310U,16,nvme,2020,,,no",
  "5CD0123ABE,HP,EliteBook 840 G7,Intel Core i5-10310U,16,nvme,2020,,,yes",
  "R90XY12,Lenovo,ThinkPad E14 Gen 2,AMD Ryzen 5 4500U,8,ssd,2021,,yes,no",
  "R90XY13,Lenovo,ThinkPad E14 Gen 2,AMD Ryzen 5 4500U,8,ssd,2021,no power,yes,no",
  "C02ZK1ABMD6T,Apple,MacBook Air,Apple M1,8,ssd,2020,,,no",
  "C02ZK1ABMD6V,Apple,MacBook Pro 13,Intel Core i5-8259U,8,ssd,2018,,no,no",
  "8H2XQ13,Dell,Latitude 5490,Intel Core i7-8650U,8,ssd,2018,,yes,no",
  "8H2XQ14,Dell,Latitude 5480,Intel Core i5-6300U,8,ssd,2017,,yes,no",
  "8H2XQ15,Dell,Latitude 5480,Intel Core i5-6300U,4,hdd,2017,,no,no",
  "2UA1234XYZ,HP,ProBook 640 G2,Intel Core i5-6200U,2,hdd,2016,,no,no",
  "8H2XQ16,Dell,Latitude E7450,Intel Core i5-5300U,8,ssd,2015,,no,no",
].join("\n");

function fileOf(text: string, name = "fleet.csv"): File {
  return new File([text], name, { type: "text/csv" });
}

async function upload(user: ReturnType<typeof userEvent.setup>, text: string, name?: string) {
  const input = screen.getByLabelText("Upload CSV");
  await user.upload(input, fileOf(text, name));
  return input;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PlanBuilder — a partial file is never presented as a quote", () => {
  it("renders only the error card when the file has no readable rows at all", async () => {
    const user = userEvent.setup();
    const { container } = render(<PlanBuilder />);
    // Missing required columns is a whole-file error (row 0), so the file itself is refused.
    await upload(user, "serial,make\nA1,Dell");

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByRole("heading")).toHaveTextContent("This file cannot be planned");
    expect(alert).toHaveTextContent("No rows could be read, so there is no plan and no total.");
    expect(alert).toHaveTextContent("The plan is withheld until these rows are fixed");

    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("region", { name: "Devices per outcome" })).toBeNull();
    expect(container.textContent).not.toContain("$");
  });

  it("still withholds the plan when every data row is rejected", async () => {
    const user = userEvent.setup();
    const { container } = render(<PlanBuilder />);
    await upload(user, csv(badRow("A1")));

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByRole("heading")).toHaveTextContent("1 row needs attention");
    // Zero readable rows is stated as a count, never as a plan over nothing.
    expect(alert).toHaveTextContent("0 of 1 rows were readable.");
    expect(alert).toHaveTextContent("The plan is withheld until these rows are fixed");

    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("region", { name: "Devices per outcome" })).toBeNull();
    expect(container.textContent).not.toContain("$");
  });

  it("withholds the plan for a partly readable file and quotes no total", async () => {
    const user = userEvent.setup();
    const { container } = render(<PlanBuilder />);
    await upload(user, csv(modernRow("A1"), badRow("A2"), modernRow("A3")));

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByRole("heading")).toHaveTextContent("1 row needs attention");
    // 2 of 3 rows parsed, and the readable two are named explicitly rather than planned.
    expect(alert).toHaveTextContent("2 of 3 rows were readable.");
    expect(alert).toHaveTextContent("The plan is withheld until these rows are fixed");
    expect(alert).toHaveTextContent("Row 3:");

    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("region", { name: "Devices per outcome" })).toBeNull();
    expect(screen.queryByText(/certified devices/)).toBeNull();
    expect(container.textContent).not.toContain("$");
  });
});

describe("PlanBuilder — unreported lock state", () => {
  it("plans a blank locked cell and warns with the plan's own unknown-lock count", async () => {
    const user = userEvent.setup();
    const { container } = render(<PlanBuilder />);
    // Two devices, both with a blank locked cell: two devices unknown, but only one
    // file-scoped warning. The heading must report 2, so it cannot come from warnings.length.
    await upload(user, csv(modernRow("A1", ""), modernRow("A2", "")));

    expect(await screen.findByRole("table")).toBeInTheDocument();

    // The amber notice is the only role=status carrying a heading (the plan-ready
    // announcement is a bare paragraph).
    const lockNotice = screen.getAllByRole("status").find((node) => node.querySelector("h2"));
    expect(lockNotice).toBeDefined();
    expect(within(lockNotice as HTMLElement).getByRole("heading")).toHaveTextContent(
      "2 devices have no reported lock state",
    );
    expect(within(lockNotice as HTMLElement).getAllByRole("listitem")).toHaveLength(1);
    expect(lockNotice).toHaveTextContent(/cannot be wiped or reused/);

    // The blank cell is a warning, not a fatal row error: no red card anywhere.
    expect(screen.queryByRole("alert")).toBeNull();
    expect(container.textContent).not.toMatch(/rows need attention|row needs attention/);
    // The plan still covers both devices.
    expect(container.textContent).toContain("2 of 2 laptops go back into use");
  });

  it("does not warn when every device reports its lock state", async () => {
    const user = userEvent.setup();
    render(<PlanBuilder />);
    await upload(user, csv(modernRow("A1"), modernRow("A2")));

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.queryByText(/no reported lock state/)).toBeNull();
  });
});

describe("PlanBuilder — upload size guard", () => {
  it("refuses a file over MAX_BYTES without reading or quoting it", async () => {
    const user = userEvent.setup();
    const { container } = render(<PlanBuilder />);

    const oversized = new File([new Uint8Array(MAX_BYTES + 1)], "whole-inventory.csv", {
      type: "text/csv",
    });
    await user.upload(screen.getByLabelText("Upload CSV"), oversized);

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByRole("heading")).toHaveTextContent("File not accepted");
    expect(alert).toHaveTextContent(/whole-inventory\.csv:/);
    expect(alert).toHaveTextContent(/planner reads files up to 5 MB/);
    expect(alert).toHaveTextContent("Nothing was read.");

    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("region", { name: "Devices per outcome" })).toBeNull();
    expect(container.textContent).not.toContain("$");
  });

  it("still accepts a file at exactly MAX_BYTES", async () => {
    const user = userEvent.setup();
    const { container } = render(<PlanBuilder />);
    // Padded with blank lines so the size is at the limit but the content is valid.
    const base = csv(modernRow("A1"));
    const padded = `${base}\n${"\n".repeat(MAX_BYTES - base.length - 1)}`;
    const atLimit = new File([padded], "at-limit.csv", { type: "text/csv" });
    expect(atLimit.size).toBe(MAX_BYTES);

    await user.upload(screen.getByLabelText("Upload CSV"), atLimit);

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(container.textContent).toContain("1 of 1 laptops go back into use");
  });
});

describe("PlanBuilder — clean plan", () => {
  it("renders one labelled row per device and prices the sample fleet at $140", async () => {
    const user = userEvent.setup();
    const { container } = render(<PlanBuilder />);
    await upload(user, SAMPLE_FLEET, "fleet-sample.csv");

    const table = await screen.findByRole("table");
    // 16 devices + header row: one row per serial number in the file.
    expect(within(table).getAllByRole("row")).toHaveLength(17);

    const pills = within(table)
      .getAllByText(/^(Reuse|Reuse \(open source\)|Parts|Recycle|Return to donor)$/)
      .map((node) => node.textContent);
    expect(pills).toHaveLength(16);
    expect(
      pills.reduce<Record<string, number>>((tally, label) => {
        tally[label as string] = (tally[label as string] ?? 0) + 1;
        return tally;
      }, {}),
    ).toEqual({
      Reuse: 7,
      "Reuse (open source)": 4,
      // Three parts machines: the cracked screen, the 2016 ProBook below every
      // reuse rule, and the 2021 ThinkPad with "no power" (damage is a routing
      // flag, so it is harvested rather than recycled). The one recycle pill is
      // the 2015 Latitude, which is recycled for its age alone.
      Parts: 3,
      Recycle: 1,
      "Return to donor": 1,
    });

    expect(container.textContent).toContain("14 of 16 laptops go back into use");
    expect(container.textContent).toMatch(/\$140\.00 for 14 certified devices/);
  });

  it("charges nothing for a non-profit, school or charity", async () => {
    const user = userEvent.setup();
    const { container } = render(<PlanBuilder />);
    await upload(user, SAMPLE_FLEET);

    expect(await screen.findByText(/14 of 16 laptops go back into use/)).toBeInTheDocument();
    expect(container.textContent).toMatch(/\$140\.00/);

    await user.click(screen.getByRole("radio", { name: "Non-profit, school or charity" }));

    expect(container.textContent).toContain("14 of 16 laptops go back into use");
    expect(screen.queryByText(/certified devices/)).toBeNull();
    expect(container.textContent).not.toContain("$");
  });

  it("renders no certificate charge when the itemized certificate is declined", async () => {
    const user = userEvent.setup();
    const { container } = render(<PlanBuilder />);
    await upload(user, SAMPLE_FLEET);

    expect(await screen.findByText(/14 of 16 laptops go back into use/)).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Itemized certificate" }));

    expect(container.textContent).not.toContain("$");
    expect(screen.queryByText(/certified devices/)).toBeNull();
  });
});

describe("PlanBuilder — accessibility", () => {
  it("names the plan table and labels the file input", async () => {
    const user = userEvent.setup();
    render(<PlanBuilder />);

    const input = screen.getByLabelText("Upload CSV");
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("accept", ".csv,text/csv");

    await user.upload(input, fileOf(csv(modernRow("A1"))));
    const table = await screen.findByRole("table", { name: /Per-device donation plan/ });
    expect(within(table).getByRole("columnheader", { name: "Serial" })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: "Plan" })).toBeInTheDocument();
  });
});

describe("PlanBuilder — row rendering cap", () => {
  it("renders the first 100 rows but counts and prices every device", async () => {
    const user = userEvent.setup();
    render(<PlanBuilder />);
    const devices = Array.from({ length: 150 }, (_, index) =>
      modernRow(`S${String(index + 1).padStart(3, "0")}`),
    );

    await upload(user, csv(...devices), "big-fleet.csv");

    expect(await screen.findByText(/Showing the first 100 of 150 devices\./)).toBeInTheDocument();
    const table = screen.getByRole("table");
    // Header + the capped 100 body rows.
    expect(within(table).getAllByRole("row")).toHaveLength(101);

    // The summary still covers all 150 devices in the file.
    expect(screen.getByText(/Showing the first 100 of 150 devices\./)).toHaveTextContent(
      "The counts and the total above cover every row in the file.",
    );
    expect(screen.getByText(/150 of 150 laptops go back into use/)).toBeInTheDocument();
    expect(screen.getByText(/\$1,500\.00 for 150 certified devices/)).toBeInTheDocument();
  });
});

describe("PlanBuilder — nothing leaves the browser", () => {
  it("never posts the uploaded file anywhere", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<PlanBuilder />);

    await upload(user, csv(modernRow("A1"), modernRow("A2"), modernRow("A3")));
    expect(await screen.findByRole("table")).toBeInTheDocument();

    // A local upload does no network I/O at all.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("only GETs the sample fleet when asked, and never sends the CSV payload", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => SAMPLE_FLEET,
    } as unknown as Response);
    const user = userEvent.setup();
    render(<PlanBuilder />);

    // A real upload first, so any leaky upload path would already have fired.
    await upload(user, csv(modernRow("A1")));
    expect(await screen.findByRole("table")).toBeInTheDocument();

    fetchSpy.mockClear();

    await user.click(screen.getByRole("button", { name: "Try a sample fleet" }));
    expect(await screen.findByText("Loaded: Sample fleet")).toBeInTheDocument();
    expect(await screen.findByText(/14 of 16 laptops go back into use/)).toBeInTheDocument();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(String(fetchSpy.mock.calls[0][0])).toBe("/samples/fleet-sample.csv");

    const writes = fetchSpy.mock.calls.filter(([, init]) => {
      const method = (init?.method ?? "GET").toUpperCase();
      return method !== "GET" && method !== "HEAD";
    });
    expect(writes).toEqual([]);

    const bodies = fetchSpy.mock.calls
      .map(([, init]) => (typeof init?.body === "string" ? init.body : ""))
      .join("\n");
    expect(bodies).not.toContain("serial");
    expect(bodies).toBe("");
  });
});

describe("PlanBuilder — PDF summary", () => {
  it("downloads a dated PDF named after the organization", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn((blob: Blob) => {
      expect(blob.type).toBe("application/pdf");
      return "blob:summary";
    });
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    render(<PlanBuilder />);
    await user.type(screen.getByLabelText("Organization name"), "Acme Logistics");
    await upload(user, SAMPLE_FLEET, "fleet-sample.csv");
    await user.click(await screen.findByRole("button", { name: "Download PDF summary" }));

    await vi.waitFor(() => expect(click).toHaveBeenCalledTimes(1));
    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toMatch(/^donation-plan-acme-logistics-\d{4}-\d{2}-\d{2}\.pdf$/);
    expect(link.href).toBe("blob:summary");
    await vi.waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith("blob:summary"));
  });

  it("shows an error instead of failing silently when the PDF cannot be made", async () => {
    const user = userEvent.setup();
    Object.assign(URL, {
      createObjectURL: vi.fn(() => {
        throw new Error("blocked");
      }),
      revokeObjectURL: vi.fn(),
    });

    render(<PlanBuilder />);
    await upload(user, SAMPLE_FLEET);
    await user.click(await screen.findByRole("button", { name: "Download PDF summary" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("The PDF could not be created");
    expect(screen.getByRole("button", { name: "Download PDF summary" })).toBeEnabled();
  });

  it("offers no download while the plan is withheld", async () => {
    const user = userEvent.setup();
    render(<PlanBuilder />);
    await upload(user, csv(modernRow("A1"), badRow("A2")));
    await screen.findByRole("alert");
    expect(screen.queryByRole("button", { name: "Download PDF summary" })).toBeNull();
  });
});
