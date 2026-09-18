import { apiHandler } from '@/server/apiHandler'
import {
    createGradingSchema,
    createGradingSession,
    getGradingSessions,
    requireReviewer,
} from '@/server/gradingSessions'
export { getGradingSessions } from '@/server/gradingSessions'
export default apiHandler(['GET', 'POST'], async (req, res, viewer) => {
    requireReviewer(viewer)
    if (req.method === 'GET')
        res.status(200).json(await getGradingSessions(viewer.userId))
    else
        res.status(201).json(
            await createGradingSession(
                viewer.userId,
                createGradingSchema.parse(req.body).answerIds
            )
        )
})
