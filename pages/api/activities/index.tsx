import prisma from '@/prisma/prisma'
import { Methods } from '@/services/http'
import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export const activityWithQuestions = Prisma.validator<Prisma.ActivityDefaultArgs>()({
    include: {
        questions: true,
    },
})

export type ActivityWithQuestion = Prisma.ActivityGetPayload<
    typeof activityWithQuestions
>

export const getActivities = async () =>
    await prisma.activity.findMany({ ...activityWithQuestions })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })
    const { method } = req

    if (session?.user) {
        switch (method) {
            case Methods.GET:
                try {
                    const activities = await getActivities()
                    res.status(200).json(activities)
                } catch (err) {
                    res.status(403).json({
                        err: `Error fetching activities: ${err}`,
                    })
                }
                break
            case Methods.POST:
                try {
                    console.log('req.body', req.body)
                    const newActivity = await prisma.activity.create({
                        data: {
                            ...req.body,
                        },
                    })
                    res.status(200).json(newActivity)
                } catch (err) {
                    res.status(403).json({
                        err: `Error creating activity : ${err}`,
                    })
                }
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
