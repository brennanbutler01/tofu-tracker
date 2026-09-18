# Tracker backend recovery

The hosted site still serves the prior static demonstration. Do not replace it with this backend until the remaining permission review, visitor isolation, deployment and hosted verification are complete.

## Learning-session repair

Practice games, activities and courses now accept small commands instead of browser-supplied Prisma updates. The server derives ownership, question order, answer correctness, counters, completion and passing scores. Written responses require human grading. Transactions lock the game row so duplicate answers and concurrent advance requests cannot double-count or skip unanswered questions.

Game, course-session and activity-session detail pages check the signed-in owner before returning server-rendered data. Unfinished-game deletion is restricted to the owner's unfinished practice games. The client retains an answer after a failed save and shows results only after the server accepts it. Completion distinguishes pending written responses from passed or unsuccessful assessments.

`questionOrder` is an additive GameSession column. Existing records with an empty order retain deterministic creation/id ordering. Apply the schema only to the disposable local database or the future dedicated demo database, never an original production database.

## Verification

Use Node 24, pinned Yarn, and `corepack yarn local:setup`. Start the application on loopback port 5220 with `NEXTAUTH_URL=http://127.0.0.1:5220`. Then run:

```sh
LOCAL_API_URL=http://127.0.0.1:5220 corepack yarn verify:local
corepack yarn verify:learning
corepack yarn verify:learning-browser
```

The 51 learning-session HTTP/database checks cover owner isolation, server-rendered pages, forged score rejection, duplicate/concurrent answers, persisted question order, deletion rules and course/activity completion. Browser checks exercise practice, activity and course answering on desktop and mobile, including failed-save recovery, persistence and pending written responses. Existing 24 unit tests and 13 profile/permission checks remain in place. Continuous integration runs these against a production build and disposable PostgreSQL.

## Remaining

- Secure authoring, deck/question editing, course/learning-track ordering and their rendered pages. Existing raw nested writes outside the repaired session routes must not reach hosting.
- Require reviewer permission for grading and scope every grading session, answer, critique and resource. Recalculate game and assessment results when a written response is graded.
- Review feedback, metrics and other routes for role and ownership checks, input validation, method handling and bounded reads/writes.
- Add isolated visitor workspaces and synthetic content, including explicit ownership for shared course/activity/track models. Build complete expiry/reset cleanup and request budgets.
- Verify author/reviewer and learner workflows on desktop/mobile, including failures and cross-visitor access.
- Scan publication source/history and assets, deploy the real application on the personal Vercel project with dedicated free persistence, and repeat hosted verification.

The earlier profile-only checks and static demo do not prove that the remaining backend is safe to expose. Real email sign-in still needs separately provisioned credentials; no historical credentials are reused.
