import { PrismaClient, Roles, QuestionType } from '@prisma/client'
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
const prefix = 'grading-' + randomUUID(),
    learner = prefix + '-learner',
    reviewer = prefix + '-reviewer',
    other = prefix + '-other'
const users = [learner, reviewer, other],
    tokens = new Map()
let checks = 0,
    browser
async function request(
    path,
    { user = reviewer, method = 'GET', body, status = 200 } = {}
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
        `${method} ${path}: ${text.slice(0, 150)}`
    )
    checks++
    try {
        return JSON.parse(text)
    } catch {
        return null
    }
}
async function complete(kind) {
    const endpoint = '/api/' + kind + 'Session'
    const session = await request(endpoint, {
        user: learner,
        method: 'POST',
        body: { [kind + 'Id']: prefix },
        status: 201,
    })
    let result
    for (const question of session.gameSession.questions) {
        await request(endpoint + '/' + session.id, {
            user: learner,
            method: 'PUT',
            body: {
                action: 'answer',
                questionId: question.id,
                answer:
                    question.type === 'TRUE_FALSE'
                        ? 'true'
                        : 'A synthetic written explanation',
            },
        })
        result = await request(endpoint + '/' + session.id, {
            user: learner,
            method: 'PUT',
            body: { action: 'advance' },
        })
    }
    assert.equal(result.isComplete, true)
    assert.equal(
        result.passed,
        false,
        'Pending review blocks passing even at the 50 percent threshold'
    )
    checks += 2
    return {
        session: result,
        answer: result.gameSession.answerHistory.find(
            answer => answer.isCorrect === 'NEEDS_GRADED'
        ),
    }
}
try {
    for (const id of users) {
        const token = randomUUID()
        tokens.set(id, token)
        await prisma.user.create({
            data: {
                id,
                name: 'Synthetic Reviewer',
                email: id + '@example.invalid',
                role: id === learner ? Roles.USER : Roles.ADMIN,
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
            title: 'Review fixture',
            userId: learner,
            tags: [],
        },
    })
    const boolean = await prisma.question.create({
        data: {
            deckId: prefix,
            question: 'Synthetic true statement',
            type: QuestionType.TRUE_FALSE,
            correctAnswer: 'true',
        },
    })
    const free = await prisma.question.create({
        data: {
            deckId: prefix,
            question: 'Explain a fictional policy',
            type: QuestionType.FREE_RESPONSE,
            correctAnswer: 'Reviewer guidance',
        },
    })
    await prisma.course.create({
        data: {
            id: prefix,
            title: 'Review course',
            description: 'Synthetic',
            preReqs: [],
            percentToPass: 50,
            decks: { connect: { id: prefix } },
        },
    })
    await prisma.activity.create({
        data: {
            id: prefix,
            title: 'Review activity',
            description: 'Synthetic',
            percentToPass: 50,
            questionOrder: [boolean.id, free.id],
            questions: { connect: [{ id: boolean.id }, { id: free.id }] },
        },
    })
    await request('/api/toGrade', { user: null, status: 401 })
    await request('/api/toGrade', { user: learner, status: 403 })
    await request('/api/toGrade', { method: 'POST', status: 405 })
    await request('/api/toGrade/session', { user: learner, status: 403 })
    for (const kind of ['activity', 'course']) {
        const { session, answer } = await complete(kind)
        await request('/api/toGrade/session', {
            method: 'POST',
            body: { answerIds: [answer.id], gradedById: other },
            status: 400,
        })
        const raced = await Promise.all(
            [reviewer, other].map(user =>
                fetch(origin + '/api/toGrade/session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Cookie: 'next-auth.session-token=' + tokens.get(user),
                    },
                    body: JSON.stringify({ answerIds: [answer.id] }),
                })
            )
        )
        assert.deepEqual(raced.map(r => r.status).sort(), [201, 409])
        checks++
        const winnerIndex = raced.findIndex(r => r.status === 201)
        const review = await raced[winnerIndex].json()
        await raced[1 - winnerIndex].text()
        const owner = [reviewer, other][winnerIndex],
            stranger = [reviewer, other][1 - winnerIndex]
        const endpoint = '/api/toGrade/session/' + review.id
        await request(endpoint, { user: stranger, status: 404 })
        await request('/admin/grade/' + review.id, {
            user: stranger,
            status: 404,
        })
        await request(endpoint, {
            user: stranger,
            method: 'PUT',
            body: { action: 'advance' },
            status: 404,
        })
        await request(endpoint, {
            user: owner,
            method: 'PUT',
            body: {
                answersToGrade: {
                    update: {
                        where: { id: answer.id },
                        data: { playerId: other },
                    },
                },
            },
            status: 400,
        })
        await request(endpoint, {
            user: owner,
            method: 'PUT',
            body: { action: 'advance' },
            status: 409,
        })
        await request(endpoint, {
            user: owner,
            method: 'PUT',
            body: {
                action: 'grade',
                answerId: 'not-current',
                isCorrect: 'TRUE',
            },
            status: 409,
        })
        await request(endpoint, {
            user: owner,
            method: 'PUT',
            body: { action: 'grade', answerId: answer.id, isCorrect: 'TRUE' },
        })
        let result = await request('/api/' + kind + 'Session/' + session.id, {
            user: learner,
        })
        assert.equal(result.gameSession.numberCorrect, 2)
        assert.equal(result.passed, true)
        checks += 2
        const critique = await request(endpoint, {
            user: owner,
            method: 'PUT',
            body: {
                action: 'critique',
                answerId: answer.id,
                text: 'Clear reasoning.',
            },
        })
        assert.equal(critique.answersToGrade[0].critique.gradedById, owner)
        checks++
        await request(endpoint, {
            user: owner,
            method: 'PUT',
            body: {
                action: 'critique',
                answerId: answer.id,
                text: 'Updated feedback.',
            },
        })
        await request(endpoint, {
            user: owner,
            method: 'PUT',
            body: {
                action: 'resource',
                answerId: answer.id,
                title: 'Unsafe',
                location: 'javascript:alert(1)',
            },
            status: 400,
        })
        await request(endpoint, {
            user: owner,
            method: 'PUT',
            body: {
                action: 'resource',
                answerId: answer.id,
                title: 'Guide',
                location: 'https://example.com/guide',
            },
        })
        await prisma[kind].update({
            where: { id: prefix },
            data: { percentToPass: 100 },
        })
        await request(endpoint, {
            user: owner,
            method: 'PUT',
            body: { action: 'grade', answerId: answer.id, isCorrect: 'FALSE' },
        })
        result = await request('/api/' + kind + 'Session/' + session.id, {
            user: learner,
        })
        assert.equal(result.gameSession.numberCorrect, 1)
        assert.equal(result.gameSession.passingThreshold, 50)
        assert.equal(
            result.passed,
            true,
            'Editing the course must not change an existing attempt’s threshold'
        )
        checks += 3
        const done = await request(endpoint, {
            user: owner,
            method: 'PUT',
            body: { action: 'advance' },
        })
        assert.equal(done.isComplete, true)
        checks++
        await request(endpoint, {
            user: owner,
            method: 'PUT',
            body: { action: 'grade', answerId: answer.id, isCorrect: 'TRUE' },
            status: 409,
        })
    }
    browser = await chromium.launch({
        headless: true,
        ...(process.platform === 'darwin' ? { channel: 'chrome' } : {}),
    })
    for (const mobile of [false, true]) {
        const { session, answer } = await complete('course')
        const review = await request('/api/toGrade/session', {
            method: 'POST',
            body: { answerIds: [answer.id] },
            status: 201,
        })
        const context = await browser.newContext({
            viewport: mobile
                ? { width: 390, height: 844 }
                : { width: 1280, height: 900 },
        })
        try {
            await context.addCookies([
                {
                    name: 'next-auth.session-token',
                    value: tokens.get(reviewer),
                    url: origin,
                    httpOnly: true,
                    sameSite: 'Lax',
                },
            ])
            const page = await context.newPage(),
                errors = []
            page.setDefaultTimeout(15000)
            page.on('pageerror', error => errors.push(error.message))
            await page.goto(origin + '/admin')
            await page
                .getByRole('link', { name: /^Resume review:/ })
                .filter({ hasText: 'Explain a fictional policy' })
                .click()
            await expect(page).toHaveURL(origin + '/admin/grade/' + review.id)
            await page
                .getByRole('radio', { name: 'Correct', exact: true })
                .check()
            await page.getByRole('button', { name: /Grade$/ }).click()
            await expect(
                page.getByRole('button', { name: /Edit Grade$/ })
            ).toBeVisible()
            await page.getByRole('button', { name: /Advance$/ }).click()
            await page
                .getByPlaceholder('Critique')
                .fill('This explanation covers the important steps.')
            await page.getByRole('button', { name: /Add Critique$/ }).click()
            await expect(
                page.getByRole('button', { name: /Edit Critique$/ })
            ).toBeVisible()
            await page.getByRole('button', { name: /Advance$/ }).click()
            await page.getByText('Add Resource', { exact: true }).click()
            await page
                .getByPlaceholder('Resource Title')
                .fill('Reference guide')
            await page
                .getByPlaceholder('Resource url')
                .fill('https://example.com/reference')
            await page
                .getByPlaceholder('Resource Description')
                .fill('Follow-up reading')
            const endpoint = '**/api/toGrade/session/' + review.id
            await page.route(endpoint, route =>
                route.request().method() === 'PUT'
                    ? route.fulfill({
                          status: 503,
                          contentType: 'application/json',
                          body: '{"error":"Unavailable"}',
                      })
                    : route.continue()
            )
            await page
                .getByRole('button', { name: 'Create resource', exact: true })
                .click()
            await expect(
                page.getByText(
                    'Could not save the review. Your changes are still here. Please try again.',
                    { exact: true }
                )
            ).toBeVisible()
            await expect(page.getByPlaceholder('Resource Title')).toHaveValue(
                'Reference guide'
            )
            await page.unroute(endpoint)
            await page
                .getByRole('button', { name: 'Create resource', exact: true })
                .click()
            await expect(page.getByPlaceholder('Resource Title')).toHaveValue(
                ''
            )
            await expect(
                page.getByRole('link', { name: 'Reference guide', exact: true })
            ).toHaveAttribute('href', 'https://example.com/reference')
            await page.getByRole('button', { name: /Advance$/ }).click()
            await page.getByRole('button', { name: 'Yes', exact: true }).click()
            await expect(
                page.getByText('Grading Session finished.', { exact: true })
            ).toBeVisible()
            await page.reload()
            await expect(
                page.getByText('Grading Session finished.', { exact: true })
            ).toBeVisible()
            expect(
                await page.evaluate(
                    () => document.documentElement.scrollWidth <= innerWidth
                )
            ).toBe(true)
            expect(errors).toEqual([])
            const saved = await prisma.gradingSession.findUniqueOrThrow({
                where: { id: review.id },
                include: {
                    answersToGrade: {
                        include: { critique: { include: { resources: true } } },
                    },
                },
            })
            expect(saved.answersToGrade[0].critique.resources).toHaveLength(1)
            expect(
                (
                    await prisma.courseSession.findUniqueOrThrow({
                        where: { id: session.id },
                    })
                ).passed
            ).toBe(true)
            console.log(
                'Passed reviewer browser workflow:',
                mobile ? 'mobile' : 'desktop'
            )
        } finally {
            await context.close()
        }
    }
    console.log(
        `Passed ${checks} grading checks: roles, ownership, claim races, safe commands, recalculated results, feedback and resources.`
    )
} finally {
    if (browser) await browser.close()
    const answers = await prisma.gameAnswer.findMany({
        where: { playerId: learner },
    })
    const critiques = answers.flatMap(a => (a.critiqueId ? [a.critiqueId] : []))
    await prisma.gameAnswer.deleteMany({ where: { playerId: learner } })
    await prisma.critiqueResource.deleteMany({
        where: { critiqueId: { in: critiques } },
    })
    await prisma.gradingCritique.deleteMany({
        where: { id: { in: critiques } },
    })
    await prisma.gradingSession.deleteMany({
        where: { gradedById: { in: users } },
    })
    await prisma.activitySession.deleteMany({ where: { userId: learner } })
    await prisma.courseSession.deleteMany({ where: { userId: learner } })
    await prisma.gameSession.deleteMany({ where: { userId: learner } })
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
    await prisma.deck.deleteMany({ where: { id: prefix } })
    await prisma.user.deleteMany({ where: { id: { in: users } } })
    await prisma.$disconnect()
}
