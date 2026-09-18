import { PrismaClient, Roles, QuestionType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { chromium, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
const origin = process.env.LOCAL_API_URL || 'http://127.0.0.1:5220'
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))
    throw new Error('Use only the disposable local server')
const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString:
            'postgresql://demo:local-demo-only@127.0.0.1:5197/tofu_tracker',
    }),
})
const prefix = 'learning-browser-' + randomUUID(),
    userId = prefix,
    deckId = prefix,
    token = randomUUID()
let browser
try {
    await prisma.user.create({
        data: {
            id: userId,
            name: 'Synthetic Learner',
            email: userId + '@example.invalid',
            role: Roles.USER,
            sessions: {
                create: {
                    sessionToken: token,
                    expires: new Date(Date.now() + 600000),
                },
            },
        },
    })
    await prisma.deck.create({
        data: { id: deckId, title: 'Browser practice', userId, tags: [] },
    })
    const question = await prisma.question.create({
        data: {
            deckId,
            question: 'A fictional true statement',
            type: QuestionType.TRUE_FALSE,
            correctAnswer: 'true',
            options: { create: [{ answer: 'true' }, { answer: 'false' }] },
        },
    })
    const free = await prisma.question.create({
        data: {
            deckId,
            question: 'Explain your reasoning',
            type: QuestionType.FREE_RESPONSE,
            correctAnswer: 'Reviewer guidance',
        },
    })
    await prisma.course.create({
        data: {
            id: prefix,
            title: 'Browser course',
            description: 'Synthetic',
            preReqs: [],
            percentToPass: 100,
            decks: { connect: { id: deckId } },
        },
    })
    await prisma.activity.create({
        data: {
            id: prefix,
            title: 'Browser activity',
            description: 'Synthetic',
            questionOrder: [question.id, free.id],
            questions: { connect: [{ id: question.id }, { id: free.id }] },
        },
    })
    browser = await chromium.launch({
        headless: true,
        ...(process.platform === 'darwin' ? { channel: 'chrome' } : {}),
    })
    for (const mobile of [false, true])
        for (const kind of ['free', 'activity', 'course']) {
            const context = await browser.newContext({
                viewport: mobile
                    ? { width: 390, height: 844 }
                    : { width: 1280, height: 900 },
            })
            try {
                await context.addCookies([
                    {
                        name: 'next-auth.session-token',
                        value: token,
                        url: origin,
                        httpOnly: true,
                        sameSite: 'Lax',
                    },
                ])
                const endpoint =
                    kind === 'free' ? '/api/games' : '/api/' + kind + 'Session'
                const response = await context.request.post(origin + endpoint, {
                    data:
                        kind === 'free'
                            ? {
                                  title: 'Practice workflow',
                                  questionIds: [question.id, free.id],
                              }
                            : { [kind + 'Id']: prefix },
                })
                expect(response.status()).toBe(201)
                const session = await response.json()
                const game = kind === 'free' ? session : session.gameSession
                const route =
                    kind === 'free'
                        ? '/play/game/'
                        : kind === 'activity'
                        ? '/play/activity/'
                        : '/play/study/session/'
                const completed =
                    kind === 'free'
                        ? 'Game Completed'
                        : kind === 'activity'
                        ? 'Activity Completed'
                        : 'Course Completed'
                const page = await context.newPage()
                page.setDefaultTimeout(15000)
                const errors = []
                page.on('pageerror', error => errors.push(error.message))
                await page.goto(origin + route + session.id)
                await page
                    .getByRole('radio', { name: 'false', exact: true })
                    .check()
                await page.route('**' + endpoint + '/' + session.id, route =>
                    route.request().method() === 'PUT'
                        ? route.fulfill({
                              status: 503,
                              contentType: 'application/json',
                              body: '{"error":"Unavailable"}',
                          })
                        : route.continue()
                )
                await page
                    .getByRole('button', { name: 'Confirm', exact: true })
                    .click()
                await expect(
                    page.getByText(
                        'Could not save your answer. Please try again.',
                        { exact: true }
                    )
                ).toBeVisible({ timeout: 15000 })
                await expect(
                    page.getByRole('radio', { name: 'false', exact: true })
                ).toBeEnabled()
                await page.unroute('**' + endpoint + '/' + session.id)
                await page
                    .getByRole('button', { name: 'Confirm', exact: true })
                    .click()
                await expect(
                    page.getByText('Incorrect answer!', { exact: true })
                ).toBeVisible({ timeout: 15000 })
                await page.reload()
                await expect(
                    page.getByRole('radio', { name: 'false', exact: true })
                ).toBeChecked()
                await page.getByRole('button', { name: /Advance$/ }).click()
                await page
                    .getByPlaceholder('Response...')
                    .fill('A persistent written answer for the reviewer.')
                await page
                    .getByRole('button', { name: 'Confirm', exact: true })
                    .click()
                await expect(
                    page.getByRole('button', { name: /See Results$/ })
                ).toBeVisible({ timeout: 15000 })
                await page.getByRole('button', { name: /See Results$/ }).click()
                await expect(page.getByText(completed, { exact: true }))
                    .toBeVisible({ timeout: 15000 })
                    .catch(async error => {
                        console.log(
                            'Visible page:',
                            (await page.locator('body').innerText()).slice(
                                0,
                                2500
                            )
                        )
                        console.log('Browser errors:', errors)
                        throw error
                    })
                await page.reload()
                await expect(
                    page.getByText(completed, { exact: true })
                ).toBeVisible({ timeout: 15000 })
                expect(
                    await page.evaluate(
                        () => document.documentElement.scrollWidth <= innerWidth
                    )
                ).toBe(true)
                expect(errors).toEqual([])
                const saved = await prisma.gameSession.findUniqueOrThrow({
                    where: { id: game.id },
                    include: { answerHistory: true },
                })
                expect(saved.isComplete).toBe(true)
                expect(saved.numberAnswered).toBe(2)
                expect(saved.numberCorrect).toBe(0)
                expect(
                    saved.answerHistory.filter(
                        a => a.isCorrect === 'NEEDS_GRADED'
                    )
                ).toHaveLength(1)
                console.log(
                    'Passed persisted learning workflow:',
                    kind,
                    mobile ? 'mobile' : 'desktop'
                )
            } finally {
                await context.close()
            }
        }
} finally {
    if (browser) await browser.close()
    const answers = await prisma.gameAnswer.findMany({
        where: { playerId: userId },
        select: { answerOptionId: true },
    })
    await prisma.gameAnswer.deleteMany({ where: { playerId: userId } })
    await prisma.activitySession.deleteMany({ where: { userId } })
    await prisma.courseSession.deleteMany({ where: { userId } })
    await prisma.gameSession.deleteMany({ where: { userId } })
    await prisma.answerOption.deleteMany({
        where: {
            questionId: null,
            id: {
                in: answers.flatMap(a =>
                    a.answerOptionId ? [a.answerOptionId] : []
                ),
            },
        },
    })
    await prisma.activity.deleteMany({ where: { id: prefix } })
    await prisma.course.deleteMany({ where: { id: prefix } })
    await prisma.deck.deleteMany({ where: { id: deckId } })
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
}
