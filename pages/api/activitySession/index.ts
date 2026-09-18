import prisma from '@/prisma/prisma'
import { Methods } from '@/services/http'
import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { gameWithQuestionsOptions } from '../games/[id]'

export const fullActivitySessions =
    Prisma.validator<Prisma.ActivitySessionDefaultArgs>()({
        include: {
            activity: true,
            gameSession: gameWithQuestionsOptions,
        },
    })

export type FullActivitySession = Prisma.ActivitySessionGetPayload<
    typeof fullActivitySessions
>

export const getActivitySessions = async (userId: string) =>
    await prisma.activitySession.findMany({
        ...fullActivitySessions,
        where: {
            userId,
        },
    })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })
    const { method } = req

    if (session?.user?.userId) {
        switch (method) {
            case Methods.GET:
                try {
                    const activitySessions = await getActivitySessions(
                        session?.user?.userId
                    )
                    res.status(200).json(activitySessions)
                } catch (err) {
                    console.log(
                        'There was an error trying to get the activity sessions',
                        err
                    )
                    res.status(403).json({
                        err: `There was an error trying to get the activity sesisons - ${err}`,
                    })
                }
                break
            case Methods.POST:
                try {
                    const newActivitySessions =
                        await prisma.activitySession.create({
                            data: req.body,
                            ...fullActivitySessions,
                        })
                    res.status(200).json(newActivitySessions)
                } catch (err) {
                    console.log(
                        'There was an error creating this activity session',
                        err
                    )
                    res.status(403).json({
                        err: `There was an error creating this activity session - ${err}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err: `This api endpoint does not accept ${method} requests`,
                })
        }
    } else {
        res.status(403).json({
            err: 'You must be authenticated to view this api endpoint',
        })
    }
}

export default handler
