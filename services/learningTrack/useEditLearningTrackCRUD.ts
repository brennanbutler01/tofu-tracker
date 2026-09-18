import { message } from 'antd'
import { useSWRConfig } from 'swr'
import type { ITrackForm } from '@/components/learningTracks/TrackForm'
import { learningTrackService, trackFormInput } from './learningTrackService'
import { LEARNING_TRACK_API } from './useLearningTrackCRUD'
export const useEditLearningTrackCRUD = () => {
    const { mutate } = useSWRConfig()
    const editLearningTrack = async ({
        id,
        ...values
    }: ITrackForm & { id: string }) => {
        try {
            const result = await learningTrackService.updateTrack(
                id,
                trackFormInput(values)
            )
            await mutate(`${LEARNING_TRACK_API}/${id}`, result.data, false)
            await mutate(LEARNING_TRACK_API)
            await mutate(`/api/courseOrder/${id}`)
            message.success('Learning track saved.')
            return true
        } catch {
            message.error(
                'Could not save this learning track. Your entries are still here.'
            )
            return false
        }
    }
    return { editLearningTrack }
}
