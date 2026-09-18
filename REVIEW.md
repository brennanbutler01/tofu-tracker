# Reviewing TofuTracker

The real application supports learning, course and question authoring, written-response grading, feedback and progress reports. Its visitor edition creates fictional data in a separate PostgreSQL workspace without signup. Deployment status is recorded in [Backend readiness](BACKEND-READINESS.md).

## Suggested walkthrough

Open `/demo` and choose **Start demo**. Complete the reliability activity, add question feedback, then open the administrator review queue and grade the sample written response. Create or edit a deck and reload to check persistence. **Reset demo** deletes the workspace. Its session expires after one hour.

Each visitor can explore both author and learner workflows within their own workspace. This is not an assessment-security demonstration: practice question responses can include correct answers, and demo administrators can edit their own content.

## Code tour

| Area | Read | What to look for |
| --- | --- | --- |
| Learning | `server/gameSessions.ts`, `server/learningSessions.ts` | Server-derived scores and ordering, owner checks, transactional progress. |
| Grading | `server/gradingSessions.ts`, `server/assessmentResults.ts` | Exclusive reviewer claims, pending written answers, result recalculation. |
| Authoring | `server/deckAuthoring.ts`, `server/contentAuthoring.ts` | Immutable question versions, prerequisite cycles, retained attempt history. |
| Feedback | `server/questionFeedback.ts` | Validated commands, authorship, bounded threads and safe resource links. |
| Visitor isolation | `server/visitorScope.ts`, `server/visitorAccess.ts` | Content ownership, fixed expiry, same-origin writes and atomic request budgets. |
| Cleanup | `server/visitorWorkspace.ts` | Independent synthetic content, capacity limit and complete workspace deletion. |
| Verification | `scripts/verify-visitor-*.mjs`, `scripts/visitorWorkspace.integration.ts` | Real database and browser checks for isolation, persistence, expiry and reset. |
| Deployment | `scripts/deploy_visitor.py` | Tracked application source deployed to the dedicated personal project without local environment files. |

## Reproduce checks

Use Node 24 and pinned Yarn through Corepack. Follow [README](README.md) for Docker setup and [Backend readiness](BACKEND-READINESS.md) for ordinary and visitor verification. Continuous integration runs both against disposable PostgreSQL and production builds. The older static presentation remains under `portfolio-site/` for reference.

## Boundaries

- Visitor data is synthetic. No original agency data or accounts are published.
- Email delivery and migration of real users are not verified or enabled in visitor mode.
- Three Prisma development-tool dependency advisories remain documented in [Dependencies](DEPENDENCIES.md).
- Clean source/history scans do not revoke credentials exposed in older repositories. Provider rotation and removal of GitHub-retained old objects remain separate incident work.
- This is a maintained recovery of an older project, with explicit tested behavior and remaining limits.
