import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { Methods } from '@/services/http'
import { Prisma, Roles } from '@prisma/client'
import prisma from '@/prisma/prisma'

export const fullGradingSession = Prisma.validator<Prisma.GradingSessionDefaultArgs>()(
    {
        include: {
            gradedBy: true,
            answersToGrade: {
                include: {
                    userAnswer: true,
                    question: true,
                    player: true,
                    critique: {
                        include: {
                            resources: true,
                        },
                    },
                },
            },
        },
    }
)

export type FullGradingSession = Prisma.GradingSessionGetPayload<
    typeof fullGradingSession
>

export const getGradingSession = async (
    id: string
): Promise<FullGradingSession | null> =>
    await prisma.gradingSession.findUnique({
        where: {
            id,
        },
        ...fullGradingSession,
    })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req
    const session = await getSession({ req })
    const id = req.query.id

    if (session?.user?.role === Roles.ADMIN) {
        switch (method) {
            case Methods.GET:
                try {
                    const gradingSession = await getGradingSession(id as string)
                    res.status(200).json(gradingSession)
                } catch (err) {
                    console.log('Error trying to get grading session ', err)
                    res.status(403).json({
                        err: `Error trying to fetch grading session ${err}`,
                    })
                }
                break
            case Methods.PUT:
                try {
                    const updatedGradingSession =
                        await prisma.gradingSession.update({
                            where: {
                                id: id as string,
                            },
                            data: req.body,
                            include: fullGradingSession?.include,
                        })
                    console.log('updated Session', updatedGradingSession)
                    res.status(200).json(updatedGradingSession)
                } catch (err) {
                    console.log('error updating grading session', err)
                    res.status(403).json({
                        err: `Error updating grading session ${err}`,
                    })
                }
                break
            default:
                console.log(
                    `Error updating grading session - This api endpoint does not accept ${method} requests`
                )
                res.status(403).json({
                    err: `Error updating grading session - This api endpoint does not accept ${method} requests`,
                })
        }
    } else {
        res.status(401).json({
            err: 'This api endpoint requires authentication. Please sign in.',
        })
    }
}
export default handler
