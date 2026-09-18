import type { UserFeedback } from '@prisma/client'
import type { IFeedbackForm } from '@/components/userFeedback/FeedbackForm'
import { http } from '../http'
export const userFeedbackService = {
    createUserFeedback: (data: IFeedbackForm) =>
        http.request<UserFeedback>({
            method: 'POST',
            url: '/userFeedback',
            data,
        }),
}
