import { apiHandler, identifier } from '@/server/apiHandler'
import { requireReviewer } from '@/server/gradingSessions'
import { getCourseMetrics, metricIdsSchema } from '@/server/metrics'
export default apiHandler(['GET'], async (req, res, viewer) => {
    requireReviewer(viewer)
    res.status(200).json(
        await getCourseMetrics(
            metricIdsSchema.parse(req.query.courses),
            viewer.userId
        )
    )
})
