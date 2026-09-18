import type { IFeedbackForm } from '@/components/userFeedback/FeedbackForm'
import { message } from 'antd'
import { useSWRConfig } from 'swr'
import { userFeedbackService } from './userFeedbackService'
export const USER_FEEDBACK_API = '/api/userFeedback'
export const useUserFeedbackCRUD = () => {
    const { mutate } = useSWRConfig()
    const createFeedback = async (values: IFeedbackForm) => {
        try {
            await userFeedbackService.createUserFeedback(values)
            await mutate(USER_FEEDBACK_API)
            message.success('Feedback saved. Thank you.')
            return true
        } catch {
            message.error('Could not save your feedback. Please try again.')
            return false
        }
    }
    return { createFeedback }
}
