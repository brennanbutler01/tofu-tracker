# TofuTracker

**[Try the live demo](https://tofu-tracker-demo.vercel.app)** · **[Reviewer code tour](REVIEW.md)**

Practice a short course, review a written response, and watch learner results update. The public demo uses fictional, disposable data and needs no signup.

Built with React and TypeScript using Next.js + Antd. Jest and React Testing Library used for testing. Using PostgreSQL + Prisma secured by Next-Auth for the backend.

![cute-tofu](assets/cute-tofu.png)

## Table of Contents

-   [Description](#description)
-   [Lessons Learned](#lessons-learned)
-   [Pre-Requisites](#prerequisites)
-   [Installation](#installation)
-   [Features](#features)
-   [Usage](#usage)
-   [Tests](#tests)
-   [Contact](#contact)
-   [Credits](#credits)
-   [License](#license)

---

## Description

TofuTracker was made for D15 Clackamas County APD with ODHS while I was a member of the district QA team.

TofuTracker is a learning management app - allowing leadership to create learning activities, quizes, and decks of questions and staff to practice topics. We needed a way to obtain metrics and information about
areas of needed improvement and gaps in staff knowledge relating to ODHS Public Assistance programs.

## Lessons Learned

1. Authorization was made more annoying because ODHS uses Outlook for email and it strips out the magic link functionality that Next-Auth uses by default for auth. Setup OTP style verification tokens and verify those to get around it, but learned a lot about sending emails to users.
2. I learned to let business requirements and requests drive feature development more than what I think might be needed - did a lot of requirement gathering and meeting with users to refine what they wanted to see in the app and learned a lot about business analysis as a result.
3. Trying to design the app to be easy for non-technical employees to access and admin users to be able to create new activities, etc taught me more about auth roles.

## Local recovery setup

Recovery work is on `portfolio-refresh`. The original application is not ready for a public, multi-user deployment. See [RECOVERY.md](RECOVERY.md) for verification and remaining work. The public portfolio demo is a separate static export with synthetic disposable data; its source is in `portfolio/` and `portfolio-site/`.

Use Node 24.13.0 and the pinned Yarn version through Corepack:

```bash
nvm use
corepack yarn install --frozen-lockfile
corepack yarn local:setup
corepack yarn dev --port 5196
```

The setup command creates a gitignored `.env.local` with a random authentication secret and starts a disposable PostgreSQL container on loopback port 5197. It refuses any other database URL. It does not load the old production environment or send email. Leave `EMAIL_API` and `EMAIL_SECRET` unset unless deliberately testing your own Mailjet account. The database is initially empty. The verification scripts create and remove their own synthetic users and records.

```bash
corepack yarn typecheck
corepack yarn test
corepack yarn build
corepack yarn start --hostname 127.0.0.1 --port 5196
```

With that server running, verify it from another terminal:

```bash
corepack yarn playwright install chromium
corepack yarn verify:local
corepack yarn verify:browser
```

Styles compile from the existing Ant Design Less theme before development/build; the generated CSS is ignored. There are no global package installs or automatic dependency overrides.

Sign-in email cannot be changed through the profile form because it is an authentication identifier. Display names remain editable; administrators can assign roles and teams. The `User.role` database field is the source of authority. Old rows in the `Admin` table no longer silently restore an administrator role during sign-in.

## Features

1. Create "decks" of questions, learning tracks, courses, and activities for staff to study.
2. Users can free play or take structured content that was prepared.
3. Admin users can create different types of questions, like multiple choice, true/false, free response, or questions requiring a specific amount, fill in the blank, or questions requiring a specific answer.
4. Leadership can view stats and find what questions are being missed, by who, and how often!
5. Instant feedback on question responses.

## Usage

See [tests](#tests) below for running tests.

To run dev server, run `yarn run dev`.

To build the app, run `yarn build`

To build and start a prod build, run `yarn start`.

To lint with eslint, run `yarn run lint`.

To format with prettier, run `yarn run format`

**Screenshots**

## Tests

We use jest with react testing library for integration and unit tests.

To run the jest tests, open your terminal to the project root and run `yarn test`.

## Contact

For questions, feel free to email me at [brennanbutler01@gmail.com](mailto:brennanbutler01@gmail.com) or open up an issue here! I'll respond and try to help you out or answer any questions that you might have.

## Credit

Thanks to ODHS D15 APD for helping to specify requirements, being patient while I built , and helping with testing and using the system!

## License

TofuTracker is available under the MIT license. Please check out the [LICENSE.md](LICENSE.md) for any questions.

---
