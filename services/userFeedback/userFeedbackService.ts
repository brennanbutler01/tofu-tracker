import { Prisma } from '@prisma/client'
import { http } from '../http'

class UserFeedbackService {
    private FEEDBACK_ENDPOINT = '/userFeedback'

    createUserFeedback = async (userFeedback: Prisma.UserFeedbackCreateInput) =>
        await http.post<Prisma.UserFeedbackCreateInput>(
            this.FEEDBACK_ENDPOINT,
            userFeedback
        )
}

export const userFeedbackService = new UserFeedbackService()
