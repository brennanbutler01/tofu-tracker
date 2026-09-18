import { http } from '@/services/http'
import type { FeedbackAction } from '@/server/questionFeedback'
import type { FullQuestionFeedback } from '@/server/feedbackShapes'
export const feedbackService = {
    modifyFeedback: (questionId: string, data: FeedbackAction) =>
        http.request<FullQuestionFeedback>({
            method: 'PUT',
            url: `/questions/feedback/${questionId}`,
            data,
        }),
}
