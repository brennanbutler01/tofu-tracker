import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { CorrectStatus, Prisma, Roles } from '@prisma/client'
import prisma from '@/prisma/prisma'

export const getInitialAnswersToGrade = async () =>
    await prisma.gameAnswer.findMany({
        where: {
            isCorrect: {
                equals: CorrectStatus.NEEDS_GRADED,
            },
        },
        include: {
            userAnswer: true,
            question: true,
            GameSession: true,
        },
    })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req
    const session = await getSession({ req })
    const { cursor } = req.query

    if (session?.user?.role === Roles.ADMIN) {
        try {
            const answersToGrade = await getInitialAnswersToGrade()
            res.status(200).json(answersToGrade)
        } catch (err) {
            console.log('Error getting answers to grade', err)
            res.status(403).json({
                err: 'Error getting answers to grade' + err,
            })
        }
    } else if (session?.user?.role === Roles.USER) {
        res.status(401).json({
            err: 'You need to be an admin user to view this endpoint - please talk to your leadership for access or wait for them to grade your answers.',
        })
    } else {
        res.status(401).json({
            err: 'You must be authenticated to view this endpoint. Please sign-in.',
        })
    }
}

export default handler
