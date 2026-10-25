# FGT Retire

Laptop donation planner for businesses donating to Free Geek Toronto. Workflow and conventions
are in `CONTRIBUTING.md`.

## Commands

- `npm run dev`: dev server on http://localhost:3000
- `npm test`: Vitest (node project for `tests/*.test.ts`, jsdom project for `tests/*.test.tsx`)
- `npm run verify`: typecheck, lint, test, build. Must pass before a PR.
- `npm run format` / `npm run format:check`: Prettier

## Layout

- `src/lib/`: pure logic. `rules.ts` (thresholds), `cpu.ts` (CPU name parsing), `csv.ts` (CSV
  parsing and validation), `scoring.ts` (one tier and reason per device), `plan.ts` (totals and
  certificate price), `summary.ts` (PDF summary content and rendering).
- `src/components/PlanBuilder.tsx`: the only client component; upload, options, plan, PDF button.
- `src/app/`: landing page `/` and planner `/plan`.
- `public/samples/fleet-sample.csv`: the demo fleet. Tests depend on its totals (7/4/3/1/1, $140).

## Rules

- Client-side only: the CSV never leaves the browser. No backend unless the team decides otherwise.
- Scoring rules run in a fixed order and the first match wins; change thresholds in `rules.ts`.
- If any row fails validation the whole plan is withheld. Do not show partial totals.
- `jspdf` is dynamically imported so it stays out of the `/plan` first load. Keep it that way.
- Tests first for bug fixes. Keep the honesty rules in `CONTRIBUTING.md`: no claims of
  certification, nothing described as built before it is, assumptions labelled.
- Branch from `main`, squash-merge PRs, conventional commit messages.
