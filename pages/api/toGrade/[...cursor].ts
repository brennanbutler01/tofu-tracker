import { apiHandler, identifier, RequestError } from '@/server/apiHandler'
import { getAnswersToGrade, requireReviewer } from '@/server/gradingSessions'
export type { AnswersToGrade } from '@/server/gradingShapes'
export { getAnswersToGrade } from '@/server/gradingSessions'
export default apiHandler(['GET'], async (req, res, viewer) => {
    requireReviewer(viewer)
    if (!Array.isArray(req.query.cursor) || req.query.cursor.length !== 1)
        throw new RequestError(400, 'Invalid grading cursor')
    res.status(200).json(
        await getAnswersToGrade(identifier.parse(req.query.cursor[0]))
    )
})
