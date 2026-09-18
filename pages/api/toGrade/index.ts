import { apiHandler } from '@/server/apiHandler'
import { getAnswersToGrade, requireReviewer } from '@/server/gradingSessions'
export const getInitialAnswersToGrade = (userId: string) =>
    getAnswersToGrade(userId)
export default apiHandler(['GET'], async (_req, res, viewer) => {
    requireReviewer(viewer)
    res.status(200).json(await getAnswersToGrade(viewer.userId))
})
