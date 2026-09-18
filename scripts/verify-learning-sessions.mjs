import { PrismaClient, Roles, QuestionType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { randomUUID } from 'node:crypto'
import assert from 'node:assert/strict'
const database = 'postgresql://demo:local-demo-only@127.0.0.1:5197/tofu_tracker'
const origin = process.env.LOCAL_API_URL || 'http://127.0.0.1:5220'
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))
    throw new Error('Only the disposable local server may be tested')
const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: database }),
})
const prefix = 'sessions-' + randomUUID()
const owner = prefix + '-owner',
    other = prefix + '-other',
    deckId = prefix + '-deck',
    courseId = prefix + '-course',
    activityId = prefix + '-activity'
const tokens = new Map()
let checks = 0
async function request(
    path,
    { user = owner, method = 'GET', body, status = 200 } = {}
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
    let data
    try {
        data = JSON.parse(text)
    } catch {
        data = null
    }
    assert.equal(
        response.status,
        status,
        `${method} ${path}: ${text.slice(0, 150)}`
    )
    checks++
    return data
}
try {
    for (const id of [owner, other]) {
        const token = randomUUID()
        tokens.set(id, token)
        await prisma.user.create({
            data: {
                id,
                email: id + '@example.invalid',
                role: Roles.USER,
                sessions: {
                    create: {
                        sessionToken: token,
                        expires: new Date(Date.now() + 600000),
                    },
                },
            },
        })
    }
    await prisma.deck.create({
        data: {
            id: deckId,
            title: 'Synthetic training',
            userId: owner,
            tags: [],
        },
    })
    const boolean = await prisma.question.create({
        data: {
            id: prefix + '-boolean',
            deckId,
            question: 'Synthetic true statement',
            type: QuestionType.TRUE_FALSE,
            correctAnswer: 'true',
        },
    })
    const free = await prisma.question.create({
        data: {
            id: prefix + '-free',
            deckId,
            question: 'Explain a synthetic policy',
            type: QuestionType.FREE_RESPONSE,
            correctAnswer: 'For reviewer reference',
        },
    })
    await prisma.course.create({
        data: {
            id: courseId,
            title: 'Synthetic course',
            description: 'Test fixture',
            preReqs: [],
            percentToPass: 100,
            decks: { connect: { id: deckId } },
        },
    })
    await prisma.activity.create({
        data: {
            id: activityId,
            title: 'Synthetic activity',
            description: 'Test fixture',
            questionOrder: [boolean.id],
            questions: { connect: { id: boolean.id } },
            percentToPass: 100,
        },
    })
    await request('/api/games', { user: null, status: 401 })
    await request('/api/games', {
        method: 'POST',
        body: { title: 'Injection', questionIds: [boolean.id], userId: other },
        status: 400,
    })
    const game = await request('/api/games', {
        method: 'POST',
        body: { title: 'Free practice', questionIds: [free.id, boolean.id] },
        status: 201,
    })
    assert.deepEqual(
        game.questions.map(q => q.id),
        [free.id, boolean.id]
    )
    checks++
    await request('/api/games/' + game.id, { user: other, status: 404 })
    await request('/api/games/unfinished/' + game.id, {
        user: other,
        method: 'DELETE',
        status: 404,
    })
    await request('/api/games/' + game.id, {
        user: other,
        method: 'PUT',
        body: { action: 'advance' },
        status: 404,
    })
    await request('/play/game/' + game.id, { user: other, status: 404 })
    await request('/play/game/review/' + game.id, { user: other, status: 404 })
    await request('/play/game/' + game.id, { user: null, status: 307 })
    await request('/api/games/' + game.id, {
        method: 'PUT',
        body: { numberCorrect: 100, isComplete: true },
        status: 400,
    })
    await request('/api/games/' + game.id, {
        method: 'PUT',
        body: { action: 'advance' },
        status: 409,
    })
    await request('/api/games/' + game.id, {
        method: 'PUT',
        body: { action: 'answer', questionId: boolean.id, answer: 'true' },
        status: 409,
    })
    let updated = await request('/api/games/' + game.id, {
        method: 'PUT',
        body: {
            action: 'answer',
            questionId: free.id,
            answer: 'A response needing human review',
        },
    })
    assert.equal(updated.numberCorrect, 0)
    assert.equal(updated.answerHistory[0].isCorrect, 'NEEDS_GRADED')
    checks += 2
    await request('/api/games/' + game.id, {
        method: 'PUT',
        body: { action: 'advance' },
    })
    const responses = await Promise.all(
        [0, 1].map(() =>
            fetch(origin + '/api/games/' + game.id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: 'next-auth.session-token=' + tokens.get(owner),
                },
                body: JSON.stringify({
                    action: 'answer',
                    questionId: boolean.id,
                    answer: 'true',
                }),
            })
        )
    )
    assert.deepEqual(responses.map(r => r.status).sort(), [200, 409])
    for (const response of responses) await response.text()
    checks++
    updated = await request('/api/games/' + game.id)
    assert.equal(updated.numberAnswered, 2)
    assert.equal(updated.numberCorrect, 1)
    assert.equal(updated.answerHistory.length, 2)
    checks += 3
    updated = await request('/api/games/' + game.id, {
        method: 'PUT',
        body: { action: 'advance' },
    })
    assert.equal(updated.isComplete, true)
    checks++
    await request('/api/games/unfinished/' + game.id, {
        method: 'DELETE',
        status: 404,
    })
    await request('/api/games/' + game.id, {
        method: 'PUT',
        body: { action: 'answer', questionId: boolean.id, answer: 'true' },
        status: 409,
    })
    for (const [kind, contentId, page] of [
        ['activity', activityId, '/play/activity/'],
        ['course', courseId, '/play/study/session/'],
    ]) {
        const endpoint = '/api/' + kind + 'Session'
        await request(endpoint, {
            method: 'POST',
            body: { [kind + 'Id']: contentId, passed: true },
            status: 400,
        })
        const session = await request(endpoint, {
            method: 'POST',
            body: { [kind + 'Id']: contentId },
            status: 201,
        })
        await request(endpoint + '/' + session.id, { user: other, status: 404 })
        await request(endpoint + '/' + session.id, {
            user: other,
            method: 'PUT',
            body: { action: 'advance' },
            status: 404,
        })
        await request(page + session.id, { user: other, status: 404 })
        await request(endpoint + '/' + session.id, {
            method: 'PUT',
            body: {
                passed: true,
                gameSession: { update: { numberCorrect: 999 } },
            },
            status: 400,
        })
        for (const question of session.gameSession.questions) {
            await request(endpoint + '/' + session.id, {
                method: 'PUT',
                body: {
                    action: 'answer',
                    questionId: question.id,
                    answer:
                        question.type === 'TRUE_FALSE'
                            ? 'true'
                            : 'A written explanation',
                },
            })
            updated = await request(endpoint + '/' + session.id, {
                method: 'PUT',
                body: { action: 'advance' },
            })
        }
        assert.equal(updated.isComplete, true)
        assert.equal(updated.passed, kind === 'activity')
        checks += 2
    }
    const disposable = await request('/api/games', {
        method: 'POST',
        body: { title: 'Discard me', questionIds: [boolean.id] },
        status: 201,
    })
    await request('/api/games/unfinished/' + disposable.id, {
        method: 'DELETE',
    })
    assert.equal(
        await prisma.gameSession.findUnique({ where: { id: disposable.id } }),
        null
    )
    checks++
    console.log(
        `Passed ${checks} learning-session checks: owner isolation, rendered access, validated commands, authoritative scores, answer ordering, concurrent retries, course/activity completion.`
    )
} finally {
    const games = await prisma.gameSession.findMany({
        where: { userId: { in: [owner, other] } },
        select: { id: true },
    })
    const answers = await prisma.gameAnswer.findMany({
        where: { playerId: { in: [owner, other] } },
        select: { answerOptionId: true },
    })
    await prisma.gameAnswer.deleteMany({
        where: { playerId: { in: [owner, other] } },
    })
    await prisma.activitySession.deleteMany({
        where: { userId: { in: [owner, other] } },
    })
    await prisma.courseSession.deleteMany({
        where: { userId: { in: [owner, other] } },
    })
    await prisma.gameSession.deleteMany({
        where: { id: { in: games.map(g => g.id) } },
    })
    await prisma.answerOption.deleteMany({
        where: {
            id: {
                in: answers.flatMap(a =>
                    a.answerOptionId ? [a.answerOptionId] : []
                ),
            },
            questionId: null,
        },
    })
    await prisma.activity.deleteMany({ where: { id: activityId } })
    await prisma.course.deleteMany({ where: { id: courseId } })
    await prisma.deck.deleteMany({ where: { id: deckId } })
    await prisma.user.deleteMany({ where: { id: { in: [owner, other] } } })
    await prisma.$disconnect()
}
