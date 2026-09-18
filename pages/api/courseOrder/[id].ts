import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { Methods } from '@/services/http'
import prisma from '@/prisma/prisma'

export const getCourseOrdersForTrack = async (id: string) =>
    await prisma.courseOrder.findMany({
        where: {
            learningTrackId: id,
        },
    })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })
    const { method } = req

    if (session?.user?.userId) {
        switch (method) {
            case Methods.GET:
                try {
                    const courseOrder = await getCourseOrdersForTrack(
                        req.query.id as string
                    )

                    res.status(200).json(courseOrder)
                } catch (err) {
                    res.status(403).json({
                        err: `There was an error trying to get CourseOrder  - ${err}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err: `This api endpoint doesnt accept ${method} requests`,
                })
        }
    } else {
        res.status(401).json({
            err: 'This api endpoint requires authentication to view.',
        })
    }
}

export default handler
