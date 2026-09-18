import { apiHandler } from '@/server/apiHandler'
import { requireReviewer } from '@/server/gradingSessions'
import {
    createDeck,
    createDeckSchema,
    getDeckQuestionCount,
    decksWithQuestionCount,
} from '@/server/deckAuthoring'
import type { Prisma } from '@prisma/client'
export type DeckWithQuestionCount = Prisma.DeckGetPayload<
    typeof decksWithQuestionCount
>
export { getDeckQuestionCount } from '@/server/deckAuthoring'
export default apiHandler(['GET', 'POST'], async (req, res, viewer) => {
    if (req.method === 'GET') res.status(200).json(await getDeckQuestionCount())
    else {
        requireReviewer(viewer)
        res.status(201).json(
            await createDeck(viewer.userId, createDeckSchema.parse(req.body))
        )
    }
})
