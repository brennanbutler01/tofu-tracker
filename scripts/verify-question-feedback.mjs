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
const prefix = 'feedback-' + randomUUID(),
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
                name: 'Synthetic Feedback Tester',
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
    const deck = await request('/api/decks', {
        method: 'POST',
        body: { title: 'Feedback fixture' },
        status: 201,
    })
    const questions = []
    for (const text of ['First question', 'Second question']) {
        const updated = await request('/api/decks/questions/' + deck.id, {
            method: 'PUT',
            body: {
                action: 'create',
                question: {
                    question: text,
                    type: 'TRUE_FALSE',
                    correctAnswer: 'true',
                },
            },
        })
        questions.push(updated.questions.find(item => item.question === text))
    }
    const endpoint = '/api/questions/feedback/' + questions[0].id
    const otherEndpoint = '/api/questions/feedback/' + questions[1].id
    await request(endpoint, { user: null, status: 401 })
    await request(endpoint, { user: learner, status: 404 })
    await request('/api/games', {
        user: learner,
        method: 'POST',
        body: { title: 'Feedback practice', questionIds: [questions[0].id] },
        status: 201,
    })
    await request(otherEndpoint, { user: learner, status: 404 })
    await request(endpoint, {
        user: learner,
        method: 'PUT',
        body: { comments: { deleteMany: {} } },
        status: 400,
    })
    await request(endpoint, {
        user: learner,
        method: 'PUT',
        body: { action: 'comment', comment: 'Forged', userId: admin },
        status: 400,
    })
    let feedback = await request(endpoint, {
        user: learner,
        method: 'PUT',
        body: { action: 'comment', comment: 'Useful question' },
    })
    const parent = feedback.comments[0]
    assert.equal(parent.userId, learner)
    assert.deepEqual(Object.keys(parent.user).sort(), ['id', 'image', 'name'])
    checks += 2
    const unrelated = await request(otherEndpoint, {
        method: 'PUT',
        body: { action: 'comment', comment: 'Other question' },
    })
    await request(endpoint, {
        user: learner,
        method: 'PUT',
        body: {
            action: 'comment',
            parentId: unrelated.comments[0].id,
            comment: 'Wrong thread',
        },
        status: 404,
    })
    feedback = await request(endpoint, {
        user: learner,
        method: 'PUT',
        body: { action: 'comment', parentId: parent.id, comment: 'A reply' },
    })
    assert.equal(
        feedback.comments.find(item => item.id === parent.id).childrenComments
            .length,
        1
    )
    checks++
    const child = feedback.comments.find(
        item => item.parentComment === parent.id
    )
    feedback = await request(endpoint, {
        user: learner,
        method: 'PUT',
        body: {
            action: 'comment',
            parentId: child.id,
            comment: 'Nested reply',
        },
    })
    assert.equal(
        feedback.comments.find(item => item.id === child.id).childrenComments
            .length,
        1
    )
    checks++
    for (const reaction of ['like', 'like', 'dislike', 'none']) {
        feedback = await request(endpoint, {
            user: learner,
            method: 'PUT',
            body: {
                action: 'react',
                target: 'comment',
                targetId: parent.id,
                reaction,
            },
        })
        const comment = feedback.comments.find(item => item.id === parent.id)
        assert.deepEqual(comment.likes, reaction === 'like' ? [learner] : [])
        assert.deepEqual(
            comment.dislikes,
            reaction === 'dislike' ? [learner] : []
        )
        checks += 2
    }
    await request(endpoint, {
        method: 'PUT',
        body: {
            action: 'react',
            target: 'comment',
            targetId: unrelated.comments[0].id,
            reaction: 'like',
        },
        status: 404,
    })
    await Promise.all(
        [3, 4].map(rating =>
            request(endpoint, {
                user: learner,
                method: 'PUT',
                body: { action: 'rate', rating },
            })
        )
    )
    assert.equal(
        await prisma.questionRating.count({ where: { userId: learner } }),
        1
    )
    checks++
    await request(endpoint, {
        user: learner,
        method: 'PUT',
        body: { action: 'rate', rating: 9 },
        status: 400,
    })
    const resourceInput = {
        title: 'Study guide',
        description: 'Synthetic resource',
        location: 'https://example.com/guide',
        tags: ['Review'],
    }
    for (const location of [
        'javascript:alert(1)',
        'https://user:password@example.com/',
    ])
        await request(endpoint, {
            user: learner,
            method: 'PUT',
            body: { action: 'resource', ...resourceInput, location },
            status: 400,
        })
    feedback = await request(endpoint, {
        user: learner,
        method: 'PUT',
        body: { action: 'resource', ...resourceInput },
    })
    const resource = feedback.resources[0]
    await request(endpoint, {
        method: 'PUT',
        body: {
            action: 'editResource',
            resourceId: resource.id,
            ...resourceInput,
            title: 'Unauthorized edit',
        },
        status: 404,
    })
    feedback = await request(endpoint, {
        user: learner,
        method: 'PUT',
        body: {
            action: 'editResource',
            resourceId: resource.id,
            ...resourceInput,
            title: 'Revised guide',
        },
    })
    assert.equal(feedback.resources[0].title, 'Revised guide')
    checks++
    await request(otherEndpoint, {
        method: 'PUT',
        body: {
            action: 'comment',
            resourceId: resource.id,
            comment: 'Wrong resource',
        },
        status: 404,
    })
    feedback = await request(endpoint, {
        user: learner,
        method: 'PUT',
        body: {
            action: 'comment',
            resourceId: resource.id,
            comment: 'Resource discussion',
        },
    })
    const resourceComment = feedback.resources[0].comments[0]
    feedback = await request(endpoint, {
        user: learner,
        method: 'PUT',
        body: {
            action: 'comment',
            resourceId: resource.id,
            parentId: resourceComment.id,
            comment: 'Resource reply',
        },
    })
    assert.equal(feedback.resources[0].comments.length, 2)
    checks++
    await request(endpoint, { user: learner, method: 'DELETE', status: 405 })
    console.log(
        `Passed ${checks} question-feedback checks: access, authorship, thread boundaries, private fields, ratings, reactions and safe resources.`
    )
} finally {
    await prisma.resourceComments.deleteMany({
        where: { userId: { in: users } },
    })
    await prisma.gameSession.deleteMany({ where: { userId: { in: users } } })
    await prisma.deck.deleteMany({ where: { userId: { in: users } } })
    await prisma.user.deleteMany({ where: { id: { in: users } } })
    await prisma.$disconnect()
}
