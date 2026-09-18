import { message } from 'antd'
import { useSWRConfig } from 'swr'
import type { ITrackForm } from '@/components/learningTracks/TrackForm'
import { learningTrackService, trackFormInput } from './learningTrackService'
import { useLearningTrackSWR } from './useLearningTrackSWR'
export const LEARNING_TRACK_API = '/api/learningTracks'
export const useLearningTrackCRUD = () => {
    const tracks = useLearningTrackSWR({})
    const { mutate } = useSWRConfig()
    const refresh = async (id?: string) => {
        await mutate(LEARNING_TRACK_API)
        if (id) {
            await mutate(`${LEARNING_TRACK_API}/${id}`)
            await mutate(`/api/courseOrder/${id}`)
        }
    }
    const createLearningTrack = async (values: ITrackForm) => {
        try {
            await learningTrackService.createTrack(trackFormInput(values))
            await refresh()
            return true
        } catch {
            message.error(
                'Could not create this learning track. Your entries are still here.'
            )
            return false
        }
    }
    const deleteLearningTrack = async ({ trackId }: { trackId: string }) => {
        try {
            await learningTrackService.deleteTrack(trackId)
            await refresh(trackId)
            message.success('Learning track archived.')
            return true
        } catch {
            message.error(
                'Could not archive this learning track. Please try again.'
            )
            return false
        }
    }
    const reOrderLearningTrackCourses = async ({
        trackId,
        courseOrder,
    }: {
        trackId: string
        courseOrder: string[]
    }) => {
        try {
            await learningTrackService.updateTrack(trackId, {
                courseIds: courseOrder,
            })
            await refresh(trackId)
            message.success('Learning track saved.')
            return true
        } catch {
            message.error('Could not save these courses. Please try again.')
            return false
        }
    }
    const deleteCourse = ({
        trackId,
        courseId,
    }: {
        trackId: string
        courseId: string
    }) => {
        const track = tracks?.find(item => item.id === trackId)
        if (!track) {
            message.error(
                'Learning track is unavailable. Refresh and try again.'
            )
            return Promise.resolve(false)
        }
        return reOrderLearningTrackCourses({
            trackId,
            courseOrder: track.courseOrder
                .filter(item => item.courseId !== courseId)
                .map(item => item.courseId),
        })
    }
    return {
        createLearningTrack,
        deleteLearningTrack,
        reOrderLearningTrackCourses,
        deleteCourse,
    }
}
