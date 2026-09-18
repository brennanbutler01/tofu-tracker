import { Prisma } from '@prisma/client'
import { http } from '../http'

class LearningTrackService {
    private LEARNING_TRACK_ENDPOINT = '/learningTracks'
    private singularLearningTrack = (
        track: Prisma.LearningTrackWhereInput | Prisma.LearningTrackUpdateInput
    ) => `${this.LEARNING_TRACK_ENDPOINT}/${track.id}`

    createTrack = async (track: Prisma.LearningTrackCreateInput) =>
        await http.post<Prisma.LearningTrackCreateInput>(
            this.LEARNING_TRACK_ENDPOINT,
            track
        )
    updateTrack = async (track: Prisma.LearningTrackUpdateInput) =>
        await http.put(this.singularLearningTrack(track), track)
    deleteTrack = async (track: Prisma.LearningTrackWhereInput) =>
        await http.delete<Prisma.LearningTrackWhereInput>(
            this.singularLearningTrack(track)
        )
}

export const learningTrackService = new LearningTrackService()
