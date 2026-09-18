export type { QuestionMetric as IQuestionStats } from '@/utils/metricSchemas'
import { apiHandler, identifier } from '@/server/apiHandler'
import { requireReviewer } from '@/server/gradingSessions'
import { getQuestionMetrics, metricIdsSchema } from '@/server/metrics'
export default apiHandler(['GET'], async (req, res, viewer) => {
    requireReviewer(viewer)
    res.status(200).json(
        await getQuestionMetrics(metricIdsSchema.parse(req.query.id))
    )
})
