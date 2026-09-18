import { apiHandler, identifier, RequestError } from '@/server/apiHandler'
import { findOneTrack } from '@/server/contentAuthoring'
export async function getCourseOrdersForTrack(id: string) {
    const track = await findOneTrack(id)
    if (!track) throw new RequestError(404, 'Learning track not found')
    return track.courseOrder
}
export default apiHandler(['GET'], async (req, res) => {
    res.status(200).json(
        await getCourseOrdersForTrack(identifier.parse(req.query.id))
    )
})
