// noinspection JSUnusedGlobalSymbols

import { NextApiRequest, NextApiResponse } from 'next'
import { Methods } from '@/services/http'
import prisma from '@/prisma/prisma'
import { getSession } from 'next-auth/react'
import { getDeckQuestions } from '@/pages/api/decks/questions/[...path]'
import { includes } from 'superjson/dist/util'
import { Prisma } from '@prisma/client'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method, query, body } = req
    const session = await getSession({ req })

    if (session?.user) {
        switch (method) {
            case Methods.GET:
                try {
                    const deck = await getDeckQuestions(query.id as string)
                    res.status(200).json(deck)
                } catch (err) {
                    console.log(`Error fetching Deck. Error: ${err}`)
                    res.status(403).json({
                        err: `Error fetching Deck. Error: ${err}`,
                    })
                }
                break
            case Methods.PUT:
                try {
                    const deck = await prisma.deck.update({
                        where: { id: query.id as string },
                        data: {
                            ...body,
                        },
                    })
                    console.log(deck)
                    res.status(200).json(deck)
                } catch (error) {
                    res.status(403).json({
                        err: `Error while updating deck. Error: ${error}`,
                    })
                }
                break

            case Methods.DELETE:
                try {
                    //try to find all of the question ids for our deck
                    const getDeckQuestions = (
                        await prisma.deck.findUnique({
                            where: {
                                id: query.id as string,
                            },
                            select: {
                                questions: {
                                    select: {
                                        id: true,
                                    },
                                },
                            },
                        })
                    )?.questions //format them into a string array - they originally are nested in an object
                        .map(({ id }) => id)

                    //check to see if we have a game history that involves any questions in the deck
                    const hasGameHistory = await prisma.gameAnswer.findFirst({
                        where: {
                            questionId: {
                                //check to see if the question id of the game is equal to any of the deck questions
                                in: getDeckQuestions || [],
                            },
                        },
                    })

                    let newDeck

                    //if we have a game history
                    if (hasGameHistory) {
                        //we will update and just archive the game, not delete it
                        newDeck = await prisma.deck.update({
                            where: {
                                id: query.id as string,
                            },
                            data: { archived: true },
                        })
                    } else {
                        //else we will delete it
                        newDeck = await prisma.deck.delete({
                            where: {
                                id: query.id as string,
                            },
                        })
                    }

                    res.status(200).json(newDeck)
                } catch (error) {
                    res.status(403).json({
                        err: `Error while deleting deck. Error: ${error}`,
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
            err: 'You must be an authorized user to view this endpoint. Please sign-in',
        })
    }
}
