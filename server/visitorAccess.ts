import type { NextApiRequest, NextApiHandler } from 'next'
import prisma from '@/prisma/prisma'

export const visitorEnabled = process.env.VISITOR_DEMO === 'true'
export const visitorCookieName = process.env.NEXTAUTH_URL?.startsWith('https:')
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token'
export function isVisitorOrigin(req: Pick<NextApiRequest, 'headers'>) {
    const configured = process.env.NEXTAUTH_URL
    return Boolean(
        configured && req.headers.origin === new URL(configured).origin
    )
}
export function visitorCookie(token: string, clear = false) {
    return `${visitorCookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
        clear ? 0 : 3600
    }${visitorCookieName.startsWith('__Secure-') ? '; Secure' : ''}`
}
export async function findVisitorSession(token: string | undefined) {
    if (!token) return null
    const record = await prisma.session.findUnique({
        where: { sessionToken: token },
        include: { user: { include: { demoVisit: true } } },
    })
    const visit = record?.user.demoVisit
    if (
        !record ||
        !visit ||
        record.expires <= new Date() ||
        visit.expiresAt <= new Date()
    )
        return null
    return record
}
export async function consumeVisitorRequest(
    req: Pick<NextApiRequest, 'method' | 'headers' | 'cookies' | 'body'>
) {
    if (!['GET', 'HEAD'].includes(req.method || '') && !isVisitorOrigin(req))
        return { status: 403, error: 'Same-origin request required.' }
    const session = await findVisitorSession(req.cookies[visitorCookieName])
    if (!session)
        return { status: 401, error: 'Demo session expired. Start a new demo.' }
    const writeBytes = req.body
        ? Buffer.byteLength(JSON.stringify(req.body))
        : 0
    if (writeBytes > 16384)
        return { status: 413, error: 'Demo request is too large.' }
    const result = await prisma.demoVisit.updateMany({
        where: {
            userId: session.userId,
            expiresAt: { gt: new Date() },
            requests: { lt: 1000 },
            writeBytes: { lte: 500000 - writeBytes },
        },
        data: {
            requests: { increment: 1 },
            writeBytes: { increment: writeBytes },
        },
    })
    return result.count
        ? null
        : {
              status: 429,
              error: 'Demo request limit reached. Reset the demo to continue.',
          }
}

export function withVisitorGuard(handler: NextApiHandler): NextApiHandler {
    return async (req, res) => {
        if (visitorEnabled) {
            res.setHeader('Cache-Control', 'no-store')
            try {
                const denied = await consumeVisitorRequest(req)
                if (denied)
                    return res
                        .status(denied.status)
                        .json({ error: denied.error })
            } catch {
                return res
                    .status(500)
                    .json({ error: 'Unable to validate demo session.' })
            }
        }
        return handler(req, res)
    }
}
