import { NextApiRequest, NextApiResponse } from 'next'
import { Methods } from '@/services/http'
import prisma from '@/prisma/prisma'
import { getSession } from 'next-auth/react'
import { Prisma } from '@prisma/client'

const gamesWithOptions = Prisma.validator<Prisma.GameSessionDefaultArgs>()({
    include: {
        questions: {
            include: {
                options: true,
            },
        },
        answerHistory: true,
    },
})

export type GameWithOptions = Prisma.GameSessionGetPayload<
    typeof gamesWithOptions
>

//used to find our games that are not yet finished, so we can resume
export const getUnfinishedGames = async (
    userId: string
): Promise<Array<GameWithOptions>> =>
    await prisma.gameSession.findMany({
        where: {
            userId,
            AND: {
                isComplete: {
                    equals: false,
                },
            },
        },
        ...gamesWithOptions,
    })

//recently finished games
export const getFinishedGames = async (userId: string) =>
    await prisma.gameSession.findMany({
        where: {
            userId,
            AND: {
                isComplete: {
                    equals: true,
                },
            },
        },
        ...gamesWithOptions,
        orderBy: {
            completedAt: 'desc',
        },
    })

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req
    const session = await getSession({ req })

    if (session?.user?.userId) {
        switch (method) {
            case Methods.GET:
                try {
                    const unfinishedGames = await getUnfinishedGames(
                        session?.user?.userId
                    )
                    res.status(200).json(unfinishedGames)
                } catch (e) {
                    console.log(`Error getting unfinished games - ${e}`)
                    res.status(403).json({
                        err: `Error getting unfinished games - ${e}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err: `The api endpoint for unfinished games only accepts GET requests. ${method} requests aren't supported.`,
                })
        }
    } else {
        res.status(401).json({
            err: 'You must be an authorized user to use this endpoint. Please sign in.',
        })
    }
}
