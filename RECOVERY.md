# TofuTracker recovery

## Scope

The original learning-management application is being recovered locally on `portfolio-refresh`. This clean source edition is public for review; do not deploy its authenticated backend with real users yet. No real staff records are used for recovery tests.

Implemented in this pass:

- Pin Node, Next.js, NextAuth, Prisma and TypeScript; compile the existing Less theme separately from Next.js.
- Remove the historical environment file from the current tree and ignore local credentials. The separate September 17 history cleanup removed the identified values from GitHub branch history. Provider revocation and retained GitHub commit cleanup remain separate follow-ups.
- Stop user GET requests from falling through into updates; restrict account access to the owner or an administrator, with administrator-only deletion.
- Validate account changes using explicit fields. Reject role escalation, nested database mutations and unverified changes to sign-in email.
- Check administrator permissions before server-rendered admin pages load user/grading records.
- Restrict per-user answer history and handle Pacific daylight-saving time in grouping.
- Generate sign-in codes with secure randomness, expire them after 15 minutes, await email delivery errors, and avoid resurrecting privileges from the old Admin table.
- Keep frontend requests on the current origin and propagate network errors.
- Add HTTP-level permission regression tests and a disposable local database setup.

## Verification

Verified September 18, 2026 against synthetic fixtures and the disposable local database:

- Production build, including lint/type checks: passed.
- Jest: 24 tests passed, covering profile ownership, administrator permissions, rejected privilege escalation, errors and verification-code generation.
- Running production server plus PostgreSQL: 13 HTTP/database permission checks passed.
- Chromium browser: sign-in redirect, accurate personal answer/course statistics, profile edit persistence after reload, disabled email editing, admin denial, mobile layout and no uncaught page errors passed.
- Gitleaks scan of tracked and unignored source: no findings.

Also repaired React type-version conflicts, Next.js image/link compatibility, current Prisma model-selection types, nullable numeric inputs, and learning-track form initialization. Browser tests caught and eliminated link hydration errors. Profile statistics now count correct and incorrect answers correctly and include only the learner's completed, passed courses.

The dependency audit remains a blocker for the original hosted backend: 84 distinct module/severity/title advisories across 432 dependency-path findings, including critical advisories involving `@babel/traverse` and `form-data`. These counts include tooling and transitive dependencies and are not a claim that every advisory is exploitable in this app. No dependency overrides or type-check suppression were added.

Run the production server on loopback port 5196 after `yarn local:setup` and `yarn build`, then use `yarn verify:local` and `yarn verify:browser`. Browser checks need the Playwright Chromium installation (`yarn playwright install chromium`). Fixtures are unique per run and deleted afterwards; tests do not send email or use hosted records.

## Remaining before public backend hosting

- Review authorization and input validation across the remaining course, deck, activity, game, grading, feedback and resource endpoints and server-rendered pages. This pass does not establish their safety.
- Exercise the complete authoring, study, grading and administration workflows with synthetic browser/database fixtures.
- Audit dependencies and resolve deployment-relevant advisories.
- Confirm historical credential rotation/revocation with their owners; do not rely on deleting a tracked file.
- Review authentication delivery, rate limiting, database migration/backup strategy and concurrent session updates.
- A public portfolio demo must exclude backend routes, private records and credentials, and have independent validation before deployment.

## Public portfolio demo, September 18

The initial independent personal Vercel Hobby deployment at https://tofu-tracker-demo.vercel.app published only the static `portfolio-site/out` files, used no server functions or configured provider secrets, and had no Git connection to the old hosted project. Five browser scenarios passed locally and on that static edition: automatic feedback plus human review, a needs-improvement outcome, per-tab isolation/reset/reload, mobile layout without backend requests, and 404 responses for credential/server routes. The database-backed visitor deployment below now supersedes it; the static build remains for offline review.

The demo shares answer normalization with the original quiz. Its 12 exported files passed the default secret scan and an exact comparison against the previously collected credential values. The original backend's dependency advisories do not disappear because the demo is hosted; the authenticated backend remains unsuitable for public hosting. `REVIEW.md` identifies the supported review scope.

## September 18 dependency and publication pass

Upgraded to Next.js 16.3.4 and Prisma 7.10.0 with its PostgreSQL adapter. Both the original app and static demo build. Historical screenshots were removed from the publication source. See `DEPENDENCIES.md` for the current three Prisma development-tool advisories, which supersede earlier dependency counts. The static demo remains available for offline review; public hosting now uses the isolated visitor mode described below. Real-user authentication and external-provider limitations above still apply.

Public source is published from an independent clean snapshot. Affected original repositories remain private, and their cached historical commits are not imported. Credential revocation is separate from source cleanup.

## Database-backed visitor deployment

The public site now runs the original application in an explicit visitor mode with a dedicated Neon free database. Each no-signup visitor receives an isolated synthetic administrator workspace, an opaque one-hour cookie, persisted learning and grading records, and complete reset. Visitor administrators cannot manage other accounts, and email sign-in is disabled.

All 29 hosted API checks pass, covering real authentication, persistence, cross-workspace rejection, rendered-page authorization, and reset. Desktop and mobile browser workflows pass for learning, failed-save recovery, comments, human review, authoring, reload persistence, and reset. Expiry, request/write limits, capacity, and concurrent reset remain local-only lifecycle checks. See [BACKEND-READINESS.md](BACKEND-READINESS.md) for the complete verified boundary.
