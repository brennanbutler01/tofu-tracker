import { apiHandler, identifier, RequestError } from '@/server/apiHandler'
import { requireReviewer } from '@/server/gradingSessions'
import {
    getDeckQuestions,
    editDeck,
    editDeckSchema,
    archiveDeck,
} from '@/server/deckAuthoring'
export default apiHandler(
    ['GET', 'PUT', 'DELETE'],
    async (req, res, viewer) => {
        const id = identifier.parse(req.query.id)
        if (req.method === 'GET') {
            const deck = await getDeckQuestions(id, viewer.userId)
            if (!deck) throw new RequestError(404, 'Deck not found')
            res.status(200).json(deck)
        } else {
            requireReviewer(viewer)
            res.status(200).json(
                req.method === 'DELETE'
                    ? await archiveDeck(id, viewer.userId)
                    : await editDeck(
                          id,
                          editDeckSchema.parse(req.body),
                          viewer.userId
                      )
            )
        }
    }
)
