export type { UserQuestionMetric as IQuestionStatsByUser } from '@/utils/metricSchemas'
import { apiHandler, identifier } from '@/server/apiHandler'
import { requireReviewer } from '@/server/gradingSessions'
import { getQuestionMetricsByUser, metricIdsSchema } from '@/server/metrics'
export default apiHandler(['GET'], async (req, res, viewer) => {
    requireReviewer(viewer)
    res.status(200).json(
        await getQuestionMetricsByUser(
            identifier.parse(req.query.id),
            viewer.userId
        )
    )
})
