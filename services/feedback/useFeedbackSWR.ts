import useSWR from 'swr'
import type { FullQuestionFeedback } from '@/server/feedbackShapes'
export type {
    FullQuestionFeedback,
    FullQuestionComment,
    FullResourceComment,
} from '@/server/feedbackShapes'
export const useFeedbackSWR = (questionId: string) => {
    const { data } = useSWR<FullQuestionFeedback | null>(
        questionId ? `/api/questions/feedback/${questionId}` : null
    )
    return data
}
