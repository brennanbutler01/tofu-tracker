import { apiHandler } from '@/server/apiHandler'
import { requireReviewer } from '@/server/gradingSessions'
import {
    getActivities,
    createActivity,
    createActivitySchema,
    activityWithQuestions,
} from '@/server/contentAuthoring'
import type { Prisma } from '@prisma/client'
export type ActivityWithQuestion = Prisma.ActivityGetPayload<
    typeof activityWithQuestions
>
export { getActivities, activityWithQuestions } from '@/server/contentAuthoring'
export default apiHandler(['GET', 'POST'], async (req, res, viewer) => {
    if (req.method === 'GET')
        res.status(200).json(await getActivities(viewer.userId))
    else {
        requireReviewer(viewer)
        res.status(201).json(
            await createActivity(
                viewer.userId,
                createActivitySchema.parse(req.body)
            )
        )
    }
})
