import { request, expect } from '@playwright/test'
const origin = process.env.LOCAL_API_URL || 'http://127.0.0.1:5220'
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin) && origin !== 'https://tofu-tracker-demo.vercel.app')
    throw new Error('Use the local server or the dedicated public demo')
const first = await request.newContext({
    baseURL: origin,
    extraHTTPHeaders: { Origin: origin },
})
const second = await request.newContext({
    baseURL: origin,
    extraHTTPHeaders: { Origin: origin },
})
let checks = 0
async function check(context, path, status = 200, method = 'GET', data) {
    const response = await context.fetch(path, {
        method,
        data,
        maxRedirects: 0,
    })
    expect(
        response.status(),
        method + ' ' + path + ': ' + (await response.text()).slice(0, 100)
    ).toBe(status)
    checks++
    try {
        return await response.json()
    } catch {
        return null
    }
}
try {
    await check(first, '/api/decks', 401)
    await check(first, '/api/demo/session', 201, 'POST')
    await check(second, '/api/demo/session', 201, 'POST')
    const a = await check(first, '/api/auth/session')
    const b = await check(second, '/api/auth/session')
    expect(a.user.userId).not.toBe(b.user.userId)
    const decksA = await check(first, '/api/decks')
    const decksB = await check(second, '/api/decks')
    expect(decksA).toHaveLength(1)
    expect(decksB).toHaveLength(1)
    expect(decksA[0].id).not.toBe(decksB[0].id)
    await check(first, '/api/decks/' + decksB[0].id, 404)
    await check(first, '/api/decks/' + decksB[0].id, 404, 'PUT', {
        title: 'Foreign edit',
    })
    await check(first, '/decks/' + decksB[0].id, 404)
    const coursesB = await check(second, '/api/courses')
    await check(first, '/api/courses/' + coursesB[0].id, 404)
    await check(first, '/courses/edit/' + coursesB[0].id, 404)
    await check(first, '/api/courseSession', 404, 'POST', {
        courseId: coursesB[0].id,
    })
    await check(
        first,
        '/api/questions/feedback/' + decksB[0].questions[0].id,
        404
    )
    await check(
        first,
        '/api/metrics/questions/' + decksB[0].questions[0].id,
        404
    )
    await check(first, '/api/users/' + b.user.userId, 403)
    await check(first, '/api/users/' + a.user.userId, 400, 'PUT', {
        role: 'USER',
    })
    const users = await check(first, '/api/users')
    expect(users).toHaveLength(1)
    expect(users[0].id).toBe(a.user.userId)
    const answersB = await check(second, '/api/toGrade')
    await check(first, '/api/toGrade/session', 409, 'POST', {
        answerIds: [answersB[0].id],
    })
    const created = await check(first, '/api/decks', 201, 'POST', {
        title: 'Persisted visitor deck',
    })
    expect(
        (await check(first, '/api/decks')).some(deck => deck.id === created.id)
    ).toBe(true)
    expect(
        (await check(second, '/api/decks')).some(deck => deck.id === created.id)
    ).toBe(false)
    await check(first, '/api/demo/session', 204, 'DELETE')
    await check(first, '/api/decks', 401)
    expect((await check(second, '/api/decks')).length).toBe(1)
    await check(first, '/api/demo/session', 201, 'POST')
    expect((await check(first, '/api/decks')).length).toBe(1)
    console.log(
        `Passed ${checks} visitor HTTP checks: real authentication, persistence, cross-workspace rejection, rendered pages and reset.`
    )
} finally {
    await first.delete('/api/demo/session')
    await second.delete('/api/demo/session')
    await first.dispose()
    await second.dispose()
}
