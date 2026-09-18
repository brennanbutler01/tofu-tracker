import type { TrackInput } from '@/server/contentAuthoring'
import type { ITrackForm } from '@/components/learningTracks/TrackForm'
import type { LearningTrackWithOrderedCourses } from '@/pages/api/learningTracks'
import { orderedSelection } from '@/utils/orderedSelection'
import { http } from '../http'
export const trackFormInput = (values: ITrackForm): TrackInput => ({
    title: values.title,
    description: values.description,
    courseIds: orderedSelection(values.courses, values.courseOrder),
})
export const learningTrackService = {
    createTrack: (data: TrackInput) =>
        http.request<LearningTrackWithOrderedCourses>({
            method: 'POST',
            url: '/learningTracks',
            data,
        }),
    updateTrack: (id: string, data: Partial<TrackInput>) =>
        http.request<LearningTrackWithOrderedCourses>({
            method: 'PUT',
            url: `/learningTracks/${id}`,
            data,
        }),
    deleteTrack: (id: string) => http.delete(`/learningTracks/${id}`),
}
