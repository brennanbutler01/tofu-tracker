import { request, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
const origin = process.env.LOCAL_API_URL || 'http://127.0.0.1:5220'
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))
    throw new Error('Use only the disposable local server')
const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString:
            'postgresql://demo:local-demo-only@127.0.0.1:5197/tofu_tracker',
    }),
})
const context = await request.newContext({
    baseURL: origin,
    extraHTTPHeaders: { Origin: origin },
})
let replay
try {
    expect(
        (
            await context.post('/api/demo/session', {
                headers: { Origin: 'https://other.example' },
            })
        ).status()
    ).toBe(403)
    expect((await context.post('/api/demo/session')).status()).toBe(201)
    const session = await (await context.get('/api/auth/session')).json()
    const userId = session.user.userId
    replay = await request.newContext({
        baseURL: origin,
        storageState: await context.storageState(),
        extraHTTPHeaders: { Origin: origin },
    })
    expect(
        (
            await context.post('/api/decks', {
                headers: { Origin: 'https://other.example' },
                data: { title: 'Forbidden' },
            })
        ).status()
    ).toBe(403)
    expect(
        (
            await context.post('/api/decks', {
                data: { title: 'a'.repeat(17000) },
            })
        ).status()
    ).toBe(413)
    await prisma.demoVisit.update({
        where: { userId },
        data: { requests: 999 },
    })
    const simultaneous = await Promise.all([
        context.get('/api/decks'),
        context.get('/api/decks'),
    ])
    expect(simultaneous.map(response => response.status()).sort()).toEqual([
        200, 429,
    ])
    await prisma.demoVisit.update({
        where: { userId },
        data: { requests: 0, writeBytes: 500000 },
    })
    expect(
        (
            await context.post('/api/decks', {
                data: { title: 'Beyond budget' },
            })
        ).status()
    ).toBe(429)
    await prisma.demoVisit.update({
        where: { userId },
        data: { expiresAt: new Date(0) },
    })
    expect((await context.get('/api/decks')).status()).toBe(401)
    expect(await (await context.get('/api/auth/session')).json()).toEqual({})
    expect((await context.get('/decks', { maxRedirects: 0 })).status()).toBe(
        404
    )
    expect((await replay.delete('/api/demo/session')).status()).toBe(204)
    expect(await prisma.user.findUnique({ where: { id: userId } })).toBeNull()
    expect((await context.get('/api/decks')).status()).toBe(401)
    expect((await context.post('/api/demo/session')).status()).toBe(201)
    const replacement = await (await context.get('/api/auth/session')).json()
    expect(replacement.user.userId).not.toBe(userId)
    const resets = await Promise.all([
        context.delete('/api/demo/session'),
        context.delete('/api/demo/session'),
    ])
    expect(resets.map(response => response.status())).toEqual([204, 204])
    console.log(
        'Passed visitor HTTP lifecycle: origin, request size, concurrent budget, write budget, session/page expiry, reset and clean restart.'
    )
} finally {
    await context.delete('/api/demo/session')
    if (replay) {
        await replay.delete('/api/demo/session')
        await replay.dispose()
    }
    await context.dispose()
    await prisma.$disconnect()
}
