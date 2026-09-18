import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { getViewer } from './viewer'
import type { Viewer } from './userHandlers'

export class RequestError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message)
    }
}
export const identifier = z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/)
export function apiHandler(
    methods: string[],
    handle: (
        req: NextApiRequest,
        res: NextApiResponse,
        viewer: Viewer
    ) => Promise<void>
): NextApiHandler {
    return async (req, res) => {
        res.setHeader('Cache-Control', 'no-store')
        if (!methods.includes(req.method || '')) {
            res.setHeader('Allow', methods.join(', '))
            res.status(405).json({ error: 'Method not allowed' })
            return
        }
        try {
            const viewer = await getViewer(req, res)
            if (!viewer) throw new RequestError(401, 'Sign in required')
            if (req.body && Buffer.byteLength(JSON.stringify(req.body)) > 32768)
                throw new RequestError(413, 'Request is too large')
            await handle(req, res, viewer)
        } catch (error) {
            if (error instanceof RequestError)
                res.status(error.status).json({ error: error.message })
            else if (error instanceof z.ZodError)
                res.status(400).json({ error: 'Invalid request' })
            else if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                ['P2002', 'P2003', 'P2025'].includes(error.code)
            )
                res.status(error.code === 'P2025' ? 404 : 409).json({
                    error: 'The record changed or is no longer available',
                })
            else {
                console.error(
                    'Tracker request failed',
                    error instanceof Error ? error.name : 'Unknown error'
                )
                res.status(500).json({
                    error: 'Unable to complete this request',
                })
            }
        }
    }
}
