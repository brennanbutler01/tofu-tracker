import { apiHandler } from '@/server/apiHandler'
import { requireReviewer } from '@/server/gradingSessions'
import {
    getLearningTracks,
    createTrack,
    createTrackSchema,
    learningTrackWithOrderedCourses,
} from '@/server/contentAuthoring'
import type { Prisma } from '@prisma/client'
export type LearningTrackWithOrderedCourses = Prisma.LearningTrackGetPayload<
    typeof learningTrackWithOrderedCourses
>
export {
    getLearningTracks,
    learningTrackWithOrderedCourses,
} from '@/server/contentAuthoring'
export default apiHandler(['GET', 'POST'], async (req, res, viewer) => {
    if (req.method === 'GET') res.status(200).json(await getLearningTracks())
    else {
        requireReviewer(viewer)
        res.status(201).json(
            await createTrack(viewer.userId, createTrackSchema.parse(req.body))
        )
    }
})
