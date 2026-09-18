import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/prisma/prisma'
import { Methods } from '@/services/http'
import { Prisma } from '@prisma/client'
import { getSession } from 'next-auth/react'

export const getDeckQuestions = async (id: string) =>
    await prisma.deck.findUnique({
        where: {
            id,
        },
        include: {
            questions: {
                where: {
                    archived: false,
                },
                include: {
                    options: true,
                },
            },
        },
    })

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const {
        query: { path },
        method,
    } = req

    if (!Array.isArray(path) || !path[0] || (method === Methods.DELETE && !path[1])) {
        return void res.status(400).json({ error: 'Provide the deck and question identifiers required for this request' })
    }
    const session = await getSession({ req })

    if (session?.user) {
        //path 0 is our deckId
        if (path[0]) {
            switch (method) {
                case Methods.GET:
                    try {
                        const deckQuestions = await getDeckQuestions(path[0])
                        res.status(200).json(deckQuestions)
                    } catch (err) {
                        console.log(
                            'There was an error fetching the Questions for this deck...',
                            path[0],
                            '... error: ',
                            err
                        )
                        res.status(403).json({
                            err: `Error fetching this Decks Questions: ${err}`,
                        })
                    }
                    break
                case Methods.PUT:
                    try {
                        console.log('putting...', req.body)
                        const updatedDeck = await prisma.deck.update({
                            where: {
                                //deck id
                                id: path[0] as string,
                            },
                            data: { ...req.body },
                            include: {
                                questions: {
                                    include: {
                                        options: true,
                                    },
                                },
                            },
                        })
                        console.log('this is our updated deck', updatedDeck)
                        res.status(200).json(updatedDeck)
                    } catch (err) {
                        console.log('Error updating the deck ', err)
                        res.status(403).json({
                            err: `Error updating the deck: ${err}`,
                        })
                    }
                    break
                case Methods.DELETE:
                    try {
                        const questionId = path[1] as string

                        const hasGameHistory =
                            await prisma.gameAnswer.findFirst({
                                where: {
                                    //our question id
                                    questionId: questionId,
                                },
                            })

                        //if we have game history, we will archive, else lets delete the question
                        const archiveOrDelete = {
                            ...(hasGameHistory
                                ? {
                                      update: {
                                          where: {
                                              //our question id
                                              id: questionId,
                                          },
                                          data: {
                                              archived: true,
                                          },
                                      },
                                  }
                                : {
                                      delete: {
                                          id: questionId,
                                      },
                                  }),
                        }

                        let updatedDeckQuestions = await prisma.deck.update({
                            where: {
                                //deck id
                                id: path[0] as string,
                            },
                            data: {
                                questions: archiveOrDelete,
                            },
                            include: {
                                questions: {
                                    include: {
                                        options: true,
                                    },
                                },
                            },
                        })

                        res.status(200).json(updatedDeckQuestions)
                    } catch (err) {
                        console.log(
                            'error trying to delete deck question ',
                            err
                        )
                        res.status(403).json({
                            err: `Error trying to delete deck question ${err}`,
                        })
                    }
                    break
            }
        } else {
            console.log(
                'There was an error fetching the Questions for this deck ... Provide a deck id '
            )
            res.status(403).json({ err: `Need to pass a deck id.` })
        }
    } else {
        res.status(401).json({
            err: 'You must be an authorized user to view this endpoint. Please sign-in',
        })
    }
}
