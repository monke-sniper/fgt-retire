# Hackathon plan

FUSEHACKS 2026, Blueprint 2026 by FUSE Society, Free Geek Toronto (FGT) case.

**Deadline: Friday, October 30, 2026, 11:59 PM Eastern.** Submit well before then.

## The case in one paragraph

FGT is a Toronto non-profit with 1 full-time and 5 part-time staff and 30 to 40 volunteers. It
refurbishes donated computers and sells them cheaply; sales are about 77% of its roughly $240,000 a
year. Donations are falling because people sell or trade in good devices, and what does arrive is a
mixed pile that is slow to refurbish. FGT says it wants organizations to donate large batches of
matching laptops, and it has no corporate partners. The case asks how technology can grow revenue
without drifting from the mission (reuse, digital inclusion, skills) or exceeding a tiny team and
budget.

## Our answer

> A tool that turns a company's laptop spreadsheet into a donation plan in under a minute, so FGT
> can win the bulk, matching-model donations it says it needs most.

A business uploads its laptop list. Each serial gets an outcome (reuse, reuse with open-source
software, parts, recycle, return to donor) and a reason, plus a PDF summary to take to their manager
and to drop-off. Donating is free; an optional $10 per-device certificate is charged only to
businesses, only for devices that are reused or harvested for parts (never recycled ones), and never
to non-profits.

## The five guiding questions

| Case question                                    | Our answer                                                                                                                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. More revenue without compromising the mission | Uniform business batches feed refurbished sales, FGT's largest revenue line. The certificate fee applies only to businesses, and only to reused or parts devices. |
| 2. Who it is for, and the unmet need             | IT and office managers at small and medium businesses retiring 10 to 200 laptops. They do not know what happens to each device or whether their data is safe.     |
| 3. Why technology, not a non-digital fix         | One full-time staff member cannot triage every company's spreadsheet by phone. The tool answers instantly, at any hour, at no staff cost.                         |
| 4. Affordable, mission-aligned, small-team       | Free to donate. Older machines get open-source software. Runs in the browser: no server, no database, about $0 to host.                                           |
| 5. Timeline, upfront cost, metrics               | See the timeline and metrics below.                                                                                                                               |

## Deliverables

1. **Devpost page**, published (not a draft): problem, solution, implementation outline with cost
   and timeline, all team member names, and a link to the live site and this repo.
2. **Recorded presentation**, 8 minutes or less, on YouTube as **Unlisted**. Each member appears or
   speaks where practical.
3. **Official submission form** with the Devpost and YouTube links.

## Video outline (8:00 max)

| Time      | Section                                                          |
| --------- | ---------------------------------------------------------------- |
| 0:00-1:00 | Problem: falling, mixed donations; FGT wants bulk business ones  |
| 1:00-2:00 | Target user and root cause: uncertainty about outcome and data   |
| 2:00-4:30 | Live demo: sample fleet, tiers and reasons, PDF download         |
| 4:30-5:45 | Money: revenue model with labelled assumptions, about $0 upfront |
| 5:45-7:15 | Timeline, risks, success metrics                                 |
| 7:15-8:00 | Close: reuse, open source, free for charities                    |

## Money model

The case gives FGT's total revenue but not its resale prices, unit volumes or costs. Every input
below is marked **Sourced** (with where it came from) or **Assumption** (our estimate, to be labelled
as one on the slide). All figures are CAD per year.

### Inputs

| Input                                          | Conservative | Base  | Stretch | Label                                                      |
| ---------------------------------------------- | ------------ | ----- | ------- | ---------------------------------------------------------- |
| Business partners per year                     | 6            | 12    | 24      | Assumption (see "Why these volumes")                       |
| Laptops per batch                              | 20           | 30    | 40      | Assumption (the tool is built for 10 to 200)               |
| Share planned as Reuse                         | 30%          | 44%   | 44%     | Base: our sample fleet (7 of 16). Assumption, not FGT data |
| Share planned as Reuse (open source)           | 25%          | 25%   | 25%     | Base: our sample fleet (4 of 16). Assumption               |
| Share planned as Parts                         | 25%          | 19%   | 19%     | Base: our sample fleet (3 of 16). Assumption               |
| Resale price, Reuse laptop                     | $380         | $380  | $380    | **Sourced**: FGT online store, see price evidence          |
| Resale price, Reuse (open source) laptop       | $200         | $200  | $200    | **Sourced**: FGT online store, see price evidence          |
| Parts value per Parts device                   | $0           | $20   | $20     | Assumption (RAM, SSD, charger, battery)                    |
| Share of reusable laptops sold within the year | 70%          | 80%   | 90%     | Assumption                                                 |
| Direct cost per laptop sold                    | $50          | $40   | $40     | Assumption (charger, battery, packaging, card fees)        |
| Share of donors that are businesses            | 80%          | 80%   | 80%     | Assumption (non-profits get certificates free)             |
| Businesses that buy the $10 certificate        | 25%          | 50%   | 50%     | Assumption. $10 is a product decision (`rules.ts`)         |
| Volunteer bench time per uniform laptop        | 1.5 h        | 1.5 h | 1.5 h   | Assumption. Ask FGT for a real figure                      |

Recycled and return-to-donor devices are counted as $0. Recycling income exists in FGT's "Sales"
category (case, p. 3) but we leave it out to stay conservative.

### Price evidence

Snapshot of FGT's laptop listings at
[shop.freegeektoronto.org/collections/laptops](https://shop.freegeektoronto.org/collections/laptops),
taken October 25, 2026. Prices change weekly with donations, so re-check before recording.

- **Reuse tier, $380:** median of the nine 2020 to 2022 business models listed (Dell Latitude 5310,
  5320, 5330, 5420, 5430 and HP EliteBook 840 G8), $269.99 to $449.99, median $379.99. These are the
  models a business retiring laptops today would hand over.
- **Reuse (open source) tier, $200:** median of the three 2016 to 2017 business models listed (Dell
  Latitude E5450 $139.99, Lenovo ThinkPad T470s $199.99, HP EliteBook x360 1030 G2 $239.99).
- Newer Latitudes sold with Linux were listed at $269.99, so open-source software does not by itself
  push a laptop to the bottom of the range.

### Results

Revenue = laptops sold × resale price + parts value − direct cost + certificate fees, where laptops
sold = (Reuse + Reuse open source) × share sold.

| Scenario     | Laptops in | Laptops sold | Resale revenue | Parts  | Direct cost | Certificates | **Net added** | vs. FGT sales today | Bench hours |
| ------------ | ---------- | ------------ | -------------- | ------ | ----------- | ------------ | ------------- | ------------------- | ----------- |
| Conservative | 120        | 46           | $13,776        | $0     | −$2,310     | $192         | **$11,658**   | +6%                 | ~100        |
| Base         | 360        | 198          | $62,280        | $1,350 | −$7,920     | $1,260       | **$56,970**   | +31%                | ~370        |
| Stretch      | 960        | 594          | $186,840       | $3,600 | −$23,760    | $3,360       | **$170,040**  | +92%                | ~990        |

"FGT sales today" is about $185,000: sales were about 77% of revenue in 2025 (case, Exhibit 1) and
revenue averaged about $240,000 from 2023 to 2025 (case, p. 3). The comparison is approximate because
the 77% share is for 2025 alone.

What the numbers say:

- **Resale is the revenue; the certificate is not.** Certificates add about $1,300 in the base case.
  Pitch the certificate as a reason for a business to choose FGT, not as an income line.
- **The base case is one batch a month.** 12 batches of 30 laptops adds roughly a third to FGT's
  sales without changing prices or who FGT sells to.
- **The limit is bench time, not demand.** The base case needs about 370 volunteer hours a year
  (about 7 a week). The stretch case needs about 990 (about 19 a week), which means recruiting two
  or three more regular volunteers. That ties this plan to FGT's volunteer-retention goal, and it is
  why Phase 2 has a monthly intake cap.
- **The low case still pays for itself.** Upfront cost is about $20 (see below), so the first batch
  covers it.

### Why these volumes

- **12 partners a year (base)** is one batch a month. FGT accepts drop-offs only on Fridays and
  Saturdays ([freegeektoronto.org/shop](https://www.freegeektoronto.org/shop)) and has one full-time
  staff member (case, p. 3), so we size the plan to what that schedule can absorb.
- **30 laptops a batch (base)** assumes a business with roughly 100 to 150 staff on a four-year
  replacement cycle, or a smaller business clearing a backlog of stored machines. The four-year cycle
  is an assumption; find a citation or ask two or three local IT managers before the pitch.
- **The market is large enough.** Canada has 1,099,521 employer businesses
  ([ISED, Key Small Business Statistics 2025](https://ised-isde.canada.ca/site/sme-research-statistics/en/key-small-business-statistics/key-small-business-statistics-2025)).
  The base case needs 12 of them in the Toronto area. The hard part is reaching them, which is why
  outreach rides on FGT's planned LinkedIn push (case, p. 7).

### Upfront and running cost

| Item                  | Cost                  | Label                                                                                                        |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------ |
| Hosting               | $0                    | Every route builds as a static page, so free static hosting works. Check the host's terms for non-profit use |
| Domain (optional)     | About $20 a year      | Assumption. A subpath of freegeektoronto.org costs nothing                                                   |
| Building the tool     | $0 to FGT             | Phase 1 is built (this repo)                                                                                 |
| Staff time per batch  | About 1.5 hours       | Assumption: 30 minutes to review the plan, 1 hour to book and receive the drop-off                           |
| Staff time, base case | About 18 hours a year | 12 batches × 1.5 hours                                                                                       |

## Success metrics

- Business donors per quarter
- Laptops per batch, and share of batches that are a single model
- Share of donated laptops reused (laptop or open-source tier)
- Days from first upload to drop-off
- Certificate revenue

## Implementation timeline (for the pitch)

| Phase           | What                                                  |
| --------------- | ----------------------------------------------------- |
| Phase 1 (built) | CSV planner, per-serial reasons, PDF summary          |
| Phase 2 (next)  | Drop-off booking with a monthly cap, FGT staff view   |
| Phase 3 (later) | Per-serial tracker, wipe log import, certificate PDFs |

## Risks to name

- The plan is a prediction from a spreadsheet; the bench confirms each device.
- Proof of data wiping is priced, not built.
- Businesses still have to find the tool, so it rides on FGT's planned LinkedIn outreach.
- We are not affiliated with FGT; real use needs FGT's intake and wipe process.

## Day by day

| Day        | Do                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Sat Oct 24 | Agree on the story. Merge the scoring fixes and PDF summary. (Done)    |
| Sun Oct 25 | Deploy to Vercel. Add two or three realistic sample fleets.            |
| Mon Oct 26 | Screen-record the demo. Fill in the money model.                       |
| Tue Oct 27 | Build the slides.                                                      |
| Wed Oct 28 | Write the script and record each member's part.                        |
| Thu Oct 29 | Edit to 8:00 or less, upload Unlisted, draft the Devpost page.         |
| Fri Oct 30 | Buffer. Publish Devpost, then submit the form well before 11:59 PM ET. |
