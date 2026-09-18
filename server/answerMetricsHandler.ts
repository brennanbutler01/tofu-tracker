import type { NextApiRequest, NextApiResponse } from 'next'
import { Roles } from '@prisma/client'
import type { Viewer } from './userHandlers'
export interface UserAnswersByDay {
    playerId: string
    completed: number
    date: string
}
interface Dependencies {
    getViewer: (
        req: NextApiRequest,
        res: NextApiResponse
    ) => Promise<Viewer | null>
    getAnswers: (userId: string) => Promise<UserAnswersByDay[]>
    reportError: (error: unknown) => void
}
export function createAnswerMetricsHandler({
    getViewer,
    getAnswers,
    reportError,
}: Dependencies) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        if (req.method !== 'GET') {
            res.setHeader('Allow', 'GET')
            return void res.status(405).json({ error: 'Method not allowed' })
        }
        try {
            const viewer = await getViewer(req, res)
            if (!viewer)
                return void res.status(401).json({ error: 'Sign in required' })
            const userId = req.query.user
            if (typeof userId !== 'string' || !userId)
                return void res
                    .status(400)
                    .json({ error: 'Invalid user identifier' })
            if (
                (viewer.role !== Roles.ADMIN || viewer.isVisitor) &&
                viewer.userId !== userId
            )
                return void res.status(403).json({ error: 'Access denied' })
            return void res.status(200).json(await getAnswers(userId))
        } catch (error) {
            reportError(error)
            return void res
                .status(500)
                .json({ error: 'Unable to load answer history' })
        }
    }
}
