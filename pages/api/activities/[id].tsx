import { apiHandler, identifier, RequestError } from '@/server/apiHandler'
import { requireReviewer } from '@/server/gradingSessions'
import {
    getActivity,
    editActivity,
    editActivitySchema,
    archiveActivity,
} from '@/server/contentAuthoring'
export { getActivity } from '@/server/contentAuthoring'
export default apiHandler(
    ['GET', 'PUT', 'DELETE'],
    async (req, res, viewer) => {
        const id = identifier.parse(req.query.id)
        if (req.method === 'GET') {
            const record = await getActivity(id)
            if (!record) throw new RequestError(404, 'Content not found')
            res.status(200).json(record)
        } else {
            requireReviewer(viewer)
            res.status(200).json(
                req.method === 'DELETE'
                    ? await archiveActivity(id)
                    : await editActivity(id, editActivitySchema.parse(req.body))
            )
        }
    }
)
