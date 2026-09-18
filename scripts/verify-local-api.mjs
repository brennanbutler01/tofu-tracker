import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Roles } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import assert from 'node:assert/strict'

const database = 'postgresql://demo:local-demo-only@127.0.0.1:5197/tofu_tracker'
const origin = 'http://127.0.0.1:5196'
const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: database }),
})
const prefix = `recovery-${randomUUID()}`
const alice = `${prefix}-alice`
const bob = `${prefix}-bob`
const admin = `${prefix}-admin`
const sessions = new Map()
let passed = 0
async function check(path, expected, { userId, method = 'GET', body } = {}) {
    const headers = { 'Content-Type': 'application/json' }
    if (userId)
        headers.Cookie = `next-auth.session-token=${sessions.get(userId)}`
    const response = await fetch(`${origin}${path}`, {
        method,
        headers,
        redirect: 'manual',
        body: body === undefined ? undefined : JSON.stringify(body),
    })
    await response.text()
    assert.equal(response.status, expected, `${method} ${path}`)
    passed++
}
try {
    for (const [id, role] of [
        [alice, Roles.USER],
        [bob, Roles.USER],
        [admin, Roles.ADMIN],
    ]) {
        const token = randomUUID()
        sessions.set(id, token)
        await prisma.user.create({
            data: {
                id,
                name: id,
                email: `${id}@example.test`,
                role,
                sessions: {
                    create: {
                        sessionToken: token,
                        expires: new Date(Date.now() + 3600000),
                    },
                },
            },
        })
    }
    await check(`/api/users/${alice}`, 401)
    await check(`/api/users/${alice}`, 200, { userId: alice })
    await check(`/api/users/${bob}`, 403, { userId: alice })
    await check(`/api/users/${alice}`, 400, {
        userId: alice,
        method: 'PUT',
        body: { role: Roles.ADMIN },
    })
    await check(`/api/users/${alice}`, 400, {
        userId: alice,
        method: 'PUT',
        body: { email: 'other@example.test' },
    })
    await check(`/api/users/${alice}`, 200, {
        userId: alice,
        method: 'PUT',
        body: { name: 'Synthetic Learner' },
    })
    assert.equal(
        (await prisma.user.findUniqueOrThrow({ where: { id: alice } })).name,
        'Synthetic Learner'
    )
    assert.equal(
        (await prisma.user.findUniqueOrThrow({ where: { id: alice } })).role,
        Roles.USER
    )
    await check(`/api/users/${bob}`, 403, { userId: alice, method: 'DELETE' })
    await check(`/api/metrics/answersByDay/${bob}`, 403, { userId: alice })
    await check(`/api/metrics/answersByDay/${alice}`, 200, { userId: alice })
    await check('/admin', 404, { userId: alice })
    await check('/api/users', 405, { userId: alice, method: 'POST', body: {} })
    await check(`/api/users/${bob}`, 200, {
        userId: admin,
        method: 'PUT',
        body: { role: Roles.ADMIN },
    })
    assert.equal(
        (await prisma.user.findUniqueOrThrow({ where: { id: bob } })).role,
        Roles.ADMIN
    )
    await check(`/api/users/${bob}`, 204, { userId: admin, method: 'DELETE' })
    console.log(`${passed} real HTTP/database permission checks passed.`)
} finally {
    await prisma.user.deleteMany({ where: { id: { in: [alice, bob, admin] } } })
    await prisma.$disconnect()
}
