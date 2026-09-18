import { Prisma } from '@prisma/client'
export const fullGradingSession =
    Prisma.validator<Prisma.GradingSessionDefaultArgs>()({
        include: {
            gradedBy: true,
            answersToGrade: {
                orderBy: [{ created: 'asc' }, { id: 'asc' }],
                include: {
                    userAnswer: true,
                    question: true,
                    player: true,
                    critique: { include: { resources: true } },
                },
            },
        },
    })
export type FullGradingSession = Prisma.GradingSessionGetPayload<
    typeof fullGradingSession
>
export const answersToGrade = Prisma.validator<Prisma.GameAnswerDefaultArgs>()({
    include: { userAnswer: true, question: true, GameSession: true },
})
export type AnswersToGrade = Prisma.GameAnswerGetPayload<typeof answersToGrade>
