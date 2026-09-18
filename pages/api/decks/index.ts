// noinspection JSUnusedGlobalSymbols

import { NextApiRequest, NextApiResponse } from 'next'
import { Methods } from '@/services/http'
import prisma from '@/prisma/prisma'
import { Prisma } from '@prisma/client'
import { getSession } from 'next-auth/react'

const decksWithQuestionCount = Prisma.validator<Prisma.DeckDefaultArgs>()({
    include: {
        _count: true,
        questions: {
            where: {
                archived: {
                    not: true,
                },
            },
        },
    },
})

export type DeckWithQuestionCount = Prisma.DeckGetPayload<
    typeof decksWithQuestionCount
>

//get our deck with a count of questions for each one that isn't archived!
export const getDeckQuestionCount = async (): Promise<
    Array<DeckWithQuestionCount>
> =>
    prisma.deck.findMany({
        where: {
            archived: {
                not: true,
            },
        },
        include: {
            _count: true,
            questions: {
                where: {
                    archived: {
                        not: true,
                    },
                },
            },
        },
    })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req
    const session = await getSession({ req })
    if (session?.user) {
        switch (method) {
            case Methods.GET:
                try {
                    const decks = await getDeckQuestionCount()
                    res.status(200).json(decks)
                } catch (error) {
                    res.status(403).json({
                        err: `Error while getting decks. Error: ${error}`,
                    })
                }
                break

            case Methods.POST:
                try {
                    const newDeck = await prisma.deck.create({
                        data: {
                            ...req.body,
                        },
                    })

                    res.status(200).json(newDeck)
                } catch (error) {
                    res.status(403).json({
                        err: `Error while creating deck. Error: ${error}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err: `${method} requests are not supported by this api endpoint.`,
                })
        }
    } else {
        res.status(401).json({
            err: 'You need to be an authorized user to view decks - Please sign in.',
        })
    }
}
export default handler
