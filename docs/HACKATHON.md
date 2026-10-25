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
businesses, only for devices that are reused, and never to non-profits.

## The five guiding questions

| Case question                                    | Our answer                                                                                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. More revenue without compromising the mission | Uniform business batches feed refurbished sales, FGT's largest revenue line. The certificate fee applies only to reused devices from businesses.              |
| 2. Who it is for, and the unmet need             | IT and office managers at small and medium businesses retiring 10 to 200 laptops. They do not know what happens to each device or whether their data is safe. |
| 3. Why technology, not a non-digital fix         | One full-time staff member cannot triage every company's spreadsheet by phone. The tool answers instantly, at any hour, at no staff cost.                     |
| 4. Affordable, mission-aligned, small-team       | Free to donate. Older machines get open-source software. Runs in the browser: no server, no database, about $0 to host.                                       |
| 5. Timeline, upfront cost, metrics               | See the timeline and metrics below.                                                                                                                           |

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

The case gives FGT's revenue but not its resale prices. Every input below is our assumption and must
be labelled as one on the slide. Fill in the blanks and cite where each came from (for example, FGT's
online store prices).

| Input                                   | Value | Source     |
| --------------------------------------- | ----- | ---------- |
| Business partners per year              |       | Assumption |
| Laptops per partner per year            |       | Assumption |
| Share reused (from sample-fleet plans)  |       | Assumption |
| Average resale price of a reused laptop |       | Assumption |
| Share of businesses taking certificates |       | Assumption |

Revenue = partners × laptops × reused share × resale price + certificate fees. Compare with FGT's
roughly $240,000 a year (case, 2023-2025 average).

**Upfront cost:** hosting on a free tier ($0), optional domain (about $20 a year), plus staff time
to review incoming plans.

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
