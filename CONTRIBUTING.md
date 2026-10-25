# Contributing

How we work on FGT Retire: branch naming, review, commit style and the rules we hold ourselves to
when writing about the product.

## Setup

Requires Node.js 22 (see [`.nvmrc`](.nvmrc); 20 also works).

```bash
git clone https://github.com/monke-sniper/fgt-retire.git
cd fgt-retire
npm ci
npm run dev        # http://localhost:3000
```

On Windows, if a clone fails with "Filename too long", run `git config --global core.longpaths true`
or clone into a short path such as `C:\code\fgt-retire`.

## Workflow

1. Pick or open an issue. Assign yourself so nobody doubles up.
2. Branch from `main`: `feat/<thing>`, `fix/<thing>`, `docs/<thing>` or `chore/<thing>`.
3. Make the change with tests (see below).
4. Run `npm run verify` and `npm run format:check`. Both must pass.
5. Open a pull request into `main` and fill in the template. Link the issue with `Closes #N`.
6. CI runs the same checks. Merge with **Squash and merge** once it is green and a teammate has
   looked at it. The branch is deleted on merge.

Never push straight to `main`: the free private plan cannot enforce this, so it is on us.

## Commits

Conventional commits, short and in the imperative: `feat: add drop-off booking form`,
`fix: keep eMMC out of modern reuse`, `docs: update the cost model`. Types: `feat`, `fix`, `docs`,
`test`, `refactor`, `chore`, `ci`, `perf`.

## Code

- Logic lives in `src/lib` as plain functions with no React. UI lives in `src/components` and
  `src/app`. Keep scoring thresholds in [`src/lib/rules.ts`](src/lib/rules.ts), not in the scoring
  code.
- Every change to `src/lib` comes with a test in `tests/*.test.ts`. UI behaviour gets a Testing
  Library test in `tests/*.test.tsx`. Write the test first when fixing a bug.
- Prettier formats everything (`npm run format`). ESLint must be clean.
- No backend, no uploads. Files are read in the browser; keep it that way unless the team decides
  otherwise.

## Honesty rules

This project is read by Free Geek Toronto and by outside reviewers, so claims matter more than
polish.

- Do not describe anything as built until it is. The README "Status" and the landing page "Not
  built yet" list must match the code.
- No "NIST certified" or "guaranteed" wording. SP 800-88 is guidance and nothing here wipes a drive.
- A plan is a prediction from a spreadsheet, not a bench result. Say so wherever totals appear.
- Label every estimated number (prices, volumes) as an assumption.
- We are not affiliated with Free Geek Toronto. Keep the footer disclaimer.
