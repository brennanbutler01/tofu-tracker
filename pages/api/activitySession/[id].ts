import prisma from '@/prisma/prisma'
import { Methods } from '@/services/http'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { fullActivitySessions } from '.'

export const getActivitySession = async (id: string) =>
    await prisma.activitySession.findUnique({
        where: {
            id,
        },
        ...fullActivitySessions,
    })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })
    const { method } = req

    if (session?.user?.userId) {
        switch (method) {
            case Methods.GET:
                try {
                    const activitySession = await getActivitySession(
                        req.query.id as string
                    )
                    res.status(200).json(activitySession)
                } catch (err) {
                    res.status(403).json({
                        err: `There was an error trying to fetch this activity session - ${err}`,
                    })
                    console.log(
                        'There was an error trying to fetch this activity session ',
                        err
                    )
                }
                break
            case Methods.PUT:
                try {
                    console.log('body', req.body)
                    const updatedActivitySession =
                        await prisma.activitySession.update({
                            where: {
                                id: req.query.id as string,
                            },
                            data: {
                                ...req.body,
                            },
                            ...fullActivitySessions,
                        })
                    res.status(200).json(updatedActivitySession)
                } catch (err) {
                    res.status(403).json({
                        err: `There was an error trying to update activity session - ${err}`,
                    })
                    console.log(
                        'There was an error trying to update activity session ',
                        err
                    )
                }
                break
            default:
                res.status(403).json({
                    err: `This api endpoint does not accept ${method} requests`,
                })
        }
    } else {
        res.status(401).json({
            err: 'You must be authorized to view this api endpoint',
        })
    }
}

export default handler
