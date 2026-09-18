import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { randomUUID } from 'node:crypto'
import assert from 'node:assert/strict'
import { chromium, expect } from '@playwright/test'
const origin = process.env.LOCAL_API_URL || 'http://127.0.0.1:5220'
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))
    throw new Error('Use only the disposable local server')
const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString:
            'postgresql://demo:local-demo-only@127.0.0.1:5197/tofu_tracker',
    }),
})
const prefix = 'metrics-' + randomUUID(),
    admin = prefix + '-admin',
    learner = prefix + '-learner',
    other = prefix + '-other'
const users = [admin, learner, other],
    tokens = new Map(),
    courses = [prefix + '-one', prefix + '-two'],
    questionIds = [prefix + '-q1', prefix + '-q2', prefix + '-q3']
let checks = 0,
    browser
async function request(
    path,
    { user = admin, method = 'GET', body, status = 200 } = {}
) {
    const response = await fetch(origin + path, {
        method,
        redirect: 'manual',
        headers: {
            'Content-Type': 'application/json',
            ...(user
                ? { Cookie: 'next-auth.session-token=' + tokens.get(user) }
                : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    })
    const text = await response.text()
    assert.equal(
        response.status,
        status,
        `${method} ${path}: ${text.slice(0, 100)}`
    )
    checks++
    try {
        return JSON.parse(text)
    } catch {
        return null
    }
}
try {
    for (const id of users) {
        const token = randomUUID()
        tokens.set(id, token)
        await prisma.user.create({
            data: {
                id,
                name: 'Synthetic analyst',
                email: id + '@example.invalid',
                role: id === admin ? 'ADMIN' : 'USER',
                sessions: {
                    create: {
                        sessionToken: token,
                        expires: new Date(Date.now() + 900000),
                    },
                },
            },
        })
    }
    await prisma.deck.create({
        data: {
            id: prefix,
            title: 'Metric fixture',
            userId: learner,
            tags: [],
        },
    })
    for (const [index, id] of questionIds.entries())
        await prisma.question.create({
            data: {
                id,
                deckId: prefix,
                question: 'Metric question ' + (index + 1),
                type: 'FREE_RESPONSE',
                correctAnswer: 'Reference',
            },
        })
    for (const [index, id] of courses.entries())
        await prisma.course.create({
            data: {
                id,
                title: 'Metric course ' + (index + 1),
                description: 'Synthetic',
                preReqs: [],
                decks: { connect: { id: prefix } },
            },
        })
    for (const [index, state] of [
        'passed',
        'failed',
        'pending',
        'progress',
        'otherCourse',
    ].entries()) {
        const player = state === 'otherCourse' ? other : learner
        const status =
            state === 'passed'
                ? 'TRUE'
                : state === 'pending'
                ? 'NEEDS_GRADED'
                : 'FALSE'
        const questionId =
            state === 'otherCourse' ? questionIds[1] : questionIds[0]
        const game = await prisma.gameSession.create({
            data: {
                userId: player,
                title: state,
                type: 'COURSE',
                isComplete: state !== 'progress',
                questions: { connect: { id: questionId } },
                ...(state !== 'progress'
                    ? {
                          answerHistory: {
                              create: {
                                  playerId: player,
                                  questionId,
                                  isCorrect: status,
                              },
                          },
                      }
                    : {}),
            },
        })
        await prisma.courseSession.create({
            data: {
                userId: player,
                gameSessionId: game.id,
                courseId: state === 'otherCourse' ? courses[1] : courses[0],
                isComplete: state !== 'progress',
                passed: state === 'passed',
            },
        })
    }
    for (const path of [
        '/api/metrics/questions/' + questionIds[0],
        '/api/metrics/question/' + questionIds[0],
        '/api/metrics/courses/' + courses[0],
    ]) {
        await request(path, { user: null, status: 401 })
        await request(path, { user: learner, status: 403 })
        await request(path, { method: 'POST', status: 405 })
    }
    await request('/metrics', { user: learner, status: 404 })
    await request('/metrics', { user: null, status: 404 })
    await request('/api/metrics/questions/' + Array(51).fill('x').join('/'), {
        status: 400,
    })
    const rows = await request(
        '/api/metrics/questions/' + questionIds.join('/')
    )
    assert.deepEqual(
        rows.map(({ correct, incorrect, pending }) => [
            correct,
            incorrect,
            pending,
        ]),
        [
            [1, 1, 1],
            [0, 1, 0],
            [0, 0, 0],
        ]
    )
    checks++
    const userRows = await request('/api/metrics/question/' + questionIds[0])
    assert.equal(userRows.length, 1)
    assert.equal(userRows[0].userId, learner)
    assert.equal(userRows[0].correct, 1)
    checks += 3
    const courseRows = await request(
        '/api/metrics/courses/' + courses.join('/')
    )
    assert.deepEqual(
        courseRows.map(({ passed, failed, pending, inProgress }) => [
            passed,
            failed,
            pending,
            inProgress,
        ]),
        [
            [1, 1, 1, 1],
            [0, 1, 0, 0],
        ]
    )
    checks++
    const graded = await request('/api/graded', { user: learner })
    assert.equal(graded.length, 2)
    assert(graded.every(answer => answer.playerId === learner))
    checks += 2
    await request('/api/graded', { user: null, status: 401 })
    await request('/api/graded', { method: 'POST', status: 405 })
    const feedback = {
        subject: 'Synthetic feedback',
        suggestion: 'A useful improvement',
        type: 'IMPROVEMENT',
        severity: 'MINIMUM',
    }
    await request('/api/userFeedback', { user: null, status: 401 })
    await request('/api/userFeedback', { method: 'DELETE', status: 405 })
    await request('/api/userFeedback', {
        user: learner,
        method: 'POST',
        body: { ...feedback, userId: other },
        status: 400,
    })
    await request('/api/userFeedback', {
        user: learner,
        method: 'POST',
        body: { ...feedback, subject: '' },
        status: 400,
    })
    const saved = await request('/api/userFeedback', {
        user: learner,
        method: 'POST',
        body: feedback,
        status: 201,
    })
    assert.equal(saved.userId, learner)
    checks++
    assert.equal(
        (await request('/api/userFeedback', { user: other })).length,
        0
    )
    checks++
    assert.equal(
        (await request('/api/userFeedback', { user: learner })).length,
        1
    )
    checks++
    browser = await chromium.launch({
        headless: true,
        ...(process.platform === 'darwin' ? { channel: 'chrome' } : {}),
    })
    for (const mobile of [false, true]) {
        const context = await browser.newContext({
            viewport: mobile
                ? { width: 390, height: 844 }
                : { width: 1280, height: 900 },
        })
        try {
            await context.addCookies([
                {
                    name: 'next-auth.session-token',
                    value: tokens.get(admin),
                    url: origin,
                    httpOnly: true,
                    sameSite: 'Lax',
                },
            ])
            const page = await context.newPage(),
                errors = []
            page.setDefaultTimeout(15000)
            page.on('pageerror', error => errors.push(error.message))
            await page.goto(origin + '/metrics')
            await page
                .getByText('Performance by Course', { exact: true })
                .click()
            await page.getByRole('combobox').click()
            await page.getByRole('combobox').fill('Metric course 1')
            await page
                .locator('.ant-select-item-option-content')
                .getByText('Metric course 1', { exact: true })
                .click()
            await page.getByRole('combobox').press('Escape')
            const row = page.getByRole('row').filter({
                has: page.getByRole('cell', {
                    name: 'Metric course 1',
                    exact: true,
                }),
            })
            await expect(row).toContainText('Metric course 1')
            await expect(row.getByRole('cell')).toHaveText([
                'Metric course 1',
                '1',
                '1',
                '1',
                '1',
            ])
            expect(
                await page.evaluate(
                    () => document.documentElement.scrollWidth <= innerWidth
                )
            ).toBe(true)
            await page.getByText('Stats by Question', { exact: true }).click()
            await page
                .getByRole('combobox', { name: 'Questions to report' })
                .click()
            await page
                .locator('.ant-select-item-option-content')
                .getByText('Metric question 1', { exact: true })
                .click()
            await page
                .getByRole('combobox', { name: 'Questions to report' })
                .press('Escape')
            await expect(
                page
                    .getByRole('row')
                    .filter({
                        has: page.getByRole('cell', {
                            name: 'Metric question 1',
                            exact: true,
                        }),
                    })
                    .getByRole('cell')
            ).toHaveText(['Metric question 1', '1', '1', '1'])
            await page
                .getByRole('heading', { name: 'Metrics', exact: true })
                .click()
            await page.mouse.move(0, 0)
            await expect(page.locator('.ant-select-dropdown:visible')).toHaveCount(0)
            if (process.env.PORTFOLIO_ARTIFACT_DIR) {
                await mkdir(process.env.PORTFOLIO_ARTIFACT_DIR, {
                    recursive: true,
                })
                await page.screenshot({
                    path: join(
                        process.env.PORTFOLIO_ARTIFACT_DIR,
                        'tracker-metrics-' +
                            (mobile ? 'mobile' : 'desktop') +
                            '.png'
                    ),
                    fullPage: true,
                })
            }
            await page.getByText('Leave feedback', { exact: false }).click()
            await page.getByLabel('Feedback Type').click()
            await page
                .locator('.ant-select-item-option-content')
                .getByText('IMPROVEMENT', { exact: true })
                .click()
            await page.getByLabel('Feedback Severity').click()
            await page
                .locator('.ant-select-item-option-content')
                .getByText('MINIMUM', { exact: true })
                .click()
            await page
                .getByPlaceholder('Subject', { exact: true })
                .fill('Browser feedback ' + mobile)
            await page
                .getByPlaceholder('Suggestion', { exact: true })
                .fill('A persistent synthetic suggestion')
            await page.route('**/api/userFeedback', route =>
                route.request().method() === 'POST'
                    ? route.fulfill({
                          status: 503,
                          contentType: 'application/json',
                          body: '{"error":"Unavailable"}',
                      })
                    : route.continue()
            )
            await page
                .getByRole('button', { name: 'Submit feedback', exact: true })
                .click()
            await expect(
                page.getByText(
                    'Could not save your feedback. Please try again.',
                    { exact: true }
                )
            ).toBeVisible()
            await expect(
                page.getByPlaceholder('Subject', { exact: true })
            ).toHaveValue('Browser feedback ' + mobile)
            await page.unroute('**/api/userFeedback')
            await page
                .getByRole('button', { name: 'Submit feedback', exact: true })
                .click()
            await expect(
                page.getByText('Feedback saved. Thank you.', { exact: true })
            ).toBeVisible()
            expect(
                await prisma.userFeedback.count({
                    where: {
                        userId: admin,
                        subject: 'Browser feedback ' + mobile,
                    },
                })
            ).toBe(1)
            expect(errors).toEqual([])
            console.log(
                'Passed metrics and feedback browser workflow:',
                mobile ? 'mobile' : 'desktop'
            )
        } finally {
            await context.close()
        }
    }
    console.log(
        `Passed ${checks} metrics/feedback checks: correct joins and counts, pending/in-progress separation, role checks, private feedback and validated author identity.`
    )
} finally {
    if (browser) await browser.close()
    await prisma.gameAnswer.deleteMany({ where: { playerId: { in: users } } })
    await prisma.courseSession.deleteMany({ where: { userId: { in: users } } })
    await prisma.gameSession.deleteMany({ where: { userId: { in: users } } })
    await prisma.course.deleteMany({ where: { id: { in: courses } } })
    await prisma.deck.deleteMany({ where: { id: prefix } })
    await prisma.userFeedback.deleteMany({ where: { userId: { in: users } } })
    await prisma.user.deleteMany({ where: { id: { in: users } } })
    await prisma.$disconnect()
}
