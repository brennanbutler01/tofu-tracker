import { LearningTrack } from '@prisma/client'
import useSWR from 'swr'
import { LEARNING_TRACK_API } from '@/services/learningTrack/useLearningTrackCRUD'
import { LearningTrackWithOrderedCourses } from '@/pages/api/learningTracks'

interface IUseLearningTrackSWR {
    fallbackData?: Array<LearningTrackWithOrderedCourses>
}
export const useLearningTrackSWR = ({ fallbackData }: IUseLearningTrackSWR) => {
    const { data } = useSWR(LEARNING_TRACK_API, { fallbackData })
    return data as Array<LearningTrackWithOrderedCourses>
}
