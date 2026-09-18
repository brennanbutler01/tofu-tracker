import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { Methods } from '@/services/http'
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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })
    const { method } = req

    if (session?.user?.userId) {
        switch (method) {
            case Methods.GET:
                try {
                    const gradedResponses = await getGradedResponsesForUser(
                        session?.user?.userId
                    )
                    res.status(200).json(gradedResponses)
                } catch (err) {
                    console.log('Error getting graded responses ' + err)
                    res.status(403).json({
                        err: `Error getting graded responses... ${err}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err: `Error - This api endpoint does not accept ${method} requests`,
                })
        }
    } else {
        res.status(401).json({
            err: `You must be authorized to view this endpoint. Please signin.`,
        })
    }
}

export default handler
