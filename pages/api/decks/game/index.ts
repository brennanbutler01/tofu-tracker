import { apiHandler } from '@/server/apiHandler'
import {
    getDecksWithQuestionOptions,
    deckQuestionsShape,
} from '@/server/deckAuthoring'
import type { Prisma } from '@prisma/client'
export type DecksWithQuestionOptions = Prisma.DeckGetPayload<
    typeof deckQuestionsShape
>
export { getDecksWithQuestionOptions } from '@/server/deckAuthoring'
export default apiHandler(['GET'], async (_req, res, viewer) => {
    res.status(200).json(await getDecksWithQuestionOptions(viewer.userId))
})
