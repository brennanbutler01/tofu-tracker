import { apiHandler } from '@/server/apiHandler'
import prisma from '@/prisma/prisma'
import { CorrectStatus, Prisma, QuestionType } from '@prisma/client'
const userGradedResponses = Prisma.validator<Prisma.GameAnswerDefaultArgs>()({
    include: {
        question: true,
        critique: {
            include: {
                resources: true,
                gradedBy: true,
            },
        },
        userAnswer: true,
        player: true,
    },
})
export type GradedUserResponse = Prisma.GameAnswerGetPayload<
    typeof userGradedResponses
>

export const getGradedResponsesForUser = async (
    userId: string
): Promise<Array<GradedUserResponse>> =>
    await prisma.gameAnswer.findMany({
        take: 100,
        orderBy: { created: 'desc' },
        where: {
            playerId: userId,
            AND: {
                question: {
                    type: {
                        equals: QuestionType.FREE_RESPONSE,
                    },
                },
                AND: {
                    isCorrect: {
                        not: CorrectStatus.NEEDS_GRADED,
                    },
                },
            },
        },
        include: {
            question: true,
            critique: {
                include: {
                    resources: true,
                    gradedBy: true,
                },
            },
            userAnswer: true,
            player: true,
        },
    })

export default apiHandler(['GET'], async (_req, res, viewer) => {
    res.status(200).json(await getGradedResponsesForUser(viewer.userId))
})
