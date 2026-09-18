# Tracker backend recovery

The hosted site still serves the prior static demonstration. Do not replace it with this backend until the remaining permission review, visitor isolation, deployment and hosted verification are complete.

## Learning-session repair

Practice games, activities and courses now accept small commands instead of browser-supplied Prisma updates. The server derives ownership, question order, answer correctness, counters, completion and passing scores. Written responses require human grading. Transactions lock the game row so duplicate answers and concurrent advance requests cannot double-count or skip unanswered questions.

Game, course-session and activity-session detail pages check the signed-in owner before returning server-rendered data. Unfinished-game deletion is restricted to the owner's unfinished practice games. The client retains an answer after a failed save and shows results only after the server accepts it. Completion distinguishes pending written responses from passed or unsuccessful assessments.

`questionOrder` is an additive GameSession column. Existing records with an empty order retain deterministic creation/id ordering. Apply the schema only to the disposable local database or the future dedicated demo database, never an original production database.

## Reviewer repair

Only administrators can use the grading queue. Review sessions belong to their reviewer, including server-rendered pages. Claiming an answer locks it before assigning it, so simultaneous reviewers cannot take the same work. The client sends bounded grade, critique, resource and advance commands. It cannot replace ownership, attach unrelated answers or submit arbitrary database updates.

Grading recalculates practice counters and course/activity results in the same transaction. An assessment cannot pass while a written answer remains ungraded, even if its automatic answers already meet the threshold. Editing a grade updates the result again. Critiques can be edited, resource links require HTTPS, failed saves preserve entered text, and review completion is derived on the server. The administrator queue also links back to unfinished reviews.

## Metrics and user feedback repair

Question and course reports join answers to their actual questions and sessions to their actual courses. Administrator-only report routes validate and bound selections, and the rendered metrics page also checks the role. Pending written responses and unfinished assessments are distinct from failures. Reports show exact counts alongside responsive charts and display request failures.

General user-feedback submissions accept only their form fields, derive authorship from the session, and return only the caller's feedback. Failed saves preserve the form. The graded-answer feed remains restricted to its learner and now has bounded reads and consistent method/error handling. Question-specific feedback is covered below.

## Deck and question authoring repair

Deck creation/editing and question commands require administrator access. Requests contain only supported fields and cannot move ownership, inject nested database writes or edit a question through an unrelated deck. Answer choices are bounded and unique; multiple-choice answers must match an available choice. True/false choices are generated consistently.

Every question edit creates a new active version and archives the original. Existing games keep their question content, answer options and grading meaning. A concurrent edit using the replaced identifier fails instead of overwriting another edit. Connected activity ordering follows the new version for future sessions. Deck and question removal archives content, preserving both completed and in-progress attempts; active counts exclude archived versions.

The editing forms retain values on failure, option/answer dialogs close only after accepted saves, and deck authoring pages check the administrator role before rendering. The practice page redirects unauthenticated visitors before loading user history.

## Curriculum and question feedback repair

Course, activity and learning-track edits accept validated fields and require administrator access, including their rendered pages. Prerequisite cycles are rejected. Activities copy selected questions rather than moving them from another activity. Archives preserve attempt records; each new attempt snapshots its passing percentage. Ordered track membership is replaced atomically. Failed editor saves retain entered values.

Question feedback accepts bounded comment/reply, rating, resource and reaction commands. The server derives authorship, verifies thread/resource membership, restricts resource edits to their author, and permits only HTTPS resource links without embedded credentials. Learners must have the question in one of their sessions. Feedback exposes public user identity fields only. Serialized writes avoid duplicate ratings and lost reaction updates.

Feedback controls work across practice, activity and course sessions, using the actual question identifier rather than assuming every route contains a practice-game identifier. Forms retain failed submissions. Verification includes 79 curriculum checks with desktop/mobile editing, 46 question-feedback checks, and six desktop/mobile feedback workflows covering all three session types.

## Verification

Use Node 24, pinned Yarn, and `corepack yarn local:setup`. Start the application on loopback port 5220 with `NEXTAUTH_URL=http://127.0.0.1:5220`. Then run:

```sh
LOCAL_API_URL=http://127.0.0.1:5220 corepack yarn verify:local
corepack yarn verify:learning
corepack yarn verify:learning-browser
corepack yarn verify:grading
corepack yarn verify:metrics-feedback
corepack yarn verify:authoring
corepack yarn verify:curriculum
corepack yarn verify:question-feedback
corepack yarn verify:feedback-browser
```

The 51 learning-session HTTP/database checks cover owner isolation, server-rendered pages, forged score rejection, duplicate/concurrent answers, persisted question order, deletion rules and course/activity completion. Browser checks exercise practice, activity and course answering on desktop and mobile, including failed-save recovery, persistence and pending written responses. The grading suite adds 84 HTTP/database checks and two browser workflows covering reviewer ownership, concurrent claiming, rejected nested writes, score recalculation, edited feedback, safe resource links, and desktop/mobile review completion with failed-save recovery. The metrics/feedback suite adds 35 HTTP/database assertions and desktop/mobile report and feedback workflows, including failure recovery. The authoring suite adds 51 HTTP/database checks for editing roles, field validation, concurrent edits, immutable content, option rules and archiving, plus persisted desktop/mobile creation/editing workflows. Existing 24 unit tests and 13 profile/permission checks remain in place. Continuous integration runs these against a production build and disposable PostgreSQL.

## Remaining

- Add visitor scoping to curriculum, feedback, reporting and reviewer reads.
- Add isolated visitor workspaces and synthetic content, including explicit ownership for shared course/activity/track models. Build complete expiry/reset cleanup and request budgets.
- Verify author/reviewer and learner workflows on desktop/mobile, including failures and cross-visitor access.
- Scan publication source/history and assets, deploy the real application on the personal Vercel project with dedicated free persistence, and repeat hosted verification.

The earlier profile-only checks and static demo do not prove that the remaining backend is safe to expose. Real email sign-in still needs separately provisioned credentials; no historical credentials are reused.
