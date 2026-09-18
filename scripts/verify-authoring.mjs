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
const prefix = 'author-' + randomUUID(),
    admin = prefix + '-admin',
    learner = prefix + '-learner',
    users = [admin, learner],
    tokens = new Map()
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
        `${method} ${path}: ${text.slice(0, 150)}`
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
                name: 'Synthetic Author',
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
    await request('/decks', { user: null, status: 404 })
    await request('/decks', { user: learner, status: 404 })
    await request('/play/free', { user: null, status: 307 })
    await request('/api/decks', { user: null, status: 401 })
    await request('/api/decks', {
        user: learner,
        method: 'POST',
        body: { title: 'Forbidden' },
        status: 403,
    })
    await request('/api/decks', {
        method: 'POST',
        body: { title: 'Injected owner', userId: learner },
        status: 400,
    })
    const deck = await request('/api/decks', {
        method: 'POST',
        body: { title: 'Versioned training', tags: ['Synthetic'] },
        status: 201,
    })
    const otherDeck = await request('/api/decks', {
        method: 'POST',
        body: { title: 'Separate deck' },
        status: 201,
    })
    assert.equal(deck.userId, admin)
    checks++
    await request('/decks/' + deck.id, { user: learner, status: 404 })
    await request('/api/decks/' + deck.id, {
        user: learner,
        method: 'PUT',
        body: { title: 'Changed' },
        status: 403,
    })
    await request('/api/decks/' + deck.id, {
        user: learner,
        method: 'DELETE',
        status: 403,
    })
    await request('/api/decks/' + deck.id, {
        method: 'PUT',
        body: { questions: { deleteMany: {} } },
        status: 400,
    })
    await request('/api/decks/' + deck.id, {
        method: 'PUT',
        body: { title: 'Renamed training', tags: ['Review'] },
    })
    const endpoint = '/api/decks/questions/' + deck.id
    const question = {
        question: 'Choose the first option',
        type: 'MULTIPLE_CHOICE',
        correctAnswer: 'First',
        options: ['First', 'Second', 'Third'],
    }
    await request(endpoint, {
        user: learner,
        method: 'PUT',
        body: { action: 'create', question },
        status: 403,
    })
    await request(endpoint, {
        method: 'PUT',
        body: { questions: { create: question } },
        status: 400,
    })
    await request(endpoint, {
        method: 'PUT',
        body: {
            action: 'create',
            question: { ...question, correctAnswer: 'Absent' },
        },
        status: 400,
    })
    await request(endpoint, {
        method: 'PUT',
        body: {
            action: 'create',
            question: { ...question, options: ['First', 'First'] },
        },
        status: 400,
    })
    let edited = await request(endpoint, {
        method: 'PUT',
        body: { action: 'create', question },
    })
    const original = edited.questions[0]
    await prisma.activity.create({
        data: {
            id: prefix,
            title: 'Versioned activity',
            description: 'Synthetic',
            questionOrder: [original.id],
            questions: { connect: { id: original.id } },
        },
    })
    const game = await request('/api/games', {
        user: learner,
        method: 'POST',
        body: {
            title: 'Original question snapshot',
            questionIds: [original.id],
        },
        status: 201,
    })
    await request('/api/decks/questions/' + otherDeck.id, {
        method: 'PUT',
        body: {
            action: 'edit',
            questionId: original.id,
            changes: { correctAnswer: 'Second' },
        },
        status: 404,
    })
    await request('/api/decks/questions/' + otherDeck.id + '/' + original.id, {
        method: 'DELETE',
        status: 404,
    })
    edited = await request(endpoint, {
        method: 'PUT',
        body: {
            action: 'edit',
            questionId: original.id,
            changes: { correctAnswer: 'Second' },
        },
    })
    const revised = edited.questions[0]
    assert.notEqual(revised.id, original.id)
    assert.equal(edited.questions.length, 1)
    assert.equal(
        (
            await prisma.question.findUniqueOrThrow({
                where: { id: original.id },
            })
        ).correctAnswer,
        'First'
    )
    assert.deepEqual(
        (await prisma.activity.findUniqueOrThrow({ where: { id: prefix } }))
            .questionOrder,
        [revised.id]
    )
    checks += 4
    const originalGame = await request('/api/games/' + game.id, {
        user: learner,
        method: 'PUT',
        body: { action: 'answer', questionId: original.id, answer: 'First' },
    })
    assert.equal(originalGame.numberCorrect, 1)
    checks++
    await request('/api/games/' + game.id, {
        user: learner,
        method: 'PUT',
        body: { action: 'advance' },
    })
    await request('/api/games', {
        user: learner,
        method: 'POST',
        body: { title: 'Old question', questionIds: [original.id] },
        status: 404,
    })
    await request(endpoint, {
        method: 'PUT',
        body: {
            action: 'edit',
            questionId: original.id,
            changes: { question: 'A stale browser edit' },
        },
        status: 404,
    })
    await request(endpoint, {
        method: 'PUT',
        body: {
            action: 'removeOptions',
            questionId: revised.id,
            optionIds: [
                revised.options.find(option => option.answer === 'Second').id,
            ],
        },
        status: 400,
    })
    await request(endpoint, {
        method: 'PUT',
        body: {
            action: 'removeOptions',
            questionId: revised.id,
            optionIds: ['not-this-question'],
        },
        status: 404,
    })
    edited = await request(endpoint, {
        method: 'PUT',
        body: {
            action: 'addOptions',
            questionId: revised.id,
            options: ['Fourth'],
        },
    })
    assert.equal(edited.questions[0].options.length, 4)
    checks++
    let current = edited.questions[0]
    edited = await request(endpoint, {
        method: 'PUT',
        body: {
            action: 'removeOptions',
            questionId: current.id,
            optionIds: [
                current.options.find(option => option.answer === 'Fourth').id,
            ],
        },
    })
    current = edited.questions[0]
    const results = await Promise.all(
        [0, 1].map(index =>
            fetch(origin + endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: 'next-auth.session-token=' + tokens.get(admin),
                },
                body: JSON.stringify({
                    action: 'edit',
                    questionId: current.id,
                    changes: {
                        question: 'Concurrent revised question ' + index,
                    },
                }),
            })
        )
    )
    assert.deepEqual(
        results.map(response => response.status).sort(),
        [200, 404]
    )
    checks++
    for (const response of results) await response.text()
    const listed = await request('/api/decks')
    assert.equal(listed.find(item => item.id === deck.id)._count.questions, 1)
    checks++
    current = (await request(endpoint)).questions[0]
    const pendingGame = await request('/api/games', {
        user: learner,
        method: 'POST',
        body: { title: 'Retained on archive', questionIds: [current.id] },
        status: 201,
    })
    await request('/api/decks/' + deck.id, { method: 'DELETE' })
    await request('/api/decks/' + deck.id, { status: 404 })
    await request(endpoint, {
        method: 'PUT',
        body: { action: 'create', question },
        status: 404,
    })
    assert.equal(
        (await request('/api/decks/game')).some(item => item.id === deck.id),
        false
    )
    checks++
    const archivedGame = await request('/api/games/' + pendingGame.id, {
        user: learner,
        method: 'PUT',
        body: { action: 'answer', questionId: current.id, answer: 'Second' },
    })
    assert.equal(archivedGame.numberCorrect, 1)
    checks++
    await request('/api/questions', {
        user: learner,
        method: 'POST',
        body: {},
        status: 403,
    })
    await request('/api/questions/' + otherDeck.id, {
        method: 'DELETE',
        status: 405,
    })
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
            await page.goto(origin + '/decks')
            await page
                .getByRole('tab', { name: 'Create Deck', exact: true })
                .click()
            const title = 'Browser authored deck ' + mobile
            await page.getByPlaceholder('Deck Title').fill(title)
            const creation = page.waitForResponse(
                response =>
                    response.url() === origin + '/api/decks' &&
                    response.request().method() === 'POST'
            )
            await page.getByRole('button', { name: /^Create$/ }).click()
            const response = await creation
            expect(response.status()).toBe(201)
            const saved = await response.json()
            await page
                .getByText('Click to add questions or edit deck ' + title, {
                    exact: true,
                })
                .click()
            await expect(page).toHaveURL(origin + '/decks/' + saved.id)
            await page
                .getByRole('tab', { name: 'Create Question', exact: true })
                .click()
            await page
                .getByPlaceholder('Question', { exact: true })
                .fill('A synthetic statement to test')
            const url = '**/api/decks/questions/' + saved.id
            await page.route(url, route =>
                route.request().method() === 'PUT'
                    ? route.fulfill({
                          status: 503,
                          contentType: 'application/json',
                          body: '{"error":"Unavailable"}',
                      })
                    : route.continue()
            )
            await page
                .getByRole('button', { name: 'Create question', exact: true })
                .click()
            await expect(
                page.getByText(
                    'Could not save the question. Check its answer choices and try again.',
                    { exact: true }
                )
            ).toBeVisible()
            await expect(
                page.getByPlaceholder('Question', { exact: true })
            ).toHaveValue('A synthetic statement to test')
            await page.unroute(url)
            await page
                .getByRole('button', { name: 'Create question', exact: true })
                .click()
            await expect(
                page.getByPlaceholder('Question', { exact: true })
            ).toHaveValue('')
            await page
                .getByRole('tab', { name: 'Questions', exact: true })
                .click()
            await expect(
                page
                    .getByText('A synthetic statement to test', { exact: true })
                    .first()
            ).toBeVisible()
            await page.reload()
            await expect(
                page
                    .getByText('A synthetic statement to test', { exact: true })
                    .first()
            ).toBeVisible()
            expect(
                await page.evaluate(
                    () => document.documentElement.scrollWidth <= innerWidth
                )
            ).toBe(true)
            if (process.env.PORTFOLIO_ARTIFACT_DIR) {
                await mkdir(process.env.PORTFOLIO_ARTIFACT_DIR, {
                    recursive: true,
                })
                await page.screenshot({
                    path: join(
                        process.env.PORTFOLIO_ARTIFACT_DIR,
                        'tracker-authoring-' +
                            (mobile ? 'mobile' : 'desktop') +
                            '.png'
                    ),
                    fullPage: true,
                })
            }
            await page
                .getByRole('tab', { name: 'Edit Deck', exact: true })
                .click()
            await page.getByPlaceholder('Deck Title').fill(title + ' revised')
            await page.getByRole('button', { name: /^Confirm$/ }).click()
            await expect(
                page.getByText('Deck saved.', { exact: true })
            ).toBeVisible()
            expect(
                (
                    await prisma.deck.findUniqueOrThrow({
                        where: { id: saved.id },
                    })
                ).title
            ).toBe(title + ' revised')
            expect(
                await prisma.question.count({
                    where: { deckId: saved.id, archived: false },
                })
            ).toBe(1)
            expect(
                await page.evaluate(
                    () => document.documentElement.scrollWidth <= innerWidth
                )
            ).toBe(true)
            expect(errors).toEqual([])
            console.log(
                'Passed deck/question authoring browser workflow:',
                mobile ? 'mobile' : 'desktop'
            )
        } finally {
            await context.close()
        }
    }
    console.log(
        `Passed ${checks} authoring checks: roles, validated commands, immutable versions, concurrent edits, correct options, archive retention and active counts.`
    )
} finally {
    if (browser) await browser.close()
    const answers = await prisma.gameAnswer.findMany({
        where: { playerId: { in: users } },
        select: { answerOptionId: true },
    })
    await prisma.gameAnswer.deleteMany({ where: { playerId: { in: users } } })
    await prisma.gameSession.deleteMany({ where: { userId: { in: users } } })
    await prisma.question.updateMany({
        where: { activityId: prefix },
        data: { activityId: null },
    })
    await prisma.activity.deleteMany({ where: { id: prefix } })
    await prisma.answerOption.deleteMany({
        where: {
            questionId: null,
            id: {
                in: answers.flatMap(answer =>
                    answer.answerOptionId ? [answer.answerOptionId] : []
                ),
            },
        },
    })
    await prisma.deck.deleteMany({ where: { userId: { in: users } } })
    await prisma.user.deleteMany({ where: { id: { in: users } } })
    await prisma.$disconnect()
}
