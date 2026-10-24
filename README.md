# FGT Retire

**Free, data-safe laptop donations for organizations.**

FGT Retire helps organizations with 10 to 200 laptops donate their old fleet to Free Geek Toronto. Every drive is wiped following NIST SP 800-88, and every working laptop goes back into the community at an affordable price.

Built for FUSEHACKS 2026 (Blueprint 2026 by FUSE Society), Free Geek Toronto case.

## The problem

Free Geek Toronto refurbishes donated technology and sells it at low prices. Sales are about 77% of its revenue, so growth depends on a steady supply of usable laptops.

That supply is shrinking. People now sell or trade in their best devices, so what arrives is irregular and slow to refurbish. Uniform batches of business laptops would be the fastest to refurbish, but Free Geek Toronto has no corporate partners to provide them. Organizations that want to retire a fleet need proof that their data is gone, and commercial IT asset disposal is priced for large enterprises.

## The solution

One web app that makes a business donation simple, safe and predictable.

1. **Upload.** The organization uploads its laptop list as a CSV.
2. **Instant plan.** Each serial number is placed in one tier: reuse, reuse with open-source software, parts, recycle, or return to donor.
3. **Book a drop-off.** Monthly intake is capped to fit Free Geek Toronto's space and staff.
4. **Track and certify.** Each laptop is tracked from received to wiped to reused. A data sanitization record is issued per serial, only after a matching wipe log exists.

### Pricing

| | Price |
|---|---|
| Donating | Free. Every drive is wiped. |
| Itemized certificate (optional) | $10 per device that is reused or harvested for parts |
| Recycled devices | Never charged |
| Non-profits, schools and charities | Certificates are free |

## Scoring rules

Rules run in this order. The first match wins. All thresholds are in [`src/lib/rules.ts`](src/lib/rules.ts).

| Order | Tier | Rule |
|---|---|---|
| 1 | Return to donor | Still locked to device management or Activation Lock |
| 2 | Recycle | Older than 10 years, or damage that leaves no usable parts |
| 3 | Parts | Any other reported damage |
| 4 | Reuse | 2019 or newer, Intel 8th gen / AMD Ryzen 2000 / Apple silicon or newer, TPM 2.0, 8 GB RAM or more, SSD |
| 5 | Reuse (open source) | 2016 or newer and 4 GB RAM or more |
| 6 | Parts | Everything else |

If TPM is not reported, it is inferred from the CPU generation.

## CSV format

Required columns: `serial`, `make`, `model`, `cpu`, `ram_gb`, `storage` (`ssd`, `nvme` or `hdd`), `year`.
Optional columns: `damage`, `tpm` (`yes` / `no`), `locked` (`yes` / `no`).

See [`public/samples/fleet-sample.csv`](public/samples/fleet-sample.csv).

## Getting started

Requires Node.js 20 or later.

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # run the test suite
npm run build   # production build
```

## Project structure

```
src/
  app/            pages (landing page, /plan)
  components/     UI components
  lib/            scoring rules, CPU parsing, CSV parsing, plan builder
public/samples/   sample fleet CSV
tests/            unit tests (Vitest)
```

## Tech stack

Next.js, React, TypeScript, Tailwind CSS, Papa Parse, Vitest.

## Roadmap

- [x] CSV upload with row-level validation
- [x] Ordered scoring rules and instant donation plan
- [x] Pricing with optional certificates
- [ ] Drop-off booking with a monthly cap
- [ ] Per-serial tracker (received, wiped, tested, reused)
- [ ] Wipe log import and per-serial certificate PDF
- [ ] Staff view of incoming batches
- [ ] Hosted deployment

## Disclaimer

A concept for Free Geek Toronto. Not affiliated with or endorsed by Free Geek Toronto.

## License

[MIT](LICENSE)
