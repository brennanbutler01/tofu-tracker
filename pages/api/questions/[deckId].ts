import { apiHandler, identifier, RequestError } from '@/server/apiHandler'
import { getDeckQuestions } from '@/server/deckAuthoring'
export default apiHandler(['GET'], async (req, res, viewer) => {
    const deck = await getDeckQuestions(
        identifier.parse(req.query.deckId),
        viewer.userId
    )
    if (!deck) throw new RequestError(404, 'Deck not found')
    res.status(200).json(deck.questions)
})
