import useSWR from 'swr'
import { Prisma } from '@prisma/client'

const fullQuestionFeedback = Prisma.validator<Prisma.QuestionFeedbackDefaultArgs>()({
    include: {
        comments: {
            include: {
                user: true,
            },
        },
        rating: true,
        resources: {
            include: {
                user: true,
                comments: {
                    include: {
                        user: true,
                    },
                },
            },
        },
    },
})

export type FullQuestionFeedback = Prisma.QuestionFeedbackGetPayload<
    typeof fullQuestionFeedback
>

const fullQuestionResource = Prisma.validator<Prisma.ResourceCommentsDefaultArgs>()({
    include: {
        user: true,
    },
})

export type FullResourceComment = Prisma.ResourceCommentsGetPayload<
    typeof fullQuestionResource
>

const fullQuestionComment = Prisma.validator<Prisma.QuestionCommentsDefaultArgs>()({
    include: {
        user: true,
    },
})

export type FullQuestionComment = Prisma.QuestionCommentsGetPayload<
    typeof fullQuestionComment
>

//this hook is used to have a custom useSWR hook where we get the data for our questions.
export const useFeedbackSWR = (questionId: string) => {
    const { data } = useSWR(`/api/questions/feedback/${questionId}`)
    return data as FullQuestionFeedback
}
