import { apiHandler, identifier, RequestError } from '@/server/apiHandler'
import { requireReviewer } from '@/server/gradingSessions'
import {
    findOneTrack,
    editTrack,
    editTrackSchema,
    archiveTrack,
} from '@/server/contentAuthoring'
export { findOneTrack } from '@/server/contentAuthoring'
export default apiHandler(
    ['GET', 'PUT', 'DELETE'],
    async (req, res, viewer) => {
        const id = identifier.parse(req.query.id)
        if (req.method === 'GET') {
            const record = await findOneTrack(id, viewer.userId)
            if (!record) throw new RequestError(404, 'Content not found')
            res.status(200).json(record)
        } else {
            requireReviewer(viewer)
            res.status(200).json(
                req.method === 'DELETE'
                    ? await archiveTrack(id, viewer.userId)
                    : await editTrack(
                          id,
                          editTrackSchema.parse(req.body),
                          viewer.userId
                      )
            )
        }
    }
)
