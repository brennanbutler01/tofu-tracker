import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { Methods } from '@/services/http'
import prisma from '@/prisma/prisma'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req
    const { id } = req.query
    const session = await getSession({ req })

    if (session?.user?.userId) {
        switch (method) {
            case Methods.DELETE:
                try {
                    const unfinishedGames = await prisma.gameSession.delete({
                        where: {
                            id: id as string,
                        },
                        include: {
                            questions: true,
                        },
                    })
                    res.status(200).json(unfinishedGames)
                } catch (err) {
                    console.log(`Error deleting unfinished game: ${err}`)
                    res.status(403).json({
                        err: `Error deleting unfinished game. ${err}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err: `This api endpoint does not accept ${method} requests, only delete requests.`,
                })
        }
    } else {
        res.status(401).json({
            err: 'This API endpoint requires authentication. Please sign-in and try again.',
        })
    }
}
