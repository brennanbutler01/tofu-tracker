import prisma from '@/prisma/prisma'
import { apiHandler } from 'server/apiHandler'
import {
    createActivitySession,
    createActivitySessionSchema,
} from 'server/learningSessions'
import {
    fullActivitySessions,
    orderActivitySession,
} from 'server/sessionShapes'
export { fullActivitySessions } from 'server/sessionShapes'
export type { FullActivitySession } from 'server/sessionShapes'
export const getActivitySessions = async (userId: string) =>
    (
        await prisma.activitySession.findMany({
            where: { userId },
            ...fullActivitySessions,
        })
    ).map(orderActivitySession)
export default apiHandler(['GET', 'POST'], async (req, res, viewer) => {
    if (req.method === 'GET') res.json(await getActivitySessions(viewer.userId))
    else
        res.status(201).json(
            await createActivitySession(
                createActivitySessionSchema.parse(req.body).activityId,
                viewer.userId
            )
        )
})
