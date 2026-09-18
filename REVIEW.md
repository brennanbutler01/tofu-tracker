# Reviewing TofuTracker

Start with the [live portfolio demo](https://tofu-tracker-demo.vercel.app). Complete the three-question course, switch to the reviewer view, leave feedback, and see the learner's results change. Reset or reload to start over. No signup, external services, cookies, browser storage, or backend are needed for this demonstration.

## What this repository contains

The original application is a Next.js learning-management system with PostgreSQL, Prisma, email sign-in, course authoring, practice sessions, and review/grading workflows. It was originally built around training needs at ODHS. The demo is a separate presentation of those workflows using fictional customer-service content, not agency rules or records.

The recovery branch deliberately preserves that distinction. The demo is suitable to share; the original authenticated backend still needs a broader authorization review and dependency remediation before hosting real users.

## Suggested code tour

| Area | Read | What to look for |
| --- | --- | --- |
| Demo grading | `portfolio/course.ts`, `__tests__/course.test.ts` | Pending written answers are excluded from accuracy until a human grades them. |
| Shared answer comparison | `utils/answersMatch.ts`, `components/game/QuizForm.tsx` | The original quiz and demo use the same normalized answer comparison. |
| Account permissions | `server/userHandlers.ts`, `server/userRepository.ts` | Explicit writable fields, ownership, administrator permissions, and injected persistence. |
| Permission regressions | `__tests__/userHandlers.test.ts` | Real HTTP requests exercise handlers, including rejection of nested writes and role escalation. |
| Personal statistics | `pages/profile/index.tsx` | Session-gated queries, grouped outcomes, and completed/passed courses scoped to the learner. |
| Running application | `scripts/verify-local-api.mjs`, `scripts/verify-local-browser.mjs` | Disposable users and sessions verify real database writes, permissions and browser behavior. |
| Deployment boundary | `portfolio-site/`, `scripts/deploy_portfolio.py` | Only a static export is uploaded; the original server and environment files are excluded. |

## Reproduce the demo checks

Use Node 24.13.0 and Yarn 1.22.22 through Corepack:

```sh
nvm use
corepack yarn install --frozen-lockfile --ignore-scripts
corepack yarn prisma generate
corepack yarn typecheck
corepack yarn test
corepack yarn build:portfolio
corepack yarn playwright install chromium
corepack yarn test:portfolio
```

These checks need no provider credentials or database. The workflow in `.github/workflows/verify.yml` runs the same sequence on pushes and pull requests. The full original application uses the disposable Docker setup described in the README.

## Review boundaries

- Passing tests cover the named behaviors, not every historical endpoint.
- The original application still has dependency advisories; see `RECOVERY.md`. The demo does not import its authentication, database, email, charting, or component-library code.
- Email-provider delivery, real user migration and concurrency behavior have not been verified against hosted systems.
- Old credentials were removed from branch history. Provider revocation and GitHub's retained old commit removal remain separate incident follow-ups. Keep the affected original repository private until that work and the historical asset review are complete.
- This is a maintained portfolio recovery of an older project, not a claim that the entire original codebase meets current production standards.
