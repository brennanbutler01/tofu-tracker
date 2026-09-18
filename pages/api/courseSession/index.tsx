import prisma from '@/prisma/prisma'
import { apiHandler } from 'server/apiHandler'
import {
    createCourseSession,
    createCourseSessionSchema,
} from 'server/learningSessions'
import { fullCourseSession, orderCourseSession } from 'server/sessionShapes'
export default apiHandler(['GET', 'POST'], async (req, res, viewer) => {
    if (req.method === 'GET')
        res.json(
            (
                await prisma.courseSession.findMany({
                    where: { userId: viewer.userId },
                    ...fullCourseSession,
                })
            ).map(orderCourseSession)
        )
    else
        res.status(201).json(
            await createCourseSession(
                createCourseSessionSchema.parse(req.body).courseId,
                viewer.userId
            )
        )
})
