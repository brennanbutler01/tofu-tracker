/** @jest-environment node */
import { createServer } from 'node:http'
import { apiResolver } from 'next/dist/server/api-utils/node/api-resolver'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Roles, Teams } from '@prisma/client'
import type { User } from '@prisma/client'
import { createUserHandler, createUsersHandler } from '../server/userHandlers'
import type { UserRepository, Viewer } from '../server/userHandlers'
import { createAnswerMetricsHandler } from '../server/answerMetricsHandler'

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>
async function request(handler: Handler, { method = 'GET', body, query = { id: 'alice' } }: {
    method?: string; body?: unknown; query?: Record<string, string | string[]>
} = {}) {
    const server = createServer((req, res) => {
        void apiResolver(req, res, query, { default: handler }, {
            dev: true, previewModeId: 'test', previewModeEncryptionKey: 'test', previewModeSigningKey: 'test',
        }, false).catch(error => { res.destroy(error) })
    })
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    try {
        const address = server.address()
        if (!address || typeof address === 'string') throw new Error('Missing listener address')
        const response = await fetch(`http://127.0.0.1:${address.port}/api/users/alice`, {
            method, headers: { 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body),
        })
        return { status: response.status, allow: response.headers.get('allow'), text: await response.text() }
    } finally {
        await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
    }
}
function setup(viewer: Viewer | null = { userId: 'alice', role: Roles.USER }) {
    const users = new Map<string, User>(['alice', 'bob'].map(id => [id, {
        id, name: id, email: `${id}@example.test`, emailVerified: null, image: null,
        role: Roles.USER, team: Teams.UNASSIGNED,
    }]))
    const writes: string[] = []
    const errors: unknown[] = []
    const repository: UserRepository = {
        find: async id => users.get(id) ?? null,
        list: async () => [...users.values()],
        update: async (id, data) => {
            const previous = users.get(id)
            if (!previous) throw new Error('User missing')
            const user = { ...previous, ...data }; users.set(id, user); writes.push(id); return user
        },
        remove: async id => { users.delete(id); writes.push(id) },
    }
    const dependencies = { getViewer: async () => viewer, repository, reportError: (error: unknown) => { errors.push(error) } }
    return { ...dependencies, users, writes, errors, handler: createUserHandler(dependencies) }
}

test('GET reads a profile without falling through to a mutation', async () => {
    const state = setup()
    expect((await request(state.handler)).status).toBe(200)
    expect(state.writes).toEqual([])
})
test.each(['GET', 'PUT', 'DELETE'])('anonymous %s cannot access accounts', async method => {
    const state = setup(null)
    expect((await request(state.handler, { method, body: method === 'PUT' ? { name: 'Changed' } : undefined })).status).toBe(401)
    expect(state.writes).toEqual([])
})
test.each(['GET', 'PUT', 'DELETE'])('ordinary user cannot %s another account', async method => {
    const state = setup()
    expect((await request(state.handler, { method, query: { id: 'bob' }, body: method === 'PUT' ? { name: 'Changed' } : undefined })).status).toBe(403)
    expect(state.writes).toEqual([])
})
test.each([{ role: Roles.ADMIN }, { team: Teams.ADMIN }, { email: 'other@example.test' }, { accounts: { deleteMany: {} } }, { name: '' }, {}])('rejects unsafe profile changes %j', async body => {
    const state = setup()
    expect((await request(state.handler, { method: 'PUT', body })).status).toBe(400)
    expect(state.writes).toEqual([])
})
test('ordinary user can update only their own display name', async () => {
    const state = setup()
    expect((await request(state.handler, { method: 'PUT', body: { name: ' Alice Example ' } })).status).toBe(200)
    expect(state.users.get('alice')?.name).toBe('Alice Example')
    expect(state.users.get('alice')?.role).toBe(Roles.USER)
})
test('administrator can assign roles and teams', async () => {
    const state = setup({ userId: 'alice', role: Roles.ADMIN })
    expect((await request(state.handler, { method: 'PUT', query: { id: 'bob' }, body: { role: Roles.ADMIN, team: Teams.LEADERSHIP } })).status).toBe(200)
    expect(state.users.get('bob')?.role).toBe(Roles.ADMIN)
})
test('only an administrator can delete a different account', async () => {
    const state = setup({ userId: 'alice', role: Roles.ADMIN })
    expect((await request(state.handler, { method: 'DELETE' })).status).toBe(400)
    expect((await request(state.handler, { method: 'DELETE', query: { id: 'bob' } })).status).toBe(204)
    expect(state.users.has('bob')).toBe(false)
})
test('unknown methods, invalid identifiers and missing users are explicit errors', async () => {
    const state = setup({ userId: 'alice', role: Roles.ADMIN })
    expect((await request(state.handler, { method: 'POST' })).allow).toBe('GET, PUT, DELETE')
    expect((await request(state.handler, { query: { id: ['alice', 'bob'] } })).status).toBe(400)
    expect((await request(state.handler, { query: { id: 'missing' } })).status).toBe(404)
})
test('repository failures do not expose internal data', async () => {
    const state = setup()
    state.repository.find = async () => { throw new Error('private database details') }
    const response = await request(createUserHandler(state))
    expect(response.status).toBe(500)
    expect(response.text).not.toContain('private database details')
    expect(state.errors).toHaveLength(1)
})
test('user list is restricted and rejects mutations', async () => {
    const state = setup()
    const handler = createUsersHandler(state)
    const response = await request(handler)
    expect(response.text).toContain('alice@example.test')
    expect(response.text).not.toContain('bob@example.test')
    expect((await request(handler, { method: 'POST' })).status).toBe(405)
    const admin = setup({ userId: 'alice', role: Roles.ADMIN })
    expect((await request(createUsersHandler(admin))).text).toContain('bob@example.test')
})
test('answer history checks ownership before querying', async () => {
    const calls: string[] = []
    const state = setup()
    const handler = createAnswerMetricsHandler({ ...state, getAnswers: async userId => {
        calls.push(userId); return [{ playerId: userId, completed: 2, date: '09/17/2026' }]
    } })
    expect((await request(handler, { query: { user: 'bob' } })).status).toBe(403)
    expect((await request(handler, { method: 'POST', query: { user: 'alice' } })).status).toBe(405)
    expect(calls).toEqual([])
    expect((await request(handler, { query: { user: 'alice' } })).status).toBe(200)
    expect(calls).toEqual(['alice'])
})
