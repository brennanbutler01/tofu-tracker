import { NextApiRequest, NextApiResponse } from 'next'
import { Methods } from '@/services/http'
import prisma from '@/prisma/prisma'
import { getSession } from 'next-auth/react'
import { gameWithQuestionsOptions } from '../games/[id]'
import { GameTypes } from '@prisma/client'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req
    const session = await getSession({ req })

    if (session?.user) {
        switch (method) {
            case Methods.GET:
                try {
                    const gameSessions = await prisma.gameSession.findMany({
                        ...gameWithQuestionsOptions,
                        where: {
                            userId: session?.user?.userId,
                            AND: {
                                type: GameTypes.FREE,
                            },
                        },
                    })
                    res.status(200).json(gameSessions)
                } catch (err) {
                    res.status(403).json({
                        err: `Error fetching Game Session : ${err} `,
                    })
                    console.log(`Error fetching Game Session : ${err}`)
                }
                break
            case Methods.POST:
                try {
                    const newSession = await prisma.gameSession.create({
                        data: req.body,
                        ...gameWithQuestionsOptions,
                    })
                    res.status(200).json(newSession)
                } catch (err) {
                    res.status(403).json({
                        err: `Error creating Game Session: ${err}`,
                    })
                    console.log(`Error creating Game Session: ${err}`)
                }
                console.log('posting game')
                break

            default:
                res.status(403).json({
                    err: `This api endpoint does not accept ${method} requests. `,
                })
        }
    } else {
        res.status(401).json({
            err: 'You must be an authorized user to view this endpoint. Please sign-in',
        })
    }
}

export default handler
