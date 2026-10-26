# Business case

Cost, volume and revenue model for a company retiring laptops to Free Geek Toronto, what the tool
changes about that transaction, and the numbers that would show whether it works.

Every input below is marked **Sourced** (with where it came from) or **Assumption** (an estimate that
still needs checking). All money is CAD, per year.

## What the tool changes

A business uploads its laptop list as a CSV. Each serial gets one outcome (reuse, reuse with
open-source software, parts, recycle, return to donor) and a reason, plus a PDF summary to take to a
manager and to drop-off.

Donating is free. An optional $10 per-device certificate is charged only to businesses, only for
devices that are reused or harvested for parts, and never to non-profits or for recycled devices.

## Context

Free Geek Toronto refurbishes donated computers and sells them cheaply. Sales were about 77% of
revenue in 2025, up from about 10% in 2010, on revenue that has averaged about $240,000 a year from
2023 to 2025. Donations are falling because owners sell or trade in working devices instead, and what
does arrive is a mixed pile that is slow to refurbish. The organization has said it wants
organizations to donate large batches of matching laptops, and it has no corporate partners or
sponsors. It runs on one full-time and five part-time staff, with 30 to 40 volunteers.

## Inputs

| Input                                          | Conservative | Base  | Stretch | Label                                                      |
| ---------------------------------------------- | ------------ | ----- | ------- | ---------------------------------------------------------- |
| Business partners per year                     | 6            | 12    | 24      | Assumption (see "Why these volumes")                       |
| Laptops per batch                              | 20           | 30    | 40      | Assumption (the tool is built for 10 to 200)               |
| Share planned as Reuse                         | 30%          | 44%   | 44%     | Base: the sample fleet (7 of 16). Assumption, not FGT data |
| Share planned as Reuse (open source)           | 25%          | 25%   | 25%     | Base: the sample fleet (4 of 16). Assumption               |
| Share planned as Parts                         | 25%          | 19%   | 19%     | Base: the sample fleet (3 of 16). Assumption               |
| Resale price, Reuse laptop                     | $380         | $380  | $380    | **Sourced**: Free Geek Toronto online store                |
| Resale price, Reuse (open source) laptop       | $200         | $200  | $200    | **Sourced**: Free Geek Toronto online store                |
| Parts value per Parts device                   | $0           | $20   | $20     | Assumption (RAM, SSD, charger, battery)                    |
| Share of reusable laptops sold within the year | 70%          | 80%   | 90%     | Assumption                                                 |
| Direct cost per laptop sold                    | $50          | $40   | $40     | Assumption (charger, battery, packaging, card fees)        |
| Share of donors that are businesses            | 80%          | 80%   | 80%     | Assumption (non-profits get certificates free)             |
| Businesses that buy the $10 certificate        | 25%          | 50%   | 50%     | Assumption. $10 is a product decision (`rules.ts`)         |
| Volunteer bench time per uniform laptop        | 1.5 h        | 1.5 h | 1.5 h   | Assumption. Needs a real figure from the workshop          |

Recycled and return-to-donor devices are counted as $0. Recycling income exists inside Free Geek
Toronto's sales category, but it is left out here to stay conservative.

### Price evidence

Snapshot of the laptop listings at
[shop.freegeektoronto.org/collections/laptops](https://shop.freegeektoronto.org/collections/laptops),
taken 25 October 2026. Prices move weekly with donations, so re-check before quoting.

- **Reuse tier, $380:** median of the nine 2020 to 2022 business models listed (Dell Latitude 5310,
  5320, 5330, 5420, 5430 and HP EliteBook 840 G8), a range of $269.99 to $449.99, median $379.99.
  These are the models a business retiring laptops today would hand over.
- **Reuse (open source) tier, $200:** median of the three 2016 to 2017 business models listed (Dell
  Latitude E5450 $139.99, Lenovo ThinkPad T470s $199.99, HP EliteBook x360 1030 G2 $239.99).
- Newer Latitudes sold with Linux were listed at $269.99, so open-source software does not by itself
  push a laptop to the bottom of the range.

## Results

Revenue = laptops sold x resale price + parts value - direct cost + certificate fees, where laptops
sold = (Reuse + Reuse open source) x share sold.

| Scenario     | Laptops in | Laptops sold | Resale revenue | Parts  | Direct cost | Certificates | **Net added** | vs. sales today | Bench hours |
| ------------ | ---------- | ------------ | -------------- | ------ | ----------- | ------------ | ------------- | --------------- | ----------- |
| Conservative | 120        | 46           | $13,776        | $0     | -$2,310     | $192         | **$11,658**   | +6%             | ~100        |
| Base         | 360        | 198          | $62,280        | $1,350 | -$7,920     | $1,260       | **$56,970**   | +31%            | ~370        |
| Stretch      | 960        | 594          | $186,840       | $3,600 | -$23,760    | $3,360       | **$170,040**  | +92%            | ~990        |

"Sales today" is about $185,000: sales were about 77% of revenue in 2025 on revenue that averaged
about $240,000. The comparison is approximate because the 77% share is for 2025 alone.

What the numbers say:

- **Resale is the revenue; the certificate is not.** Certificates add about $1,300 in the base case.
  The certificate is a reason for a business to choose Free Geek Toronto, not an income line.
- **The base case is one batch a month.** Twelve batches of 30 laptops adds roughly a third to sales
  without changing prices or who the organization sells to.
- **The limit is bench time, not demand.** The base case needs about 370 volunteer hours a year (about
  7 a week). The stretch case needs about 990 (about 19 a week), which means recruiting two or three
  more regular volunteers. That ties this plan to the volunteer-retention problem, and it is why the
  next phase has a monthly intake cap.
- **The low case still pays for itself.** Upfront cost is about $20, so the first batch covers it.

### Two checks on the base case

Both keep the base volume (12 batches of 30) and every other base input.

| Check                           | What changes                                                           | Net added   | vs. sales today |
| ------------------------------- | ---------------------------------------------------------------------- | ----------- | --------------- |
| Old laptops only                | Reuse 0%, Reuse (open source) 50%, Parts 25%, Recycle 25% (assumption) | **$25,920** | +14%            |
| Every business keeps its drives | $30 more direct cost per laptop sold, for a replacement drive          | **$51,030** | +28%            |

- **Old laptops only.** Windows 11 needs an Intel 8th-generation or AMD Ryzen 2000 processor and TPM
  2.0, so the laptops the Windows 10 deadline frees up are mostly from 2017 or earlier. None of them
  reaches the Reuse tier, they sell for about half as much ($200 against $380), and the 10-year rule
  starts recycling them: a 2016 laptop in 2027, a 2017 one in 2028. 144 laptops sold, $28,800
  resale, $1,800 parts, -$5,760 direct cost, $1,080 certificates, about 270 bench hours. The deadline
  is why businesses are replacing laptops now; the value is in the newer laptops they retire on a
  normal cycle.
- **Every business keeps its drives.** A business that wants no data to leave its office removes the
  drives before drop-off, and Free Geek Toronto fits a 256 GB drive to each laptop it sells, at about
  $30 each (assumption). 198 laptops sold x $30 = $5,940 off the base case.

### Why these volumes

- **12 partners a year (base)** is one batch a month. Drop-offs happen only on Fridays and Saturdays
  ([freegeektoronto.org/shop](https://www.freegeektoronto.org/shop)) and there is one full-time staff
  member, so the plan is sized to what that schedule can absorb.
- **30 laptops a batch (base)** assumes a business with roughly 100 to 150 staff on a four-year
  replacement cycle, or a smaller business clearing a backlog of stored machines. The four-year cycle
  is an assumption and needs checking against a real IT manager.
- **The market is large enough.** Canada has 1,099,521 employer businesses
  ([ISED, Key Small Business Statistics 2025](https://ised-isde.canada.ca/site/sme-research-statistics/en/key-small-business-statistics/key-small-business-statistics-2025)).
  The base case needs 12 of them in the Toronto area. The hard part is reaching them.
- **Outreach goes through IT firms.** Two or three IT service firms that look after laptops for many
  small businesses can each send several batches, so the pilot does not depend on cold contact with
  12 companies. The LinkedIn presence the organization already plans to build comes second. The
  channel exists: TechReset, an IT company, already sends its clients' old equipment to reBOOT Canada
  ([techreset.com](https://techreset.com/resources/donations/)).

## Where else a business can donate

A business retiring laptops in Toronto already has free options. The table is what each one says it
offers; none of it has been tested as a donor.

| Option                                                                                                                                    | Pickup                                   | Proof of data wiping                                                                                 | Tax receipt                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [reBOOT Canada](https://www.rebootcanada.ca/donate/) (Toronto charity)                                                                    | Arranged for businesses, may carry a fee | Secure data sanitization                                                                             | Where the equipment has fair market value                                         |
| [Electronic Recycling Association](https://www.era.ca/data-destruction-certification/) (non-profit)                                       | Booked pickups in the GTA                | Wipe certificate and serial-number inventory, depending on the service                               | Not checked                                                                       |
| [Computers for Schools Plus](https://ised-isde.canada.ca/site/computers-for-schools-plus/en/frequently-asked-questions) (federal program) | Varies by affiliate                      | Drives overwritten at least three times                                                              | For working computers                                                             |
| Free Geek Toronto                                                                                                                         | Drop-off, Fridays and Saturdays          | Drives securely wiped ([tech reuse](https://www.freegeektoronto.org/tech-reuse)); no certificate yet | No: not a charity ([freegeektoronto.org](https://www.freegeektoronto.org/donate)) |

What Free Geek Toronto and this tool add:

- **The plan before drop-off.** A reason for every serial before anything leaves the office. Whether
  the others offer this before pickup has not been checked, so it is not claimed.
- **Wipe certificates from the pilot on.** [nwipe](https://github.com/martijnvanbrummelen/nwipe), free
  open-source wipe software shipped in ShredOS, prints a PDF certificate for each drive it wipes. It
  needs no new code here, only Free Geek Toronto's agreement to adopt it.
- **Keep your drives.** A business that wants no data to leave can remove its drives (see the check
  above for the cost).
- **Local, low-cost resale.** A quarter of Free Geek Toronto's refurbished computers sell for under
  $100 ([freegeektoronto.org](https://www.freegeektoronto.org/donate)), and it sells affordable bulk
  technology to charities and non-profits, so a batch of matching laptops can also sell as a batch.

The tax receipt gap is real but small for old laptops: receipts follow an assessed fair market value,
and for a small corporation a receipt is a deduction, not cash. At the Ontario small-business rate of
about 12%, a $150 receipt saves about $18 (estimate).

## Upfront and running cost

| Item                  | Cost                    | Label                                                                                                        |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| Hosting               | $0                      | Every route builds as a static page, so free static hosting works. Check the host's terms for non-profit use |
| Domain (optional)     | About $20 a year        | Assumption. A subpath of freegeektoronto.org costs nothing                                                   |
| Building the tool     | $0 to Free Geek Toronto | Phase 1 is built (this repository)                                                                           |
| Staff time per batch  | About 1.5 hours         | Assumption: 30 minutes to review the plan, 1 hour to book and receive the drop-off                           |
| Staff time, base case | About 18 hours a year   | 12 batches x 1.5 hours                                                                                       |
| Replacement drive     | About $30 a laptop sold | Assumption: a 256 GB drive, only for businesses that keep their drives                                       |

## Success metrics

- Business donors per quarter
- Laptops per batch, and the share of batches that are a single model
- Share of donated laptops reused (laptop or open-source tier)
- Days from first upload to drop-off
- Certificate revenue

## Phases

| Phase                  | What                                                                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 (built)        | CSV planner, per-serial reasons, PDF summary                                                                                                          |
| Pilot (Jan–Mar 2027)   | No new code. Three businesses through IT firms; nwipe certificates for every wiped drive, free; keep-your-drives option. Stops unless the gate passes |
| Phase 2 (Apr–Dec 2027) | Drop-off booking with a monthly cap, staff view. The $10 certificate goes on sale                                                                     |
| Phase 3 (2028)         | Per-serial tracker and wipe log import, so a batch's certificates arrive as one PDF matched to the plan                                               |

The pilot gate: at least three businesses donate, and the plan matches the bench on at least 80% of
laptops. If either fails by the end of March 2027, the pilot stops.

## Risks

- Free options already exist (see "Where else a business can donate"), and Free Geek Toronto cannot
  issue tax receipts.
- The plan is a prediction from a spreadsheet; the bench confirms each device.
- Wipe certificates depend on Free Geek Toronto adopting nwipe or a similar tool. The certificate PDF
  in this app is priced, not built.
- Businesses still have to find the tool. The IT-firm channel is untested, and the pilot gate is what
  limits the cost of being wrong.
