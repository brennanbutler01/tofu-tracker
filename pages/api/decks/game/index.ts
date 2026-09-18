import { NextApiRequest, NextApiResponse } from 'next'
import { Methods } from '@/services/http'
import prisma from '@/prisma/prisma'
import { Prisma } from '@prisma/client'
import { getSession } from 'next-auth/react'

//this function gets all of our decks with their questions and all of their options to allow us to play our game
export const getDecksWithQuestionOptions = async (): Promise<
    Array<DecksWithQuestionOptions>
> =>
    await prisma.deck.findMany({
        where: {
            archived: {
                not: true,
            },
        },
        include: {
            questions: {
                include: {
                    options: true,
                },
                where: {
                    archived: {
                        not: true,
                    },
                },
            },
        },
    })

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req
    const session = await getSession({ req })
    if (session?.user) {
        switch (method) {
            case Methods.GET:
                try {
                    const decks = await getDecksWithQuestionOptions()
                    res.status(200).json(decks)
                } catch (err) {
                    res.status(403).json({
                        err: `Error while trying to fetch decks and questions/options for the game. See: ${err}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err: `This endpoint only supports GET requests and you tried to ${method}`,
                })
        }
    } else {
        res.status(401).json({
            err: `This api endpoint requires authorization. Please sign in to view the decks with question options.`,
        })
    }
}

const decksWithQuestionOptions = Prisma.validator<Prisma.DeckDefaultArgs>()({
    include: {
        questions: {
            include: {
                options: true,
            },
        },
    },
})
export type DecksWithQuestionOptions = Prisma.DeckGetPayload<
    typeof decksWithQuestionOptions
>
