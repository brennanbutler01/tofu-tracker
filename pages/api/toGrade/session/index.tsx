import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { Methods } from '@/services/http'
import { Roles } from '@prisma/client'
import prisma from '@/prisma/prisma'
import {
    fullGradingSession,
    FullGradingSession,
} from '@/pages/api/toGrade/session/[id]'

export const getGradingSessions = async (): Promise<
    Array<FullGradingSession>
> =>
    await prisma.gradingSession.findMany({
        ...fullGradingSession,
    })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req
    const session = await getSession({ req })

    if (session?.user?.role === Roles.ADMIN) {
        switch (method) {
            case Methods.GET:
                try {
                    const gradingSessions = await getGradingSessions()
                    res.status(200).json(gradingSessions)
                } catch (err) {
                    res.status(403).json({
                        err: `Error getting grading sessions ${err}`,
                    })
                }
                break
            case Methods.POST:
                try {
                    const newSession: FullGradingSession =
                        await prisma.gradingSession.create({
                            data: req.body,
                            ...fullGradingSession,
                        })
                    res.status(200).json(newSession)
                } catch (err) {
                    res.status(403).json({
                        err: `Error adding grading session ${err}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err: `API endpoint doesnt accept ${method} requests`,
                })
        }
    } else {
        res.status(401).json({
            err: 'This api endpoint requires authorization and you must be an admin. Please sign in',
        })
    }
}
export default handler
