import { PrismaPg } from '@prisma/adapter-pg'
import { chromium, expect } from '@playwright/test'
import {
    PrismaClient,
    Roles,
    CorrectStatus,
    QuestionType,
    GameTypes,
} from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { mkdir } from 'node:fs/promises'

// This verifier only connects to the disposable loopback database and server.
const origin = 'http://127.0.0.1:5196'
const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString:
            'postgresql://demo:local-demo-only@127.0.0.1:5197/tofu_tracker',
    }),
})
const prefix = `browser-${randomUUID()}`
const learner = `${prefix}-learner`
const other = `${prefix}-other`
const token = randomUUID()
let browser
try {
    await prisma.user.create({
        data: {
            id: learner,
            name: 'Synthetic Learner',
            email: `${learner}@example.test`,
            role: Roles.USER,
            sessions: {
                create: {
                    sessionToken: token,
                    expires: new Date(Date.now() + 3600000),
                },
            },
        },
    })
    await prisma.user.create({
        data: {
            id: other,
            name: 'Other Learner',
            email: `${other}@example.test`,
        },
    })
    await prisma.question.create({
        data: {
            id: prefix,
            question: 'Synthetic question',
            type: QuestionType.TRUE_FALSE,
            correctAnswer: 'true',
        },
    })
    await prisma.gameAnswer.createMany({
        data: [
            CorrectStatus.TRUE,
            CorrectStatus.TRUE,
            CorrectStatus.FALSE,
            CorrectStatus.NEEDS_GRADED,
        ].map(isCorrect => ({
            playerId: learner,
            questionId: prefix,
            isCorrect,
        })),
    })
    for (const [suffix, userId, passed] of [
        ['passed', learner, true],
        ['failed', learner, false],
        ['other', other, true],
    ]) {
        const id = `${prefix}-${suffix}`
        await prisma.course.create({
            data: {
                id,
                title: suffix,
                description: 'Synthetic verification fixture',
                preReqs: [],
            },
        })
        await prisma.gameSession.create({
            data: {
                id,
                userId,
                type: GameTypes.COURSE,
                title: suffix,
                CourseSession: {
                    create: { courseId: id, userId, isComplete: true, passed },
                },
            },
        })
    }
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    const errors = []
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(origin)
    await expect(page.locator('body')).not.toContainText('Application error')
    await page.goto(`${origin}/profile`)
    await expect(page).toHaveURL(/\/auth\/signin/)
    await context.addCookies([
        {
            name: 'next-auth.session-token',
            value: token,
            url: origin,
            httpOnly: true,
            sameSite: 'Lax',
        },
    ])
    await page.goto(`${origin}/profile`)
    await expect(
        page.getByRole('heading', { name: 'Profile', exact: true })
    ).toBeVisible()
    await page.getByText('Stats', { exact: true }).click()
    for (const [label, value] of [
        ['Questions Correct', '2'],
        ['Questions Incorrect', '1'],
        ['Questions Need Graded', '1'],
        ['Courses Passed', '1'],
    ]) {
        await expect(
            page
                .locator('.ant-statistic')
                .filter({ has: page.getByText(label, { exact: true }) })
                .locator('.ant-statistic-content')
        ).toHaveText(value)
    }
    await page.getByRole('switch').click()
    await expect(page.getByLabel('Email', { exact: true })).toBeDisabled()
    await page
        .getByLabel('Name', { exact: true })
        .fill('Updated Synthetic Learner')
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    await expect(page.getByRole('switch')).toHaveAttribute(
        'aria-checked',
        'false'
    )
    await page.reload()
    await page.getByRole('switch').click()
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue(
        'Updated Synthetic Learner'
    )
    const response = await page.goto(`${origin}/admin`)
    expect(response.status()).toBe(404)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${origin}/profile`)
    await expect(
        page.getByRole('heading', { name: 'Profile', exact: true })
    ).toBeVisible()
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth
        )
    ).toBe(true)
    await mkdir('test-results', { recursive: true })
    await page.screenshot({
        path: 'test-results/profile-mobile.png',
        fullPage: true,
    })
    expect(errors).toEqual([])
    console.log(
        'Browser checks passed: sign-in gate, accurate personal statistics, profile persistence, read-only email, admin denial, mobile layout, and no uncaught page errors.'
    )
} finally {
    if (browser) await browser.close()
    await prisma.gameAnswer.deleteMany({ where: { questionId: prefix } })
    await prisma.courseSession.deleteMany({
        where: { courseId: { startsWith: prefix } },
    })
    await prisma.gameSession.deleteMany({
        where: { id: { startsWith: prefix } },
    })
    await prisma.course.deleteMany({ where: { id: { startsWith: prefix } } })
    await prisma.question.deleteMany({ where: { id: prefix } })
    await prisma.user.deleteMany({ where: { id: { in: [learner, other] } } })
    await prisma.$disconnect()
}
