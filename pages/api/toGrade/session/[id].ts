import { apiHandler, identifier, RequestError } from '@/server/apiHandler'
import {
    getGradingSession,
    gradingActionSchema,
    requireReviewer,
    updateGradingSession,
} from '@/server/gradingSessions'
export { fullGradingSession } from '@/server/gradingShapes'
export type { FullGradingSession } from '@/server/gradingShapes'
export { getGradingSession } from '@/server/gradingSessions'
export default apiHandler(['GET', 'PUT'], async (req, res, viewer) => {
    requireReviewer(viewer)
    const id = identifier.parse(req.query.id)
    const result =
        req.method === 'GET'
            ? await getGradingSession(id, viewer.userId)
            : await updateGradingSession(
                  id,
                  viewer.userId,
                  gradingActionSchema.parse(req.body)
              )
    if (!result) throw new RequestError(404, 'Review session not found')
    res.status(200).json(result)
})
