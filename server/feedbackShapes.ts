import { Prisma } from '@prisma/client'
export const feedbackUser = { select: { id: true, name: true, image: true } }
export const fullQuestionFeedback =
    Prisma.validator<Prisma.QuestionFeedbackDefaultArgs>()({
        include: {
            comments: {
                include: { user: feedbackUser },
                orderBy: [{ created: 'asc' }, { id: 'asc' }],
                take: 100,
            },
            rating: true,
            resources: {
                include: {
                    user: feedbackUser,
                    comments: {
                        include: { user: feedbackUser },
                        orderBy: [{ created: 'asc' }, { id: 'asc' }],
                        take: 100,
                    },
                },
                orderBy: [{ created: 'asc' }, { id: 'asc' }],
                take: 50,
            },
        },
    })
export type FullQuestionFeedback = Prisma.QuestionFeedbackGetPayload<
    typeof fullQuestionFeedback
>
export type FullQuestionComment = FullQuestionFeedback['comments'][number]
export type ResourceWithComments = FullQuestionFeedback['resources'][number]
export type FullResourceComment = ResourceWithComments['comments'][number]
