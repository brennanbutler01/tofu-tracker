# Tracker backend recovery

The hosted site still serves the prior static demonstration. Do not replace it with this backend until the remaining permission review, visitor isolation, deployment and hosted verification are complete.

## Learning-session repair

Practice games, activities and courses now accept small commands instead of browser-supplied Prisma updates. The server derives ownership, question order, answer correctness, counters, completion and passing scores. Written responses require human grading. Transactions lock the game row so duplicate answers and concurrent advance requests cannot double-count or skip unanswered questions.

Game, course-session and activity-session detail pages check the signed-in owner before returning server-rendered data. Unfinished-game deletion is restricted to the owner's unfinished practice games. The client retains an answer after a failed save and shows results only after the server accepts it. Completion distinguishes pending written responses from passed or unsuccessful assessments.

`questionOrder` is an additive GameSession column. Existing records with an empty order retain deterministic creation/id ordering. Apply the schema only to the disposable local database or the future dedicated demo database, never an original production database.

## Reviewer repair

Only administrators can use the grading queue. Review sessions belong to their reviewer, including server-rendered pages. Claiming an answer locks it before assigning it, so simultaneous reviewers cannot take the same work. The client sends bounded grade, critique, resource and advance commands. It cannot replace ownership, attach unrelated answers or submit arbitrary database updates.

Grading recalculates practice counters and course/activity results in the same transaction. An assessment cannot pass while a written answer remains ungraded, even if its automatic answers already meet the threshold. Editing a grade updates the result again. Critiques can be edited, resource links require HTTPS, failed saves preserve entered text, and review completion is derived on the server. The administrator queue also links back to unfinished reviews.

## Verification

Use Node 24, pinned Yarn, and `corepack yarn local:setup`. Start the application on loopback port 5220 with `NEXTAUTH_URL=http://127.0.0.1:5220`. Then run:

```sh
LOCAL_API_URL=http://127.0.0.1:5220 corepack yarn verify:local
corepack yarn verify:learning
corepack yarn verify:learning-browser
corepack yarn verify:grading
```

The 51 learning-session HTTP/database checks cover owner isolation, server-rendered pages, forged score rejection, duplicate/concurrent answers, persisted question order, deletion rules and course/activity completion. Browser checks exercise practice, activity and course answering on desktop and mobile, including failed-save recovery, persistence and pending written responses. The grading suite adds 82 HTTP/database checks and two browser workflows covering reviewer ownership, concurrent claiming, rejected nested writes, score recalculation, edited feedback, safe resource links, and desktop/mobile review completion with failed-save recovery. Existing 24 unit tests and 13 profile/permission checks remain in place. Continuous integration runs these against a production build and disposable PostgreSQL.

## Remaining

- Secure authoring, deck/question editing, course/learning-track ordering and their rendered pages. Existing raw nested writes outside the repaired session routes must not reach hosting.
- Review feedback, metrics and other routes for role and ownership checks, input validation, method handling and bounded reads/writes.
- Add isolated visitor workspaces and synthetic content, including explicit ownership for shared course/activity/track models. Build complete expiry/reset cleanup and request budgets.
- Verify author/reviewer and learner workflows on desktop/mobile, including failures and cross-visitor access.
- Scan publication source/history and assets, deploy the real application on the personal Vercel project with dedicated free persistence, and repeat hosted verification.

The earlier profile-only checks and static demo do not prove that the remaining backend is safe to expose. Real email sign-in still needs separately provisioned credentials; no historical credentials are reused.
