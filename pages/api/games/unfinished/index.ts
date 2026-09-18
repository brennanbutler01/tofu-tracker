import { NextApiRequest, NextApiResponse } from 'next'
import { Methods } from '@/services/http'
import prisma from '@/prisma/prisma'
import { getSession } from 'next-auth/react'
import { Prisma, GameTypes } from '@prisma/client'
import { apiHandler } from 'server/apiHandler'

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
            type: GameTypes.FREE,
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
            type: GameTypes.FREE,
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

export default apiHandler(['GET'], async (req, res, viewer) => {
    res.json(await getUnfinishedGames(viewer.userId))
})
