import { visitorQuestionScope } from '@/server/visitorScope'
import { apiHandler, identifier } from '@/server/apiHandler'
import { requireReviewer } from '@/server/gradingSessions'
import { questionSchema, updateDeckQuestion } from '@/server/deckAuthoring'
import prisma from '@/prisma/prisma'
import { z } from 'zod'
const createSchema = z
    .object({ deckId: identifier, question: questionSchema })
    .strict()
export default apiHandler(['GET', 'POST'], async (req, res, viewer) => {
    if (req.method === 'GET')
        res.status(200).json(
            await prisma.question.findMany({
                where: {
                    archived: false,
                    AND: [visitorQuestionScope(viewer.userId)],
                    OR: [{ deck: { archived: false } }, { deckId: null }],
                },
                take: 500,
                orderBy: { created: 'asc' },
            })
        )
    else {
        requireReviewer(viewer)
        const input = createSchema.parse(req.body)
        res.status(201).json(
            await updateDeckQuestion(
                input.deckId,
                {
                    action: 'create',
                    question: input.question,
                },
                viewer.userId
            )
        )
    }
})
