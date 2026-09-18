import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/prisma/prisma'
import {
    createVisitorWorkspace,
    resetVisitorWorkspace,
} from '@/server/visitorWorkspace'
import {
    visitorEnabled,
    visitorCookieName,
    visitorCookie,
    findVisitorSession,
    isVisitorOrigin,
} from '@/server/visitorAccess'
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Cache-Control', 'no-store')
    if (!visitorEnabled)
        return res.status(404).json({ error: 'Demo unavailable.' })
    if (!['GET', 'POST', 'DELETE'].includes(req.method || '')) {
        res.setHeader('Allow', 'GET, POST, DELETE')
        return res.status(405).json({ error: 'Method not allowed.' })
    }
    if (req.method !== 'GET' && !isVisitorOrigin(req))
        return res.status(403).json({ error: 'Same-origin request required.' })
    try {
        const token = req.cookies[visitorCookieName]
        const session = await findVisitorSession(token)
        if (req.method === 'GET')
            return res.json({
                active: Boolean(session),
                expiresAt: session?.user.demoVisit?.expiresAt ?? null,
            })
        if (req.method === 'DELETE') {
            // An expired session can still identify its own workspace for explicit cleanup.
            const previous = token
                ? await prisma.session.findUnique({
                      where: { sessionToken: token },
                  })
                : null
            if (previous) await resetVisitorWorkspace(previous.userId)
            res.setHeader('Set-Cookie', visitorCookie('', true))
            return res.status(204).end()
        }
        if (session)
            return res.json({
                active: true,
                expiresAt: session.user.demoVisit?.expiresAt,
            })
        const visitor = await createVisitorWorkspace()
        if (!visitor)
            return res
                .status(503)
                .json({
                    error: 'The demo is at capacity. Please try again later.',
                })
        res.setHeader('Set-Cookie', visitorCookie(visitor.token))
        return res
            .status(201)
            .json({ active: true, expiresAt: visitor.expiresAt })
    } catch {
        return res
            .status(500)
            .json({ error: 'Unable to prepare the demo. Please try again.' })
    }
}
