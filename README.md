# FGT Retire

A donation planner for organizations retiring 10 to 200 laptops to Free Geek Toronto.

Upload a laptop inventory as a CSV. The app sorts every serial number into one of five outcomes,
gives a reason for each one, and prices the optional itemized certificate. Everything runs in the
browser.

## Status

Working today:

- CSV upload with row-level validation. Every rejected row comes back with its spreadsheet row
  number.
- Ordered scoring rules. One tier and one reason per serial number.
- Fleet totals and the optional certificate pricing math.
- A downloadable PDF summary of the plan: totals, an impact estimate, certificate price, lock
  warnings, next steps and every device. It is generated in the browser with jsPDF, which loads
  only when the button is clicked. It is a donation plan, not a certificate.
- Client-side only. The file is read in the browser and never uploaded. No backend, no database, no
  accounts, no persistence.

Not built:

- Drop-off booking. There is no slot picker and no monthly intake cap.
- Per-serial tracker (received, wiped, tested, reused).
- Wipe log import.
- Certificate PDFs. The certificate is priced in the app. No document exists.
- Staff view of incoming batches, and any hosted deployment.

If any row fails validation the plan is withheld entirely. A partial file produces an error list and
a readable-row count, never a total. A dollar figure next to a batch you cannot fully read is a
quote you have not earned.

## Why this exists

Free Geek Toronto refurbishes donated laptops and sells them at low prices. A uniform batch of
business laptops is the fastest thing to process at a bench: same model, same parts, one wipe
procedure.

Two facts shape the problem. Sales were roughly 77% of revenue in 2025, up from about 10% in 2010,
so the organization's income now rests on a supply of used hardware that owners increasingly sell or
trade in instead. And Free Geek Toronto has no corporate partners or sponsors, so it has no channel
into the one donor group that hands over uniform batches: businesses retiring a fleet. Its intake
policy already points the same way, limiting irregular household donations while asking for bulk
organisational ones.

The premise here is that two things stop a small organization from handing over a batch. Nobody can
say in advance what will happen to each serial, and the record that its drive was wiped is either
expensive or vague. This app does the first part and prices the second. It does not deliver the
second part yet.

## Scoring rules

Rules run in this order. The first match wins. Thresholds live in
[`src/lib/rules.ts`](src/lib/rules.ts).

| Order | Tier                | Rule                                                                                                                                                                |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Return to donor     | Reported as still locked to device management or Activation Lock                                                                                                    |
| 2     | Recycle             | More than 10 years old, counted from the current year. Age is the only route to recycling.                                                                          |
| 3     | Parts               | Any reported damage. The `damage` column is a routing flag, not a salvage judgement: free text cannot tell us which parts survive, so the device goes to the bench. |
| 4     | Reuse               | 2019 or newer, Intel 8th gen / AMD Ryzen 2000 / Apple silicon or newer, TPM 2.0, 8 GB RAM or more, SSD or NVMe (not eMMC)                                           |
| 5     | Reuse (open source) | 2016 or newer and 4 GB RAM or more                                                                                                                                  |
| 6     | Parts               | Everything else                                                                                                                                                     |

Nothing in the `damage` column can send a device to recycling. An earlier version tried to read "no
reusable parts" out of the note with a phrase list, and it was wrong in both directions: "no power
button" and "liquid damage to keyboard only" were shredded, while "dead board" and "does not turn
on" were billed as parts. Damage is now reported back in the reason, and the bench decides what is
salvageable.

Two defaults are worth knowing:

- If `tpm` is blank, TPM 2.0 is inferred from the CPU when the CPU counts as modern.
- If `locked` is blank, or the column is missing, the device is planned as unlocked and the page
  shows an amber notice, not an error. The plan reports how many devices are in that state
  (`unknownLockCount`). Confirm the lock is released before drop-off: a laptop still enrolled in
  Intune, Autopilot or Activation Lock cannot be reused.

## CSV format

| Column    | Required | Accepted values                                                                                       |
| --------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `serial`  | Yes      | Any string, unique in the file (case-insensitive)                                                     |
| `make`    | Yes      | Free text                                                                                             |
| `model`   | Yes      | Free text                                                                                             |
| `cpu`     | Yes      | Free text. Unrecognized CPUs are treated as not modern                                                |
| `ram_gb`  | Yes      | A number above 0                                                                                      |
| `storage` | Yes      | `ssd`, `nvme`, `emmc` or `hdd`                                                                        |
| `year`    | Yes      | Whole number, 1990 to next year                                                                       |
| `damage`  | No       | Free text. Any reported damage routes the device to parts; the app does not guess what is salvageable |
| `tpm`     | No       | `yes`, `no`, `y`, `n`, `true`, `false`, `1`, `0`, `2.0` (yes), `1.2` (no), or blank                   |
| `locked`  | No       | `yes`, `no`, `y`, `n`, `true`, `false`, `1`, `0`, or blank for "not reported"                         |

Limits: 2,000 device rows (`MAX_DEVICES`) and 5 MB (`MAX_BYTES`), both defined in
[`src/lib/csv.ts`](src/lib/csv.ts). The two caps are enforced at different points. The size cap is
checked against `File.size` before the file is read at all, so an oversized export is refused
instead of freezing the tab. The row cap can only be counted after parsing, because blank lines and
newlines inside quoted cells mean the row count is not known until the text has been split. Header
problems, the size cap and the row cap all come back as file-level errors with no row number.

A sample fleet is in [`public/samples/fleet-sample.csv`](public/samples/fleet-sample.csv). Under the
default rules and a 2026 intake it plans 7 reuse, 4 reuse with open-source software, 3 parts, 1
recycle and 1 return to donor — $140 of certificate for a business that asks for one.

## Data destruction: what is claimed and what is not

This app does not wipe drives and does not record wipe results. The methods below are what a
sanitization record would have to name.

| Media                                                        | NIST SP 800-88 method | What that means in practice                                                                                                                                              |
| ------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Magnetic hard drive                                          | Clear                 | One overwrite pass. The drive stays reusable.                                                                                                                            |
| SSD, NVMe, eMMC                                              | Purge                 | A crypto-erase or the drive's own sanitize command. Overwriting does not reach spare cells that the controller remaps, so multi-pass overwrite is not a safe substitute. |
| Any drive that is not trusted, or where Purge is unavailable | Destroy               | Physical destruction by the downstream recycler.                                                                                                                         |

Free Geek Toronto's published method for hard disks is a three to five pass overwrite
([freegeektoronto.org/tech-reuse](https://www.freegeektoronto.org/tech-reuse)). NIST SP 800-88 Rev.
2 §3.1.1 warns that multi-pass overwrite on flash "should be avoided as very little confidentiality
protection is achieved", so the same procedure is not the right one for the SSDs that the reuse
tier prefers.

Three limits on the claim:

1. There is no NIST certification. SP 800-88 is guidance for running a sanitization program. NIST
   does not certify vendors, tools or wipe reports, so "NIST certified" is not a thing this project
   can claim.
2. A per-serial record built from a wipe log is evidence that a tool reported sanitizing a serial. It
   is not a certification, and on its own it does not satisfy §4.6, which asks for manufacturer,
   model, serial, media type, sanitization method, technique, tool and version, verification method,
   and a named operator with title, date and signature.
3. A record per serial shows the drives that were wiped were wiped. It does not show that every
   laptop in the batch arrived. Chain of custody is the part that is missing, and it is the next
   thing to build.

## Pricing

| Item                               | Price                                                |
| ---------------------------------- | ---------------------------------------------------- |
| Donating                           | Free                                                 |
| Itemized certificate (optional)    | $10 per device that is reused or harvested for parts |
| Recycled devices                   | Never charged                                        |
| Non-profits, schools and charities | Certificates free                                    |

What the certificate would attest: the serial, the sanitization method and technique, the tool and
its version, the verification method, and the person who signed it. What it would not attest: that
every device in the batch arrived, that the method suited the media, or that the organization is
compliant with any regulation. It would not be a legal guarantee either. Under PIPEDA (Schedule 1,
clause 4.1.3) the donating organization stays responsible for the data it hands to a third party, so
the contract matters more than the document.

## Business case

[`docs/business-case.md`](docs/business-case.md) models the economics. One batch of 30 laptops a
month is the base case: about $57,000 a year in net resale revenue after direct costs, on about $20
of upfront cost. The certificate fee is worth about $1,300 of that, so it is a reason for a business
to pick Free Geek Toronto rather than an income line. The real constraint is volunteer bench time,
not demand: the base case needs roughly 7 hours of bench work a week.

Every input in that model is labelled **Sourced** or **Assumption**. The resale prices come from a
dated snapshot of the online store; the volumes and labour times are estimates that still need
checking against the workshop.

## Impact estimate

The PDF summary turns the plan into figures a donor can share internally. They are computed in
[`src/lib/impact.ts`](src/lib/impact.ts) from the tier counts and nothing else.

| Figure                         | Counts                                                     |
| ------------------------------ | ---------------------------------------------------------- |
| Laptops back in use            | Reuse plus reuse (open source)                             |
| Rebuilt with open source       | Reuse (open source)                                        |
| Sent to the bench for parts    | Parts                                                      |
| Electronics reused or recycled | Everything except return to donor, times 1.5 kg per laptop |

The 1.5 kg weight is an assumption, not a weighed figure: a 14-inch business laptop without its
charger weighs about 1.3 to 1.6 kg, so it errs low. The PDF prints it beside the figure, along with
the note that the plan is a prediction from a spreadsheet. Locked devices count for nothing until
the lock is removed. There is no carbon figure: avoided emissions depend on what a buyer would have
bought otherwise, which this app cannot know.

## Known limits

- The rules read a spreadsheet row. They do not inspect the hardware, so a reported tier is a
  prediction, not a bench result.
- The damage column is a routing flag, not a salvage judgement. Anything other than "no damage"
  sends the device to parts, and the app does not try to work out which parts survive — the reason
  column shows your own note back to you and leaves that call to the bench. The cost of this is that
  a machine that is only missing a charger is planned as parts; the benefit is that no laptop is
  shredded and no dead machine is quoted as reusable on the strength of a phrase.
- Recycling is decided by age alone (more than 10 years). A 12-year-old machine that still boots is
  recycled; that is the intake policy, not a hardware finding.
- The certificate price is a product decision, not a surveyed market rate.
- The impact estimate inherits the plan's predictions, and its weight figure is an assumption.
- Nothing survives a refresh, and nothing is stored anywhere.

## Getting started

Requires Node.js 20 or later (22 is pinned in `.nvmrc` and used by CI). Workflow, branch naming and
the honesty rules are in [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
npm install
npm run dev         # http://localhost:3000
npm test            # lib tests (node) + component tests (jsdom)
npm run build       # production build
```

Quality gates, all of which run in CI on every push to `main` and every pull request
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)):

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (flat config, next/core-web-vitals + next/typescript)
npm run format:check
npm run verify      # typecheck && lint && test && build
```

## Project structure

```text
src/app/            layout, landing page, /plan, not-found, error, icon
src/components/     PlanBuilder (client component)
src/lib/            rules, scoring, CPU parsing, CSV parsing, plan builder, impact, PDF summary
public/samples/     sample fleet CSV
tests/              lib tests (*.test.ts, node) and component tests (*.test.tsx, jsdom)
```

## Tech stack

Next.js, React, TypeScript, Tailwind CSS, Papa Parse, jsPDF, Vitest.

## Roadmap

- [x] CSV upload with row-level validation and a spreadsheet row number per error
- [x] Ordered scoring rules and the per-serial plan
- [x] File size cap checked before the file is read, plus a 2,000-row cap enforced after parsing
- [x] Certificate pricing math
- [x] PDF summary of the donation plan
- [x] Impact estimate in the PDF summary, with its assumptions printed
- [ ] Drop-off booking with a monthly cap
- [ ] Per-serial tracker (received, wiped, tested, reused)
- [ ] Wipe log import and certificate PDF
- [ ] Staff view of incoming batches
- [ ] Hosted deployment

## Disclaimer

A concept for Free Geek Toronto. Not affiliated with or endorsed by Free Geek Toronto. Free Geek
Toronto operates its own intake, wipe and resale process, and this app has no access to it.

## License

[MIT](LICENSE)
