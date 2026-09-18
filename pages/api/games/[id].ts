import { NextApiHandler } from 'next'
import prisma from '@/prisma/prisma'
import { Methods } from '@/services/http'
import { getSession } from 'next-auth/react'
import { Prisma } from '@prisma/client'

export const getGameWithFullOptions = async (id: string) =>
    await prisma.gameSession.findUnique({
        where: { id: id as string },
        ...gameWithQuestionsOptions,
    })

const handler: NextApiHandler = async (req, res) => {
    const { id } = req.query
    const session = await getSession({ req })

    if (session?.user) {
        switch (req.method) {
            case Methods.GET:
                try {
                    const game = await getGameWithFullOptions(id as string)
                    res.status(200).json(game)
                } catch (err) {
                    console.log`Error fetching game session: ${err}`
                    res.status(403).json({
                        err: `Error trying to fetch game session: ${err}`,
                    })
                }
                break
            case Methods.PUT:
                try {
                    const updatedGame = await prisma.gameSession.update({
                        where: {
                            id: id as string,
                        },
                        data: { ...req.body },
                        ...gameWithQuestionsOptions,
                    })
                    res.status(200).json(updatedGame)
                } catch (err) {
                    console.log(`Error updating game session: ${err}`)
                    res.status(403).json({
                        err: `Error trying to update game session: ${err}`,
                    })
                }
                break
            case Methods.DELETE:
                try {
                } catch (err) {
                    console.log(`Error deleting game session: ${err}`)
                    res.status(403).json({
                        err: `Error trying to delete game session: ${err}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err: `Error --- this api endpoint does not accept ${req.method} requests. `,
                })
        }
    } else {
        res.status(401).json({
            err: 'Error, this api endpoint requires authentication. Please sign-in!',
        })
    }
}

export default handler

export const gameWithQuestionsOptions =
    Prisma.validator<Prisma.GameSessionDefaultArgs>()({
        include: {
            questions: {
                include: {
                    options: true,
                },
            },
            answerHistory: {
                include: {
                    question: {
                        include: {
                            options: true,
                        },
                    },
                    userAnswer: true,
                },
            },
        },
    })
export type GameWithFullOptions = Prisma.GameSessionGetPayload<
    typeof gameWithQuestionsOptions
>
const gameAnswerWithQuestionAnswer = Prisma.validator<Prisma.GameAnswerDefaultArgs>()({
    include: {
        question: {
            include: {
                options: true,
            },
        },
        userAnswer: true,
    },
})
export type GameAnswerWithQuestionAnswer = Prisma.GameAnswerGetPayload<
    typeof gameAnswerWithQuestionAnswer
>
