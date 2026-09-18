import { apiHandler, identifier, RequestError } from '@/server/apiHandler'
import { requireReviewer } from '@/server/gradingSessions'
import {
    getDeckQuestions,
    updateDeckQuestion,
    deckQuestionActionSchema,
    archiveDeckQuestion,
} from '@/server/deckAuthoring'
export { getDeckQuestions } from '@/server/deckAuthoring'
export default apiHandler(
    ['GET', 'PUT', 'DELETE'],
    async (req, res, viewer) => {
        const path = req.query.path
        if (
            !Array.isArray(path) ||
            path.length !== (req.method === 'DELETE' ? 2 : 1)
        )
            throw new RequestError(400, 'Invalid deck/question path')
        const deckId = identifier.parse(path[0])
        if (req.method === 'GET') {
            const deck = await getDeckQuestions(deckId)
            if (!deck) throw new RequestError(404, 'Deck not found')
            res.status(200).json(deck)
        } else {
            requireReviewer(viewer)
            res.status(200).json(
                req.method === 'DELETE'
                    ? await archiveDeckQuestion(
                          deckId,
                          identifier.parse(path[1])
                      )
                    : await updateDeckQuestion(
                          deckId,
                          deckQuestionActionSchema.parse(req.body)
                      )
            )
        }
    }
)
