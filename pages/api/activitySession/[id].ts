import { apiHandler, identifier, RequestError } from 'server/apiHandler'
import {
    getActivitySession,
    updateActivitySession,
} from 'server/learningSessions'
import { gameActionSchema } from 'server/gameSessions'
export { getActivitySession } from 'server/learningSessions'
export default apiHandler(['GET', 'PUT'], async (req, res, viewer) => {
    const id = identifier.parse(req.query.id)
    if (req.method === 'GET') {
        const session = await getActivitySession(id, viewer.userId)
        if (!session) throw new RequestError(404, 'Session not found')
        res.json(session)
    } else
        res.json(
            await updateActivitySession(
                id,
                viewer.userId,
                gameActionSchema.parse(req.body)
            )
        )
})
