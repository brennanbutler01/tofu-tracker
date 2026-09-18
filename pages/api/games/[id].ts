import { apiHandler, identifier, RequestError } from 'server/apiHandler'
import {
    getOwnedGame,
    gameActionSchema,
    updateOwnedGame,
} from 'server/gameSessions'
export { gameWithQuestionsOptions } from 'server/gameShapes'
export type {
    GameWithFullOptions,
    GameAnswerWithQuestionAnswer,
} from 'server/gameShapes'
export const getGameWithFullOptions = getOwnedGame
export default apiHandler(['GET', 'PUT'], async (req, res, viewer) => {
    const id = identifier.parse(req.query.id)
    if (req.method === 'GET') {
        const game = await getOwnedGame(id, viewer.userId)
        if (!game) throw new RequestError(404, 'Game not found')
        res.json(game)
    } else
        res.json(
            await updateOwnedGame(
                id,
                viewer.userId,
                gameActionSchema.parse(req.body)
            )
        )
})
