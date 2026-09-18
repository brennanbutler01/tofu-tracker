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
const prefix = 'curriculum-' + randomUUID(),
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
                name: 'Synthetic Curriculum Tester',
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
    for (const path of [
        '/courses',
        '/activities',
        '/learningTracks',
        '/courses/edit/missing',
        '/activities/missing',
        '/learningTracks/edit/missing',
    ]) {
        await request(path, { user: null, status: 404 })
        await request(path, { user: learner, status: 404 })
    }
    for (const resource of ['courses', 'activities', 'learningTracks']) {
        await request('/api/' + resource, { user: null, status: 401 })
        await request('/api/' + resource, {
            user: learner,
            method: 'POST',
            body: {},
            status: 403,
        })
        await request('/api/' + resource, {
            method: 'POST',
            body: { ownerId: learner },
            status: 400,
        })
    }
    const deck = await request('/api/decks', {
        method: 'POST',
        body: { title: 'Curriculum source' },
        status: 201,
    })
    const editedDeck = await request('/api/decks/questions/' + deck.id, {
        method: 'PUT',
        body: {
            action: 'create',
            question: {
                question: 'This statement is true',
                type: 'TRUE_FALSE',
                correctAnswer: 'true',
            },
        },
    })
    const question = editedDeck.questions[0]
    const courseInput = {
        title: 'First curriculum course',
        description: 'Synthetic curriculum',
        percentToPass: 50,
        level: 'ALL',
        preReqs: [],
        deckIds: [deck.id],
    }
    const course = await request('/api/courses', {
        method: 'POST',
        body: courseInput,
        status: 201,
    })
    assert.equal(course.ownerId, admin)
    checks++
    const second = await request('/api/courses', {
        method: 'POST',
        body: {
            ...courseInput,
            title: 'Second curriculum course',
            preReqs: [course.id],
        },
        status: 201,
    })
    await request('/api/courses/' + course.id, {
        method: 'PUT',
        body: { preReqs: [second.id] },
        status: 409,
    })
    await request('/api/courses/' + course.id, {
        method: 'PUT',
        body: { preReqs: [course.id] },
        status: 409,
    })
    await request('/api/courses/' + course.id, {
        method: 'PUT',
        body: { decks: { deleteMany: {} } },
        status: 400,
    })
    await request('/api/courses/' + course.id, {
        method: 'DELETE',
        status: 409,
    })
    await request('/api/courseSession', {
        user: learner,
        method: 'POST',
        body: { courseId: second.id },
        status: 409,
    })
    const attempt = await request('/api/courseSession', {
        user: learner,
        method: 'POST',
        body: { courseId: course.id },
        status: 201,
    })
    await request('/api/courses/' + course.id, {
        method: 'PUT',
        body: { percentToPass: 100 },
    })
    const retained = await request('/api/courseSession/' + attempt.id, {
        user: learner,
    })
    assert.equal(retained.gameSession.passingThreshold, 50)
    checks++
    const future = await request('/api/courseSession', {
        user: learner,
        method: 'POST',
        body: { courseId: course.id },
        status: 201,
    })
    assert.equal(future.gameSession.passingThreshold, 100)
    checks++
    const activityInput = {
        title: 'Isolated activity',
        description: 'Synthetic curriculum',
        percentToPass: 50,
        displayOnMain: true,
        questionIds: [question.id],
    }
    const activity = await request('/api/activities', {
        method: 'POST',
        body: activityInput,
        status: 201,
    })
    assert.notEqual(activity.questions[0].id, question.id)
    assert.equal(activity.questions[0].deckId, null)
    const source = await prisma.question.findUniqueOrThrow({
        where: { id: question.id },
    })
    assert.equal(source.activityId, null)
    assert.equal(source.deckId, deck.id)
    checks += 4
    const otherActivity = await request('/api/activities', {
        method: 'POST',
        body: {
            ...activityInput,
            title: 'Another isolated activity',
            questionIds: [activity.questions[0].id],
        },
        status: 201,
    })
    assert.notEqual(otherActivity.questions[0].id, activity.questions[0].id)
    checks++
    const activityAttempt = await request('/api/activitySession', {
        user: learner,
        method: 'POST',
        body: { activityId: activity.id },
        status: 201,
    })
    await request('/api/activities/' + activity.id, {
        method: 'PUT',
        body: { questionIds: [], percentToPass: 100 },
    })
    const historical = await request(
        '/api/activitySession/' + activityAttempt.id,
        { user: learner }
    )
    assert.equal(historical.gameSession.questions.length, 1)
    assert.equal(historical.gameSession.passingThreshold, 50)
    assert.equal(
        (await request('/api/activities/' + otherActivity.id)).questions.length,
        1
    )
    checks += 3
    const track = await request('/api/learningTracks', {
        method: 'POST',
        body: {
            title: 'Ordered curriculum',
            description: 'Synthetic curriculum',
            courseIds: [course.id, second.id],
        },
        status: 201,
    })
    const reordered = await request('/api/learningTracks/' + track.id, {
        method: 'PUT',
        body: { courseIds: [second.id, course.id] },
    })
    assert.deepEqual(
        reordered.courseOrder.map(item => item.courseId),
        [second.id, course.id]
    )
    checks++
    await request('/api/learningTracks/' + track.id, {
        method: 'PUT',
        body: { courseIds: [course.id, course.id] },
        status: 400,
    })
    await request('/api/learningTracks/' + track.id, {
        method: 'PUT',
        body: { courseIds: ['missing'] },
        status: 404,
    })
    assert.deepEqual(
        (await request('/api/learningTracks/' + track.id)).courseOrder.map(
            item => item.courseId
        ),
        [second.id, course.id]
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
            for (const item of [
                {
                    route: '/courses/edit/',
                    api: 'courses',
                    id: course.id,
                    placeholder: 'Course Title',
                    button: 'Save course',
                    error: 'Could not save this course. Your entries are still here. Check its prerequisites and try again.',
                },
                {
                    route: '/activities/',
                    api: 'activities',
                    id: otherActivity.id,
                    placeholder: 'Activity Title',
                    button: 'Save activity',
                    error: 'Could not save this activity. Your entries are still here.',
                },
                {
                    route: '/learningTracks/edit/',
                    api: 'learningTracks',
                    id: track.id,
                    placeholder: 'Track Title',
                    button: 'Save learning track',
                    error: 'Could not save this learning track. Your entries are still here.',
                },
            ]) {
                console.log(
                    'Checking curriculum editor:',
                    item.api,
                    mobile ? 'mobile' : 'desktop'
                )
                await page.goto(origin + item.route + item.id)
                const title = 'Browser curriculum ' + item.api + ' ' + mobile
                await page
                    .getByPlaceholder(item.placeholder, { exact: true })
                    .fill(title)
                const pattern = '**/api/' + item.api + '/' + item.id
                await page.route(pattern, route =>
                    route.request().method() === 'PUT'
                        ? route.fulfill({
                              status: 503,
                              contentType: 'application/json',
                              body: '{"error":"Unavailable"}',
                          })
                        : route.continue()
                )
                await page
                    .getByRole('button', { name: item.button, exact: true })
                    .click()
                await expect(
                    page.getByText(item.error, { exact: true })
                ).toBeVisible()
                await expect(
                    page.getByPlaceholder(item.placeholder, { exact: true })
                ).toHaveValue(title)
                await expect(
                    page.getByRole('button', { name: item.button, exact: true })
                ).toBeEnabled()
                await page.unroute(pattern)
                const saved = page.waitForResponse(
                    response =>
                        response.url() ===
                            origin + '/api/' + item.api + '/' + item.id &&
                        response.request().method() === 'PUT'
                )
                await page
                    .getByRole('button', { name: item.button, exact: true })
                    .click()
                expect((await saved).status()).toBe(200)
                await page.reload()
                await expect(
                    page.getByPlaceholder(item.placeholder, { exact: true })
                ).toHaveValue(title)
                expect(
                    await page.evaluate(
                        () => document.documentElement.scrollWidth <= innerWidth
                    )
                ).toBe(true)
            }
            expect(errors).toEqual([])
            console.log(
                'Passed curriculum editing and failed-save recovery:',
                mobile ? 'mobile' : 'desktop'
            )
        } finally {
            await context.close()
        }
    }
    await request('/api/courses/' + second.id, { method: 'DELETE' })
    await request('/api/courses/' + course.id, { method: 'DELETE' })
    await request('/api/courseSession', {
        user: learner,
        method: 'POST',
        body: { courseId: course.id },
        status: 404,
    })
    const completed = await request('/api/courseSession/' + attempt.id, {
        user: learner,
        method: 'PUT',
        body: { action: 'answer', questionId: question.id, answer: 'true' },
    })
    assert.equal(completed.gameSession.numberCorrect, 1)
    checks++
    assert.equal(
        (await request('/api/learningTracks/' + track.id)).courseOrder.length,
        0
    )
    checks++
    for (const [resource, id, page] of [
        ['courses', course.id, '/courses/edit/'],
        ['activities', activity.id, '/activities/'],
        ['learningTracks', track.id, '/learningTracks/edit/'],
    ]) {
        if (resource !== 'courses')
            await request('/api/' + resource + '/' + id, { method: 'DELETE' })
        await request('/api/' + resource + '/' + id, { status: 404 })
        await request(page + id, { status: 404 })
        assert.equal(
            (await request('/api/' + resource)).some(item => item.id === id),
            false
        )
        checks++
    }
    console.log(
        `Passed ${checks} curriculum checks: permissions, prerequisites, isolated question copies, frozen thresholds, ordering, archive retention.`
    )
} finally {
    if (browser) await browser.close()
    await prisma.gameAnswer.deleteMany({ where: { playerId: { in: users } } })
    await prisma.activitySession.deleteMany({
        where: { userId: { in: users } },
    })
    await prisma.courseSession.deleteMany({ where: { userId: { in: users } } })
    await prisma.gameSession.deleteMany({ where: { userId: { in: users } } })
    await prisma.learningTrack.deleteMany({ where: { ownerId: admin } })
    await prisma.course.deleteMany({ where: { ownerId: admin } })
    await prisma.question.deleteMany({
        where: { Activity: { ownerId: admin } },
    })
    await prisma.activity.deleteMany({ where: { ownerId: admin } })
    await prisma.deck.deleteMany({ where: { userId: admin } })
    await prisma.user.deleteMany({ where: { id: { in: users } } })
    await prisma.$disconnect()
}
