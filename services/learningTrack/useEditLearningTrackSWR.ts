import useSWR from 'swr'
import { LEARNING_TRACK_API } from '@/services/learningTrack/useLearningTrackCRUD'
import { LearningTrackWithOrderedCourses } from '@/pages/api/learningTracks'
import { useRouter } from 'next/router'

interface IUseLearningTrackSWR {
    fallbackData?: LearningTrackWithOrderedCourses
}
export const useEditLearningTrackSWR = ({
    fallbackData,
}: IUseLearningTrackSWR) => {
    const { query } = useRouter()
    const { data } = useSWR(`${LEARNING_TRACK_API}/${query.id}`, {
        fallbackData,
    })
    return data as LearningTrackWithOrderedCourses
}
