import prisma from '@/prisma/prisma'
import { apiHandler } from '@/server/apiHandler'
import { FeedbackSeverity, FeedbackType } from '@prisma/client'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
const feedbackSchema = z
    .object({
        subject: z.string().trim().min(1).max(200),
        suggestion: z.string().trim().min(1).max(8000),
        type: z.nativeEnum(FeedbackType),
        severity: z.nativeEnum(FeedbackSeverity),
    })
    .strict()
export const getFeedback = (userId: string) =>
    prisma.userFeedback.findMany({
        where: { userId },
        orderBy: { created: 'desc' },
        take: 100,
    })
export default apiHandler(['GET', 'POST'], async (req, res, viewer) => {
    if (req.method === 'GET')
        res.status(200).json(await getFeedback(viewer.userId))
    else
        res.status(201).json(
            await prisma.userFeedback.create({
                data: {
                    ...feedbackSchema.parse(req.body),
                    id: randomUUID(),
                    userId: viewer.userId,
                },
            })
        )
})
