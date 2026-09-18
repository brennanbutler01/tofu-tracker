import { Prisma } from '@prisma/client'
import { http } from '@/services/http'

class FeedbackService {
    private FEEDBACK_ENDPOINT = (id: string) => '/questions/feedback/' + id

    modifyFeedback = async (
        questionId: string,
        feedback: Prisma.QuestionFeedbackUpdateInput
    ) => await http.put(this.FEEDBACK_ENDPOINT(questionId), feedback)

    createFeedback = async (
        questionId: string,
        feedback: Prisma.QuestionFeedbackCreateInput
    ) => await http.post(this.FEEDBACK_ENDPOINT(questionId), feedback)
}

export const feedbackService = new FeedbackService()
