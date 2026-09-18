export { fullCourseSession } from 'server/sessionShapes'
export type { FullCourseSession } from 'server/sessionShapes'
import { apiHandler, identifier, RequestError } from 'server/apiHandler'
import { getCourseSession, updateCourseSession } from 'server/learningSessions'
import { gameActionSchema } from 'server/gameSessions'
export { getCourseSession } from 'server/learningSessions'
export default apiHandler(['GET', 'PUT'], async (req, res, viewer) => {
    const id = identifier.parse(req.query.id)
    if (req.method === 'GET') {
        const session = await getCourseSession(id, viewer.userId)
        if (!session) throw new RequestError(404, 'Session not found')
        res.json(session)
    } else
        res.json(
            await updateCourseSession(
                id,
                viewer.userId,
                gameActionSchema.parse(req.body)
            )
        )
})
